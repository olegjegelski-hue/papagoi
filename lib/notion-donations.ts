/**
 * Annetuse kirje lisamine Notioni andmebaasi "Annetused".
 * Annetuse nr tuleb unique_id väljast (prefiks ANN).
 */

import type { DonationPurpose } from '@/lib/donation'
import { DONATION_PURPOSE_NOTION } from '@/lib/donation'
import type { VisitMailLocale } from '@/lib/visit-language'
import { visitMailLocaleToNotionSelectLabel } from '@/lib/visit-language'

async function fetchNotion(url: string, options: RequestInit) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    return await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timeoutId)
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type NotionUniqueId = { type?: string; unique_id?: { prefix?: string | null; number?: number | null } }

function extractDonationCode(page: { properties?: Record<string, NotionUniqueId> }): string | null {
  const props = page.properties || {}
  const ordered: NotionUniqueId[] = []
  if (props['Annetuse nr']) ordered.push(props['Annetuse nr'])
  for (const value of Object.values(props)) {
    if (value && value !== props['Annetuse nr']) ordered.push(value)
  }
  for (const prop of ordered) {
    if (prop?.type === 'unique_id' && prop.unique_id?.number != null) {
      const prefix = (prop.unique_id.prefix || 'ANN').replace(/-+$/, '')
      return `${prefix}-${prop.unique_id.number}`
    }
  }
  return null
}

async function retrievePage(
  notionApiKey: string,
  pageId: string
): Promise<{ properties?: Record<string, NotionUniqueId> }> {
  const res = await fetchNotion(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion annetuse leht: ${res.status} ${text.slice(0, 200)}`)
  }
  return res.json()
}

export interface CreateDonationPayload {
  donorName: string
  donorEmail: string
  amountEur: number
  purpose: DonationPurpose
  publishName: boolean
  comment: string
  locale: VisitMailLocale
}

export interface CreateDonationResult {
  success: true
  code: string
  pageId: string
}

export async function createDonation(
  notionApiKey: string,
  databaseId: string,
  payload: CreateDonationPayload
): Promise<CreateDonationResult> {
  const dbId = databaseId.replace(/-/g, '')
  const language = visitMailLocaleToNotionSelectLabel(payload.locale)
  const purposeLabel = DONATION_PURPOSE_NOTION[payload.purpose]

  const pageProps: Record<string, unknown> = {
    Annetaja: { title: [{ type: 'text', text: { content: payload.donorName || '—' } }] },
    'E-post': { email: payload.donorEmail },
    Summa: { number: payload.amountEur },
    Sihtotstarve: { select: { name: purposeLabel } },
    Staatus: { select: { name: 'Ootab ülekannet' } },
    'Nime võib avaldada': { checkbox: payload.publishName },
    Keel: { select: { name: language } },
  }

  if (payload.comment) {
    pageProps.Kommentaar = { rich_text: [{ type: 'text', text: { content: payload.comment } }] }
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
    console.error('[notion-donations] Lehe loomine ebaõnnestus:', createRes.status, text)
    throw new Error(`Notion: ${createRes.status} – ${text.slice(0, 200)}`)
  }

  let page = (await createRes.json()) as { id: string; properties?: Record<string, NotionUniqueId> }
  let code = extractDonationCode(page)

  for (let attempt = 0; !code && attempt < 3; attempt++) {
    await sleep(250 * (attempt + 1))
    page = (await retrievePage(notionApiKey, page.id)) as typeof page
    code = extractDonationCode(page)
  }

  if (!code) {
    throw new Error('Notion annetuse nr (unique_id) puudub loodud lehel')
  }

  return { success: true, code, pageId: page.id }
}
