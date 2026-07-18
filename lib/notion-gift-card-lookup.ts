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

function getProp(props: NotionGiftCardPropertyMap, name: string): any {
  if (props[name]) return props[name]
  const needle = name.toLowerCase()
  const key = Object.keys(props).find((k) => k.toLowerCase() === needle)
  return key ? props[key] : undefined
}

function mapNotionPageToGiftCardDetails(page: any, codeFallback: string): GiftCardDetails {
  const props: NotionGiftCardPropertyMap = page.properties || {}

  const codeProp = getProp(props, 'Kinkekaardi kood')
  const codeValue = codeProp?.type === 'title' ? getTitlePlain(codeProp) : getRichTextPlain(codeProp)

  const amountProp = getProp(props, 'Väärtus')
  const amountEur = typeof amountProp?.number === 'number' ? amountProp.number : Number(amountProp?.number ?? 0)

  let validUntil = readValidUntil(getProp(props, 'Aegub'))
  if (!validUntil) {
    // Kui formula ei lae (või on tühi), arvuta ostukuupäev + 1 aasta
    const purchase = readValidUntil(getProp(props, 'Ostu kuupäev'))
    if (purchase) validUntil = fallbackValidUntilFromPurchase(purchase)
  }

  const buyerName = (() => {
    const p = props['Ostja nimi']
    if (!p) return null
    if (p.type === 'title') return getTitlePlain(p) || null
    if (p.type === 'rich_text') return getRichTextPlain(p) || null
    return null
  })()

  const buyerEmail = readEmail(props['Ostja email'])
  const usedAt = readUsedAt(props['Kasutatud kuupäev'])
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

  return mapNotionPageToGiftCardDetails(page, normalizedCode)
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

