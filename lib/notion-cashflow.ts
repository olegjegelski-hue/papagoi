import { giftCardCashflowTitle } from '@/lib/gift-card'

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

function richTextProp(content: string) {
  return { rich_text: [{ type: 'text' as const, text: { content: content.slice(0, 2000) } }] }
}

function toNotionUuid(id: string): string {
  const hex = id.replace(/-/g, '').toLowerCase()
  if (hex.length !== 32) return id
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function relationProp(pageId: string) {
  return { relation: [{ id: toNotionUuid(pageId) }] }
}

/** Papagoi Keskus MTÜ (Ettevõtted). Montonio laekub MTÜ kontole. */
export const CASHFLOW_COMPANY_PAGE_ID = '21fa1c6a247e80118e2ffa5b12b997cf'

/** Tegevussuund Papagoi Keskus. */
export const CASHFLOW_ACTIVITY_PAGE_ID = 'd4738a0e67864ff28adb7a8659011a2d'

export function getCashflowDatabaseId(): string | null {
  const id = process.env.NOTION_CASHFLOW_DATABASE_ID?.trim()
  return id || null
}

export type CreateGiftCardCashflowInput = {
  giftCardPageId: string
  buyerName: string
  code: string
  amountEur: number
  paidDate: string
}

export type CreateGiftCardCashflowResult =
  | { ok: true; pageId: string }
  | { ok: false; reason: string }

/**
 * Kinkekaardi müügi kanne „💶 Rahavoog“.
 * 🎁 Kinkekaart relatsioon täidab kahepoolselt kinkekaardi „💶 Rahavoog“ välja.
 * Saada Meritisse jääb tühjaks.
 */
export async function createGiftCardCashflowEntry(
  notionApiKey: string,
  input: CreateGiftCardCashflowInput
): Promise<CreateGiftCardCashflowResult> {
  const databaseId = getCashflowDatabaseId()
  if (!databaseId) {
    return { ok: false, reason: 'missing_NOTION_CASHFLOW_DATABASE_ID' }
  }

  const dbId = databaseId.replace(/-/g, '')
  const title = giftCardCashflowTitle(input.buyerName, input.code)

  const pageProps: Record<string, unknown> = {
    Nimetus: { title: [{ type: 'text', text: { content: title.slice(0, 2000) } }] },
    Voog: { select: { name: 'Tulu' } },
    Summa: { number: input.amountEur },
    Konto: { select: { name: 'Pank' } },
    Kuupäev: { date: { start: input.paidDate } },
    Vastaspool: richTextProp(input.buyerName.trim() || '—'),
    Ettevõte: relationProp(CASHFLOW_COMPANY_PAGE_ID),
    Tegevussuunad: relationProp(CASHFLOW_ACTIVITY_PAGE_ID),
    '🎁 Kinkekaart': relationProp(input.giftCardPageId),
  }

  const res = await fetchNotion('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: notionHeaders(notionApiKey),
    body: JSON.stringify({
      parent: { database_id: dbId },
      icon: { type: 'emoji', emoji: '🎁' },
      properties: pageProps,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[notion-cashflow] Kinkekaardi kande loomine ebaõnnestus:', res.status, text.slice(0, 400))
    return { ok: false, reason: `notion_${res.status}` }
  }

  const page = (await res.json()) as { id?: string }
  if (!page.id) {
    return { ok: false, reason: 'missing_page_id' }
  }
  return { ok: true, pageId: page.id }
}
