/**
 * Kinkekaardi tellimuse lisamine Notioni andmebaasi "Kinkekaardid".
 * Genereerib unikaalse kinkekaardi koodi (QR jaoks), lisab rea andmebaasi.
 */

import { randomBytes } from 'crypto'
import { formatInTimeZone } from 'date-fns-tz'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

async function fetchNotion(url: string, options: RequestInit) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PK-'
  const bytes = randomBytes(8)
  for (let i = 0; i < 8; i++) code += chars[bytes[i]! % chars.length]
  return code
}

function findProp(
  properties: Record<string, any>,
  exactNames: string[],
  typeFilter?: string
): string | null {
  const normalizedTargets = exactNames.map((n) => normalizeKey(n))
  for (const [key, prop] of Object.entries(properties)) {
    if (typeFilter && prop?.type !== typeFilter) continue
    const propName = (prop?.name ?? key).toString()
    const n = normalizeKey(propName)
    if (normalizedTargets.some((t) => n === t || n.includes(t) || t.includes(n)))
      return key
  }
  return null
}

export interface CreateGiftCardOrderPayload {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  amountEur: number
}

export interface CreateGiftCardOrderResult {
  success: true
  code: string
  pageId: string
}

export async function createGiftCardOrder(
  notionApiKey: string,
  databaseId: string,
  payload: CreateGiftCardOrderPayload
): Promise<CreateGiftCardOrderResult> {
  const dbId = databaseId.replace(/-/g, '')
  const code = generateGiftCardCode()
  const orderDate = formatInTimeZone(new Date(), 'Europe/Tallinn', 'yyyy-MM-dd')

  const dbRes = await fetchNotion(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!dbRes.ok) {
    const text = await dbRes.text()
    throw new Error(`Notion Kinkekaardid DB: ${dbRes.status} ${text}`)
  }

  const dbData = await dbRes.json()
  const properties = dbData.properties || {}

  const ostjaNimiKey =
    findProp(properties, ['Ostja nimi', 'Name', 'Nimi', 'Ostja'], 'title') ||
    Object.keys(properties).find((k) => properties[k]?.type === 'title') ||
    null
  const ostjaTelefonKey =
    findProp(properties, ['Ostja telefon', 'Telefon', 'Phone'], 'phone_number') ||
    Object.keys(properties).find((k) => properties[k]?.type === 'phone_number') ||
    null
  const ostjaEmailKey =
    findProp(properties, ['Ostja email', 'Ostja e-post', 'Email', 'E-post'], 'email') ||
    Object.keys(properties).find((k) => properties[k]?.type === 'email') ||
    null
  const ostuKuupaevKey =
    findProp(properties, ['Ostu kuupäev', 'Ostu kuupaev', 'Kuupäev', 'Date'], 'date') ||
    Object.keys(properties).find((k) => properties[k]?.type === 'date') ||
    null
  const vaartusKey =
    findProp(properties, ['Väärtus', 'Vaartus', 'Summa', 'Amount'], 'number') ||
    Object.keys(properties).find((k) => properties[k]?.type === 'number') ||
    null
  const koodKey =
    findProp(properties, ['Kinkekaardi kood', 'Kood', 'Code'], 'rich_text') ||
    Object.keys(properties).find((k) =>
      properties[k]?.type === 'rich_text' &&
      (normalizeKey(k).includes('kood') || normalizeKey(k).includes('kinkekaart') || normalizeKey(k).includes('code'))
    ) ||
    null
  const staatusKey =
    findProp(properties, ['Staatus', 'Status'], 'select') ||
    Object.keys(properties).find((k) => properties[k]?.type === 'select') ||
    null

  if (!ostjaNimiKey) throw new Error('Notion Kinkekaardid: Ostja nimi (title) veerg puudub')

  const pageProps: Record<string, unknown> = {}

  if (ostjaNimiKey) {
    const p = properties[ostjaNimiKey]
    if (p?.type === 'title')
      pageProps[ostjaNimiKey] = { title: [{ type: 'text', text: { content: payload.buyerName || '—' } }] }
    else
      pageProps[ostjaNimiKey] = { rich_text: [{ type: 'text', text: { content: payload.buyerName || '—' } }] }
  }
  if (ostjaTelefonKey) {
    const p = properties[ostjaTelefonKey]
    if (p?.type === 'phone_number')
      pageProps[ostjaTelefonKey] = { phone_number: payload.buyerPhone || '' }
    else
      pageProps[ostjaTelefonKey] = { rich_text: [{ type: 'text', text: { content: payload.buyerPhone || '' } }] }
  }
  if (ostjaEmailKey) {
    const p = properties[ostjaEmailKey]
    if (p?.type === 'email')
      pageProps[ostjaEmailKey] = { email: payload.buyerEmail || '' }
    else
      pageProps[ostjaEmailKey] = { rich_text: [{ type: 'text', text: { content: payload.buyerEmail || '' } }] }
  }
  if (ostuKuupaevKey) pageProps[ostuKuupaevKey] = { date: { start: orderDate } }
  if (vaartusKey) pageProps[vaartusKey] = { number: payload.amountEur }
  if (koodKey) pageProps[koodKey] = { rich_text: [{ type: 'text', text: { content: code } }] }
  if (staatusKey) {
    const selectProp = properties[staatusKey]
    const options = selectProp?.select?.options || []
    const tellitudOption = options.find((o: { name?: string }) =>
      /tellitud|ordered/i.test((o.name || '').trim())
    )
    const statusName = tellitudOption ? tellitudOption.name : 'Tellitud'
    pageProps[staatusKey] = { select: { name: statusName } }
  }

  const createRes = await fetchNotion('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: pageProps,
    }),
  })

  if (!createRes.ok) {
    const text = await createRes.text()
    console.error('[notion-gift-cards] Lehe loomine ebaõnnestus:', createRes.status, text)
    throw new Error(`Notion: ${createRes.status} – ${text.slice(0, 200)}`)
  }

  const page = await createRes.json()
  return { success: true, code, pageId: page.id }
}
