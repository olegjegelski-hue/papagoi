/**
 * Annetuse kirje Notioni andmebaasis "Annetused".
 * Annetuse nr tuleb unique_id / auto_increment_id väljast (prefiks ANN).
 */

import {
  DONATION_PAYMENT_METHOD,
  DONATION_PURPOSE_NOTION,
  DONATION_STATUS,
  parseDonationCodeFromMerchantReference,
  parseDonationNumberFromCode,
  purposeFromNotionLabel,
  type DonationPurpose,
} from '@/lib/donation'
import type { VisitMailLocale } from '@/lib/visit-language'
import { parseVisitMailLocale, visitMailLocaleToNotionSelectLabel } from '@/lib/visit-language'

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

function notionHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }
}

type NotionUniqueId = {
  type?: string
  unique_id?: { prefix?: string | null; number?: number | null }
  auto_increment_id?: { prefix?: string | null; number?: number | null }
  number?: number | null
}

type NotionPage = {
  id: string
  properties?: Record<string, unknown>
}

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
    if (prop?.type === 'auto_increment_id' && prop.auto_increment_id?.number != null) {
      const prefix = (prop.auto_increment_id.prefix || 'ANN').replace(/-+$/, '')
      return `${prefix}-${prop.auto_increment_id.number}`
    }
  }
  return null
}

function readTitle(prop: unknown): string {
  const p = prop as { title?: { plain_text?: string }[] } | undefined
  return p?.title?.[0]?.plain_text?.trim() || ''
}

function readRichText(prop: unknown): string {
  const p = prop as { rich_text?: { plain_text?: string }[] } | undefined
  const parts = p?.rich_text
  if (!Array.isArray(parts) || parts.length === 0) return ''
  return parts.map((block) => block.plain_text || '').join('').trim()
}

function readSelect(prop: unknown): string | null {
  const p = prop as { select?: { name?: string | null } } | undefined
  return p?.select?.name ?? null
}

function readEmail(prop: unknown): string {
  const p = prop as { email?: string | null } | undefined
  if (typeof p?.email === 'string' && p.email.trim()) return p.email.trim()
  return readRichText(prop)
}

function readNumber(prop: unknown): number | null {
  const p = prop as { number?: number | null } | undefined
  return typeof p?.number === 'number' && Number.isFinite(p.number) ? p.number : null
}

function readCheckbox(prop: unknown): boolean {
  const p = prop as { checkbox?: boolean } | undefined
  return Boolean(p?.checkbox)
}

function richTextProp(content: string) {
  return { rich_text: [{ type: 'text' as const, text: { content: content.slice(0, 2000) } }] }
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

export type DonationRecord = {
  pageId: string
  code: string
  donorName: string
  donorEmail: string
  amountEur: number
  purpose: DonationPurpose | null
  purposeLabel: string | null
  status: string | null
  comment: string
  publishName: boolean
  locale: VisitMailLocale
  montonioUuid: string
  thankYouSent: boolean
  bank: string
}

function mapDonationRecord(page: NotionPage): DonationRecord {
  const props = page.properties || {}
  const purposeLabel = readSelect(props.Sihtotstarve)
  return {
    pageId: page.id,
    code: extractDonationCode(page as { properties?: Record<string, NotionUniqueId> }) || '',
    donorName: readTitle(props.Annetaja) || '—',
    donorEmail: readEmail(props['E-post']),
    amountEur: readNumber(props.Summa) ?? 0,
    purpose: purposeFromNotionLabel(purposeLabel),
    purposeLabel,
    status: readSelect(props.Staatus),
    comment: readRichText(props.Kommentaar),
    publishName: readCheckbox(props['Nime võib avaldada']),
    locale: parseVisitMailLocale(readSelect(props.Keel)),
    montonioUuid: readRichText(props['Montonio UUID']),
    thankYouSent: readCheckbox(props['Tänukiri saadetud']),
    bank: readRichText(props.Pank),
  }
}

async function retrievePage(notionApiKey: string, pageId: string): Promise<NotionPage> {
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

export async function getDonationByPageId(
  notionApiKey: string,
  pageId: string
): Promise<DonationRecord> {
  const page = await retrievePage(notionApiKey, pageId)
  return mapDonationRecord(page)
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
    Staatus: { select: { name: DONATION_STATUS.awaitingPayment } },
    Makseviis: { select: { name: DONATION_PAYMENT_METHOD.montonio } },
    'Nime võib avaldada': { checkbox: payload.publishName },
    'Tänukiri saadetud': { checkbox: false },
    Keel: { select: { name: language } },
  }

  if (payload.comment) {
    pageProps.Kommentaar = richTextProp(payload.comment)
  }

  const createRes = await fetchNotion('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: notionHeaders(notionApiKey),
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

  let page = (await createRes.json()) as NotionPage
  let code = extractDonationCode(page as { properties?: Record<string, NotionUniqueId> })

  for (let attempt = 0; !code && attempt < 3; attempt++) {
    await sleep(250 * (attempt + 1))
    page = await retrievePage(notionApiKey, page.id)
    code = extractDonationCode(page as { properties?: Record<string, NotionUniqueId> })
  }

  if (!code) {
    throw new Error('Notion annetuse nr (unique_id) puudub loodud lehel')
  }

  return { success: true, code, pageId: page.id }
}

export async function updateDonationProperties(
  notionApiKey: string,
  pageId: string,
  properties: Record<string, unknown>
): Promise<boolean> {
  const res = await fetchNotion(`https://api.notion.com/v1/pages/${pageId.replace(/-/g, '')}`, {
    method: 'PATCH',
    headers: notionHeaders(notionApiKey),
    body: JSON.stringify({ properties }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('[notion-donations] PATCH ebaõnnestus:', res.status, text.slice(0, 300))
    return false
  }
  return true
}

export async function saveDonationMontonioUuid(
  notionApiKey: string,
  pageId: string,
  uuid: string
): Promise<boolean> {
  return updateDonationProperties(notionApiKey, pageId, {
    'Montonio UUID': richTextProp(uuid),
  })
}

export async function markDonationCancelled(
  notionApiKey: string,
  pageId: string
): Promise<boolean> {
  return updateDonationProperties(notionApiKey, pageId, {
    Staatus: { select: { name: DONATION_STATUS.cancelled } },
  })
}

async function queryDonations(
  notionApiKey: string,
  databaseId: string,
  filter: Record<string, unknown>
): Promise<NotionPage | null> {
  const dbId = databaseId.replace(/-/g, '')
  const res = await fetchNotion(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: notionHeaders(notionApiKey),
    body: JSON.stringify({ filter, page_size: 1 }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion annetuste päring: ${res.status} ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as { results?: NotionPage[] }
  return data.results?.[0] ?? null
}

export async function findDonationByMontonio(
  notionApiKey: string,
  databaseId: string,
  input: { uuid?: string; merchantReference?: string }
): Promise<DonationRecord | null> {
  const uuid = input.uuid?.trim()
  if (uuid) {
    const page = await queryDonations(notionApiKey, databaseId, {
      property: 'Montonio UUID',
      rich_text: { equals: uuid },
    })
    if (page) return mapDonationRecord(page)
  }

  const code =
    (input.merchantReference && parseDonationCodeFromMerchantReference(input.merchantReference)) ||
    null
  const number = code ? parseDonationNumberFromCode(code) : null
  if (number != null) {
    const page = await queryDonations(notionApiKey, databaseId, {
      property: 'Annetuse nr',
      unique_id: { equals: number },
    })
    if (page) return mapDonationRecord(page)
  }

  return null
}

export function paidDonationProperties(input: { bank?: string; paidDate: string }): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    Staatus: { select: { name: DONATION_STATUS.paid } },
    'Laekumise kuupäev': { date: { start: input.paidDate } },
  }
  if (input.bank) {
    properties.Pank = richTextProp(input.bank)
  }
  return properties
}

export function cancelledDonationProperties(): Record<string, unknown> {
  return {
    Staatus: { select: { name: DONATION_STATUS.cancelled } },
  }
}

export function thankYouSentProperties(sent: boolean): Record<string, unknown> {
  return {
    'Tänukiri saadetud': { checkbox: sent },
  }
}
