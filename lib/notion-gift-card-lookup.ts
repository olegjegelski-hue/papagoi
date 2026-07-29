async function fetchNotion(url: string, options: RequestInit) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export interface GiftCardDetails {
  pageId: string
  code: string
  amountEur: number
  validUntil: string
  buyerName: string | null
  buyerEmail: string | null
  usedAt: string | null
  qrUrl: string | null
}

type NotionGiftCardPropertyMap = Record<string, any>

function getTitlePlain(p: any): string {
  return p?.title?.[0]?.plain_text ?? ''
}

function getRichTextPlain(p: any): string {
  return p?.rich_text?.[0]?.plain_text ?? ''
}

function readValidUntil(p: any): string {
  if (!p) return ''
  if (p.type === 'date') return p.date?.start ?? ''
  if (p.type === 'formula') {
    const f = p.formula
    if (!f) return ''
    // Notion formula võib olla string, date või number
    if (f.type === 'string' && typeof f.string === 'string' && f.string.trim()) return f.string.trim()
    if (f.type === 'date' && f.date?.start) return f.date.start
    if (f.type === 'number' && f.number != null) return String(f.number)
    if (typeof f.string === 'string' && f.string.trim()) return f.string.trim()
    if (f.date?.start) return f.date.start
    return ''
  }
  if (p.type === 'rich_text') return getRichTextPlain(p)
  if (p.type === 'title') return getTitlePlain(p)
  return ''
}

/** Ostukuupäev + 1 aasta (kui Aegub formula on tühi või ei lae). */
function fallbackValidUntilFromPurchase(purchaseIso: string): string {
  const m = purchaseIso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  return `${Number(m[1]) + 1}-${m[2]}-${m[3]}`
}

function readUsedAt(p: any): string | null {
  if (!p) return null
  if (p.type === 'date') return p.date?.start ?? null
  return null
}

function readEmail(p: any): string | null {
  if (!p) return null
  if (p.type === 'email') return p.email ?? null
  if (p.type === 'rich_text') return getRichTextPlain(p) || null
  if (p.type === 'title') return getTitlePlain(p) || null
  return null
}

function normalizePropKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFC')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/õ/g, 'o')
    .replace(/\s+/g, '')
}

function getProp(props: NotionGiftCardPropertyMap, name: string): any {
  if (Object.prototype.hasOwnProperty.call(props, name)) return props[name]
  const needle = normalizePropKey(name)
  const key = Object.keys(props).find((k) => normalizePropKey(k) === needle)
  return key ? props[key] : undefined
}

function resolveValidUntil(props: NotionGiftCardPropertyMap): string {
  const fromAegub = readValidUntil(getProp(props, 'Aegub'))
  if (fromAegub) return fromAegub

  // Mis tahes formula, mis näeb välja nagu kuupäev
  for (const p of Object.values(props)) {
    if (p?.type !== 'formula') continue
    const v = readValidUntil(p)
    if (v && /\d{4}/.test(v)) return v
  }

  let purchase =
    readValidUntil(getProp(props, 'Ostu kuupäev')) ||
    readValidUntil(getProp(props, 'Ostu kuupaev')) ||
    (() => {
      for (const [k, p] of Object.entries(props)) {
        if (p?.type !== 'date' || !p.date?.start) continue
        const nk = normalizePropKey(k)
        if (nk.includes('kasutatud')) continue
        if (nk.includes('ostu') || nk === 'kuupaev' || nk === 'date') return p.date.start as string
      }
      return ''
    })()

  // Jäänuk: createGiftCardOrder kirjutas vahel ostukuupäeva „Kasutatud“ väljale
  if (!purchase) {
    const mistaken = readValidUntil(getProp(props, 'Kasutatud kuupäev'))
    if (mistaken) purchase = mistaken
  }

  if (purchase) return fallbackValidUntilFromPurchase(purchase)
  return ''
}

function resolveUsedAt(props: NotionGiftCardPropertyMap): string | null {
  const used = readUsedAt(getProp(props, 'Kasutatud kuupäev'))
  if (!used) return null

  const purchase =
    readValidUntil(getProp(props, 'Ostu kuupäev')) ||
    readValidUntil(getProp(props, 'Ostu kuupaev'))

  // Kui Ostu tühi ja Staatus aktiivne, on „Kasutatud“ tõenäoliselt vale ostukuupäev
  const statusProp = getProp(props, 'Staatus')
  const statusName =
    statusProp?.select?.name || statusProp?.status?.name || statusProp?.rich_text?.[0]?.plain_text || ''
  if (!purchase && /aktiivne/i.test(statusName)) {
    return null
  }

  return used
}

function mapNotionPageToGiftCardDetails(page: any, codeFallback: string): GiftCardDetails {
  const props: NotionGiftCardPropertyMap = page.properties || {}

  const codeProp = getProp(props, 'Kinkekaardi kood')
  const codeValue = codeProp?.type === 'title' ? getTitlePlain(codeProp) : getRichTextPlain(codeProp)

  const amountProp = getProp(props, 'Väärtus')
  const amountEur = typeof amountProp?.number === 'number' ? amountProp.number : Number(amountProp?.number ?? 0)

  const validUntil = resolveValidUntil(props)

  const buyerName = (() => {
    const p = props['Ostja nimi']
    if (!p) return null
    if (p.type === 'title') return getTitlePlain(p) || null
    if (p.type === 'rich_text') return getRichTextPlain(p) || null
    return null
  })()

  const buyerEmail = readEmail(props['Ostja email'])
  const usedAt = resolveUsedAt(props)
  const qrUrl = props['QR URL']?.url ?? null

  return {
    pageId: page.id,
    code: codeValue || codeFallback,
    amountEur,
    validUntil,
    buyerName,
    buyerEmail,
    usedAt,
    qrUrl,
  }
}

/** Tabeli päringu esimene kirje (loomise aeg kasvav — stabiilne „esimene“). */
export async function getFirstGiftCardFromDatabase(
  notionApiKey: string,
  databaseId: string
): Promise<GiftCardDetails | null> {
  const dbId = databaseId.replace(/-/g, '')
  const queryUrl = `https://api.notion.com/v1/databases/${dbId}/query`

  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }

  const res = await fetchNotion(queryUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      page_size: 1,
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion gift card first page failed: ${res.status} ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const page = data?.results?.[0] ?? null
  if (!page) return null

  return mapNotionPageToGiftCardDetails(page, '')
}

export async function getGiftCardDetailsByCode(
  notionApiKey: string,
  databaseId: string,
  code: string
): Promise<GiftCardDetails | null> {
  const dbId = databaseId.replace(/-/g, '')
  const normalizedCode = code.trim()

  const queryUrl = `https://api.notion.com/v1/databases/${dbId}/query`

  const headers = {
    Authorization: `Bearer ${notionApiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }

  // Koodi väljal võib olla tüüp `title` (ja varem setitaksegi nii, kui Notionis on title),
  // aga teeme fallbacki `rich_text`-ile.
  const queryBodies = [
    { filter: { property: 'Kinkekaardi kood', title: { equals: normalizedCode } }, page_size: 1 },
    { filter: { property: 'Kinkekaardi kood', rich_text: { equals: normalizedCode } }, page_size: 1 },
  ]

  let page: any | null = null
  for (const body of queryBodies) {
    const res = await fetchNotion(queryUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Notion gift card lookup failed: ${res.status} ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    page = data?.results?.[0] ?? null
    if (page) break
  }

  if (!page) return null

  let details = mapNotionPageToGiftCardDetails(page, normalizedCode)

  // Kui query vastuses formula puudub/tühi, küsi Aegub eraldi (Notion soovitab property endpointi)
  if (!details.validUntil) {
    const aegubId = getProp(page.properties || {}, 'Aegub')?.id
    if (aegubId) {
      const propRes = await fetchNotion(
        `https://api.notion.com/v1/pages/${page.id.replace(/-/g, '')}/properties/${encodeURIComponent(aegubId)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
          },
        }
      )
      if (propRes.ok) {
        const propData = await propRes.json()
        const fromProp = readValidUntil(propData)
        if (fromProp) {
          details = { ...details, validUntil: fromProp }
        }
      }
    }
  }

  return details
}

export async function setGiftCardQrUrl(
  notionApiKey: string,
  pageId: string,
  qrUrl: string
): Promise<void> {
  const patchUrl = `https://api.notion.com/v1/pages/${pageId.replace(/-/g, '')}`
  const res = await fetchNotion(patchUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        'QR URL': { url: qrUrl },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion gift card QR update failed: ${res.status} ${text.slice(0, 200)}`)
  }
}

