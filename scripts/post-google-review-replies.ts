import 'dotenv/config'

/**
 * Postitab Google’isse ainult Kinnitatud + Staatus „Valmis postitamiseks“ ridu.
 * Värsked (arvustuse kuupäev >= täna−7 p) enne; vanad kuni old-limitini.
 * Kogusumma ei ületa total-limitit. Mustandit ega kinnitamata ridu ei postita.
 */

import { formatInTimeZone } from 'date-fns-tz'
import { getGmbAccessToken } from './sync-google-reviews-to-notion'
import { createTransporter } from '../lib/email'
import { GMB_STATUS, isGmbReplyReadyToPost } from '@/lib/gmb-review-workflow'

const DEFAULT_TOTAL_LIMIT = 30
const HARD_MAX_TOTAL_LIMIT = 50
const DEFAULT_OLD_LIMIT = 20
const HARD_MAX_OLD_LIMIT = 20
const FRESH_DAYS = 7

export type PostGmbRepliesOptions = {
  totalLimit?: number
  oldLimit?: number
}

export type PostGmbRepliesSummary = {
  freshFound: number
  freshPosted: number
  oldFound: number
  oldPosted: number
  totalPosted: number
  totalLimit: number
  oldLimit: number
  errors: number
  skipped: number
  rateLimited: boolean
  stoppedEarly: boolean
  stopReason: string | null
}

type NotionPage = {
  id: string
  properties: Record<string, any>
}

type PostKind = 'fresh' | 'old'

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function parsePositiveIntFlag(argv: string[], name: string): number | undefined {
  const raw = argv.find((a) => a.startsWith(`${name}=`))
  const parsed = raw ? Number.parseInt(raw.slice(name.length + 1), 10) : undefined
  return parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function parseArgs(argv: string[]): PostGmbRepliesOptions {
  return {
    totalLimit: parsePositiveIntFlag(argv, '--total-limit'),
    oldLimit: parsePositiveIntFlag(argv, '--old-limit'),
  }
}

function clampLimit(n: number, min: number, max: number): number {
  return Math.min(Math.max(min, n), max)
}

function envLimit(name: string, fallback: number, max: number): number {
  const raw = process.env[name]?.trim()
  const n = raw ? Number.parseInt(raw, 10) : fallback
  return clampLimit(Number.isFinite(n) && n > 0 ? n : fallback, 1, max)
}

function resolveTotalLimit(override?: number): number {
  return clampLimit(override ?? envLimit('GMB_REPLY_POST_TOTAL_LIMIT', DEFAULT_TOTAL_LIMIT, HARD_MAX_TOTAL_LIMIT), 1, HARD_MAX_TOTAL_LIMIT)
}

function resolveOldLimit(override?: number): number {
  return clampLimit(override ?? envLimit('GMB_REPLY_POST_OLD_LIMIT', DEFAULT_OLD_LIMIT, HARD_MAX_OLD_LIMIT), 1, HARD_MAX_OLD_LIMIT)
}

function tallinnYmd(now = new Date()): string {
  return formatInTimeZone(now, 'Europe/Tallinn', 'yyyy-MM-dd')
}

function addDaysYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map((part) => Number.parseInt(part, 10))
  const dt = new Date(Date.UTC(year, month - 1, day))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function reviewDateYmd(properties: Record<string, any>): string {
  const start = properties['Arvustuse kuupäev']?.date?.start
  return typeof start === 'string' && start.trim() ? start.slice(0, 10) : ''
}

function isFreshReview(ymd: string, cutoffYmd: string): boolean {
  return Boolean(ymd) && ymd >= cutoffYmd
}

function sortByReviewDate(pages: NotionPage[], newestFirst: boolean): NotionPage[] {
  return [...pages].sort((a, b) => {
    const aDate = reviewDateYmd(a.properties)
    const bDate = reviewDateYmd(b.properties)
    if (!aDate && !bDate) return 0
    if (!aDate) return 1
    if (!bDate) return -1
    return newestFirst ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate)
  })
}

/** 429/auth/5xx: peata batch, ära märgi rida Vigaks. Muu Google viga: Viga + jätka. */
function shouldStopGmbPostBatch(status: number): boolean {
  if (status === 401 || status === 403 || status === 429) return true
  if (status >= 500) return true
  return false
}

async function fetchNotionPagesNeedingReply(): Promise<NotionPage[]> {
  const NOTION_API_KEY = assertEnv('NOTION_API_KEY')
  const rawDbId = assertEnv('NOTION_REVIEWS_DATABASE_ID')
  const databaseId = rawDbId.replace(/-/g, '')

  const results: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, any> = {
      page_size: 100,
      filter: {
        and: [
          {
            property: 'Google review ID',
            rich_text: { is_not_empty: true },
          },
          {
            property: 'Vastus',
            rich_text: { is_not_empty: true },
          },
          {
            property: 'Vastus postitatud?',
            checkbox: { equals: false },
          },
          {
            property: 'Kinnitatud',
            checkbox: { equals: true },
          },
          {
            property: 'Staatus',
            select: { equals: GMB_STATUS.ready },
          },
        ],
      },
    }

    if (startCursor) {
      body.start_cursor = startCursor
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to query Notion reviews needing reply: ${response.status} - ${text}`)
    }

    const data = await response.json()
    const pageResults: any[] = data.results || []
    for (const page of pageResults) {
      results.push({ id: page.id, properties: page.properties || {} })
    }

    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  return results
}

function getRichTextPlainText(prop: any): string | null {
  const rich = prop?.rich_text
  if (!Array.isArray(rich) || rich.length === 0) return null
  const text = rich.map((t: { plain_text?: string; text?: { content?: string } }) => t?.plain_text ?? t?.text?.content ?? '').join('')
  return text && String(text).trim().length > 0 ? String(text).trim() : null
}

/** Ainult Staatus → Viga. Vastus postitatud? ja kuupäev jäävad puutumata. */
async function markPostError(apiKey: string, pageId: string, reason: string) {
  console.error(`Marking Notion page ${pageId} as ${GMB_STATUS.error}: ${reason}`)
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        Staatus: { select: { name: GMB_STATUS.error } },
      },
    }),
  })
  if (!response.ok) {
    const text = await response.text()
    console.error(`Failed to mark ${GMB_STATUS.error} on ${pageId}: ${response.status} - ${text}`)
  }
}

type PostAttempt = 'posted' | 'error' | 'skipped' | 'stopped'

async function attemptPostReply(input: {
  page: NotionPage
  apiKey: string
  accountId: string
  locationId: string
  accessToken: string
}): Promise<{ result: PostAttempt; stopReason?: string; rateLimited?: boolean }> {
  const { page, apiKey, accountId, locationId, accessToken } = input
  const props = page.properties
  const reviewId = getRichTextPlainText(props['Google review ID'])
  const replyText = getRichTextPlainText(props['Vastus'])
  const status = props['Staatus']?.select?.name || null
  const gate = isGmbReplyReadyToPost({
    status,
    confirmed: props['Kinnitatud']?.checkbox === true,
    replyPosted: props['Vastus postitatud?']?.checkbox === true,
    replyText,
    reviewId,
  })

  if (!gate.ok) {
    console.log(`Skipping page ${page.id}: ${gate.reason}`)
    return { result: 'skipped' }
  }

  const name = `accounts/${accountId}/locations/${locationId}/reviews/${reviewId}`
  const url = `https://mybusiness.googleapis.com/v4/${encodeURI(name)}/reply`

  let gmbResponse: Response
  try {
    gmbResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: replyText }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Google post network error page=${page.id} reviewId=${reviewId}: ${message}`)
    return { result: 'stopped', stopReason: message.slice(0, 180) }
  }

  if (!gmbResponse.ok) {
    const text = await gmbResponse.text()
    const reason = `${gmbResponse.status}: ${text}`
    console.error(`Failed to post reply to Google page=${page.id} reviewId=${reviewId}: ${reason}`)
    if (shouldStopGmbPostBatch(gmbResponse.status)) {
      console.warn(
        `Stopping post batch after Google ${gmbResponse.status}; Notion unchanged (not Viga) so the row can retry`,
      )
      return {
        result: 'stopped',
        stopReason: reason.slice(0, 180),
        rateLimited: gmbResponse.status === 429,
      }
    }
    await markPostError(apiKey, page.id, reason)
    return { result: 'error' }
  }

  const nowIso = new Date().toISOString()
  const notionResponse = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        'Vastus postitatud?': {
          checkbox: true,
        },
        Staatus: {
          select: { name: GMB_STATUS.posted },
        },
        'Vastuse postitamise kuupäev': {
          date: { start: nowIso },
        },
      },
    }),
  })

  if (!notionResponse.ok) {
    const text = await notionResponse.text()
    console.error(
      `Reply posted to Google but failed to update Notion page ${page.id}: ${notionResponse.status} - ${text}`,
    )
    return { result: 'stopped', stopReason: `notion-update-failed ${notionResponse.status}` }
  }

  return { result: 'posted' }
}

export async function postRepliesToGoogle(
  options: PostGmbRepliesOptions = {},
): Promise<PostGmbRepliesSummary> {
  const totalLimit = resolveTotalLimit(options.totalLimit)
  const oldLimit = resolveOldLimit(options.oldLimit)
  const cutoffYmd = addDaysYmd(tallinnYmd(), -FRESH_DAYS)
  const NOTION_API_KEY = assertEnv('NOTION_API_KEY')
  const matchedPages = await fetchNotionPagesNeedingReply()

  const freshPages = sortByReviewDate(
    matchedPages.filter((page) => isFreshReview(reviewDateYmd(page.properties), cutoffYmd)),
    true,
  )
  const oldPages = sortByReviewDate(
    matchedPages.filter((page) => !isFreshReview(reviewDateYmd(page.properties), cutoffYmd)),
    false,
  )

  const summary: PostGmbRepliesSummary = {
    freshFound: freshPages.length,
    freshPosted: 0,
    oldFound: oldPages.length,
    oldPosted: 0,
    totalPosted: 0,
    totalLimit,
    oldLimit,
    errors: 0,
    skipped: 0,
    rateLimited: false,
    stoppedEarly: false,
    stopReason: null,
  }

  console.log(
    JSON.stringify({
      note: 'GMB reply post. Only Kinnitatud + Valmis postitamiseks. Fresh first, then old backfill within limits.',
      cutoffYmd,
      totalLimit,
      oldLimit,
      freshFound: summary.freshFound,
      oldFound: summary.oldFound,
    }),
  )

  if (!matchedPages.length) {
    console.log('No Notion review pages pending reply.')
    return summary
  }

  const accountId = assertEnv('GOOGLE_MY_BUSINESS_ACCOUNT_ID')
  const locationId = assertEnv('GOOGLE_MY_BUSINESS_LOCATION_ID')
  const accessToken = await getGmbAccessToken()

  const work: Array<{ page: NotionPage; kind: PostKind }> = [
    ...freshPages.map((page) => ({ page, kind: 'fresh' as const })),
    ...oldPages.map((page) => ({ page, kind: 'old' as const })),
  ]

  for (const item of work) {
    if (summary.stoppedEarly) {
      summary.skipped++
      continue
    }
    if (summary.totalPosted >= totalLimit) break
    if (item.kind === 'old') {
      if (summary.oldPosted >= oldLimit) break
      if (totalLimit - summary.totalPosted <= 0) break
    }

    const attempt = await attemptPostReply({
      page: item.page,
      apiKey: NOTION_API_KEY,
      accountId,
      locationId,
      accessToken,
    })

    if (attempt.result === 'skipped') {
      summary.skipped++
      continue
    }
    if (attempt.result === 'error') {
      summary.errors++
      continue
    }
    if (attempt.result === 'stopped') {
      summary.errors++
      summary.stoppedEarly = true
      summary.stopReason = attempt.stopReason || 'stopped'
      if (attempt.rateLimited) summary.rateLimited = true
      continue
    }

    summary.totalPosted++
    if (item.kind === 'fresh') summary.freshPosted++
    else summary.oldPosted++
  }

  console.log(
    JSON.stringify({
      freshFound: summary.freshFound,
      freshPosted: summary.freshPosted,
      oldFound: summary.oldFound,
      oldPosted: summary.oldPosted,
      totalPosted: summary.totalPosted,
      totalLimit: summary.totalLimit,
      oldLimit: summary.oldLimit,
      errors: summary.errors,
      skipped: summary.skipped,
      rateLimited: summary.rateLimited,
      stoppedEarly: summary.stoppedEarly,
    }),
  )

  if (matchedPages.length > 0) {
    try {
      const transporter = createTransporter()
      const to = process.env.CENTER_EMAIL || 'keskus@papagoi.ee'
      const fromAddress = process.env.SMTP_USER || 'keskus@papagoi.ee'
      const subject = 'Google arvustuste vastused – päevakokkuvõte'
      const now = new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })

      const text = [
        'Google arvustuste vastuste kokkuvõte',
        '',
        `Kuupäev ja kellaaeg (Tallinn): ${now}`,
        '',
        `Värsked: ${summary.freshPosted} / ${summary.freshFound}`,
        `Vanad: ${summary.oldPosted} / ${summary.oldFound} (old limit ${summary.oldLimit})`,
        `Kokku postitatud: ${summary.totalPosted} / ${summary.totalLimit}`,
        `Vead: ${summary.errors}`,
      ].join('\n')

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
            Google arvustuste vastuste kokkuvõte
          </h2>
          <p>Kuupäev ja kellaaeg (Tallinn): <strong>${now}</strong></p>
          <ul style="line-height: 1.6;">
            <li><strong>Värsked:</strong> ${summary.freshPosted} / ${summary.freshFound}</li>
            <li><strong>Vanad:</strong> ${summary.oldPosted} / ${summary.oldFound} (old limit ${summary.oldLimit})</li>
            <li><strong>Kokku postitatud:</strong> ${summary.totalPosted} / ${summary.totalLimit}</li>
            <li><strong>Vead:</strong> ${summary.errors}</li>
          </ul>
        </div>
      `

      await transporter.sendMail({
        from: `"Papagoi Keskus – Google vastused" <${fromAddress}>`,
        to,
        subject,
        text,
        html,
      })

      console.log(`Replies summary email sent to ${to}`)
    } catch (error) {
      console.error('Failed to send replies summary email:', error)
    }
  }

  return summary
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  await postRepliesToGoogle(options)
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Post replies failed:', error)
    process.exit(1)
  })
}
