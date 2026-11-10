import { formatInTimeZone } from 'date-fns-tz'
import { getGiftCardDetailsByCode } from '@/lib/notion-gift-card-lookup'
import {
  canMarkGiftCardUsed,
  canUndoGiftCardUsed,
  resolveGiftCardPublicKind,
  tallinnToday,
  TALLINN_TZ,
  type GiftCardPublicKind,
  type TodayVisitor,
} from '@/lib/gift-card-status'

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFC')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/õ/g, 'o')
    .replace(/\s+/g, '')
}

async function fetchNotion(url: string, options: RequestInit) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  try {
    return await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timeoutId)
  }
}

function notionHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }
}

function envConfig() {
  const apiKey = process.env.NOTION_API_KEY
  const giftCardsDb = process.env.NOTION_GIFT_CARDS_DATABASE_ID
  const visitsDb = process.env.NOTION_VISITS_DATABASE_ID
  const visitorsDb = process.env.NOTION_VISITORS_DATABASE_ID
  return { apiKey, giftCardsDb, visitsDb, visitorsDb }
}

function isNotionId(id: string): boolean {
  return /^[0-9a-f]{32}$/i.test(id.replace(/-/g, ''))
}

function extractTitle(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title?.[0]?.plain_text ?? ''
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? ''
  return ''
}

function extractTime(prop: any): string | null {
  if (!prop) return null
  if (prop.type === 'select') return prop.select?.name || null
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || null
  if (prop.type === 'title') return prop.title?.[0]?.plain_text || null
  return null
}

function normalizeTimeToHHmm(raw: string | null): string | null {
  if (!raw) return null
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?/)
  if (!match) return null
  const hour = parseInt(match[1], 10)
  if (hour < 0 || hour > 23) return null
  const minute = match[2] ? parseInt(match[2], 10) : 0
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export async function listTodaysVisitors(): Promise<TodayVisitor[]> {
  const { apiKey, visitsDb, visitorsDb } = envConfig()
  if (!apiKey || !visitsDb || !visitorsDb) return []

  const visitsId = visitsDb.replace(/-/g, '')
  const visitorsId = visitorsDb.replace(/-/g, '')
  const today = tallinnToday()

  const visitsMeta = await fetchNotion(`https://api.notion.com/v1/databases/${visitsId}`, {
    method: 'GET',
    headers: notionHeaders(apiKey),
  })
  if (!visitsMeta.ok) {
    console.error('[gift-card-redeem] Külastused DB:', visitsMeta.status)
    return []
  }
  const visitsProps = ((await visitsMeta.json()) as { properties?: Record<string, any> }).properties || {}
  const dateProp =
    Object.keys(visitsProps).find(
      (key) =>
        visitsProps[key]?.type === 'date' &&
        (normalizeKey(key) === 'kuupaev' || normalizeKey(key).includes('kuupaev'))
    ) || Object.keys(visitsProps).find((key) => visitsProps[key]?.type === 'date')
  const timeProp = Object.keys(visitsProps).find((key) => {
    const n = normalizeKey(key)
    return n === 'kellaaeg' || n === 'aeg' || n.includes('kellaaeg')
  })
  if (!dateProp) return []

  const visitPages: any[] = []
  let cursor: string | undefined
  do {
    const body: Record<string, unknown> = {
      filter: { property: dateProp, date: { equals: today } },
      page_size: 50,
    }
    if (cursor) body.start_cursor = cursor
    const res = await fetchNotion(`https://api.notion.com/v1/databases/${visitsId}/query`, {
      method: 'POST',
      headers: notionHeaders(apiKey),
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('[gift-card-redeem] Külastused query:', res.status)
      break
    }
    const data = await res.json()
    visitPages.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor && visitPages.length < 50)

  const visitorsMeta = await fetchNotion(`https://api.notion.com/v1/databases/${visitorsId}`, {
    method: 'GET',
    headers: notionHeaders(apiKey),
  })
  if (!visitorsMeta.ok) return []
  const visitorProps =
    ((await visitorsMeta.json()) as { properties?: Record<string, any> }).properties || {}
  const relationProp =
    (visitorProps['Külastused']?.type === 'relation' ? 'Külastused' : null) ||
    Object.keys(visitorProps).find((key) => {
      const n = normalizeKey(key)
      return visitorProps[key]?.type === 'relation' && n.includes('kulastus')
    })
  const countProp =
    (visitorProps['Arv'] ? 'Arv' : null) ||
    Object.keys(visitorProps).find((key) => {
      const n = normalizeKey(key)
      return n === 'arv'
    })
  const titleProp = Object.keys(visitorProps).find((key) => visitorProps[key]?.type === 'title')
  if (!relationProp) return []

  const out: TodayVisitor[] = []
  for (const visit of visitPages) {
    const pageProps = visit.properties || {}
    const dateValue = pageProps[dateProp]?.date?.start || null
    const timeValue = timeProp ? extractTime(pageProps[timeProp]) : null
    const derivedTime =
      typeof dateValue === 'string' && dateValue.includes('T')
        ? formatInTimeZone(dateValue, TALLINN_TZ, 'HH:mm')
        : null
    const time = normalizeTimeToHHmm(timeValue || derivedTime) || timeValue || derivedTime

    let vCursor: string | undefined
    do {
      const body: Record<string, unknown> = {
        filter: { property: relationProp, relation: { contains: visit.id } },
        page_size: 50,
      }
      if (vCursor) body.start_cursor = vCursor
      const res = await fetchNotion(`https://api.notion.com/v1/databases/${visitorsId}/query`, {
        method: 'POST',
        headers: notionHeaders(apiKey),
        body: JSON.stringify(body),
      })
      if (!res.ok) break
      const data = await res.json()
      for (const visitor of data.results || []) {
        const vp = visitor.properties || {}
        const name = extractTitle(titleProp ? vp[titleProp] : null) || 'Külastaja'
        const countRaw = countProp ? vp[countProp]?.number : null
        out.push({
          id: visitor.id,
          name,
          time,
          count: typeof countRaw === 'number' ? countRaw : null,
        })
      }
      vCursor = data.has_more ? data.next_cursor : undefined
    } while (vCursor)
  }

  out.sort((a, b) => {
    const ta = a.time || ''
    const tb = b.time || ''
    if (ta !== tb) return ta.localeCompare(tb)
    return a.name.localeCompare(b.name, 'et')
  })
  return out
}

export type RedeemErrorCode =
  | 'notFound'
  | 'notMarkable'
  | 'notUndoable'
  | 'visitorInvalid'
  | 'serverConfig'
  | 'notionError'

export type MarkGiftCardResult =
  | { ok: true; visitorLinked: boolean }
  | { ok: false; errorCode: RedeemErrorCode; kind?: GiftCardPublicKind }

export type UndoGiftCardResult = { ok: true } | { ok: false; errorCode: RedeemErrorCode }

async function patchPage(
  apiKey: string,
  pageId: string,
  properties: Record<string, unknown>
): Promise<boolean> {
  const res = await fetchNotion(`https://api.notion.com/v1/pages/${pageId.replace(/-/g, '')}`, {
    method: 'PATCH',
    headers: notionHeaders(apiKey),
    body: JSON.stringify({ properties }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('[gift-card-redeem] PATCH', res.status, text.slice(0, 300))
    return false
  }
  return true
}

export async function markGiftCardUsed(opts: {
  code: string
  visitorId: string | null
}): Promise<MarkGiftCardResult> {
  const { apiKey, giftCardsDb } = envConfig()
  if (!apiKey || !giftCardsDb) return { ok: false, errorCode: 'serverConfig' }

  const details = await getGiftCardDetailsByCode(apiKey, giftCardsDb, opts.code)
  if (!details) return { ok: false, errorCode: 'notFound' }
  if (!canMarkGiftCardUsed(details)) {
    return { ok: false, errorCode: 'notMarkable', kind: resolveGiftCardPublicKind(details) }
  }

  let visitorId = opts.visitorId?.trim() || null
  if (visitorId === 'none') visitorId = null
  if (visitorId) {
    if (!isNotionId(visitorId)) return { ok: false, errorCode: 'visitorInvalid' }
    const today = await listTodaysVisitors()
    if (!today.some((v) => v.id.replace(/-/g, '') === visitorId!.replace(/-/g, ''))) {
      return { ok: false, errorCode: 'visitorInvalid' }
    }
  }

  const today = tallinnToday()
  const marked = await patchPage(apiKey, details.pageId, {
    Staatus: { status: { name: 'Kasutatud' } },
    'Kasutatud kuupäev': { date: { start: today } },
  })
  if (!marked) return { ok: false, errorCode: 'notionError' }

  if (!visitorId) return { ok: true, visitorLinked: false }

  const linked = await patchPage(apiKey, visitorId, {
    Makseviis: { select: { name: 'Kinkekaart' } },
    Kinkekaart: { relation: [{ id: details.pageId }] },
  })
  if (!linked) {
    console.error('[gift-card-redeem] külastaja sidumine ebaõnnestus', visitorId)
  }
  return { ok: true, visitorLinked: linked }
}

async function visitorsLinkedToCard(
  apiKey: string,
  visitorsDb: string,
  giftCardPageId: string
): Promise<any[]> {
  const dbId = visitorsDb.replace(/-/g, '')
  const pages: any[] = []
  let cursor: string | undefined
  do {
    const body: Record<string, unknown> = {
      filter: { property: 'Kinkekaart', relation: { contains: giftCardPageId } },
      page_size: 50,
    }
    if (cursor) body.start_cursor = cursor
    const res = await fetchNotion(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: notionHeaders(apiKey),
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('[gift-card-redeem] linked visitors', res.status, text.slice(0, 200))
      break
    }
    const data = await res.json()
    pages.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)
  return pages
}

export async function undoGiftCardUsed(opts: { code: string }): Promise<UndoGiftCardResult> {
  const { apiKey, giftCardsDb, visitorsDb } = envConfig()
  if (!apiKey || !giftCardsDb) return { ok: false, errorCode: 'serverConfig' }

  const details = await getGiftCardDetailsByCode(apiKey, giftCardsDb, opts.code)
  if (!details) return { ok: false, errorCode: 'notFound' }
  if (!canUndoGiftCardUsed(details)) return { ok: false, errorCode: 'notUndoable' }

  if (visitorsDb) {
    const linked = await visitorsLinkedToCard(apiKey, visitorsDb, details.pageId)
    for (const visitor of linked) {
      const makse = visitor.properties?.Makseviis?.select?.name
      const properties: Record<string, unknown> = {
        Kinkekaart: { relation: [] },
      }
      if (!makse || makse === 'Kinkekaart') {
        properties.Makseviis = { select: null }
      }
      await patchPage(apiKey, visitor.id, properties)
    }
  }

  const restored = await patchPage(apiKey, details.pageId, {
    Staatus: { status: { name: 'Aktiivne' } },
    'Kasutatud kuupäev': { date: null },
  })
  if (!restored) return { ok: false, errorCode: 'notionError' }
  return { ok: true }
}
