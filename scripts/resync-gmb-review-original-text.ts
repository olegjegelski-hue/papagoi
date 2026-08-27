import 'dotenv/config'

import {
  diagnoseGmbOriginalPick,
  gmbCommentLooksTranslated,
  toNotionRichText,
  type GmbCommentFieldSnapshot,
} from '@/lib/gmb-review-comment'
import { fetchGmbReviewById, getGmbAccessToken } from '@/scripts/sync-google-reviews-to-notion'

/**
 * Käsitsi GMB originaalteksti resync Notioni „Arvustuse tekst“ väljale.
 * Ei ole cron. Ei puutu Vastus / Kinnitatud / Vastus postitatud? / kuupäev.
 *
 *   npm run resync-gmb-review-originals -- --dry-run
 *   npm run resync-gmb-review-originals -- --apply --limit=50
 *   npm run resync-gmb-review-originals -- --apply --limit=50 --offset=50
 */

const DEFAULT_LIMIT = 50
const HARD_MAX_LIMIT = 100
const GMB_GET_GAP_MS = 250
const NOTION_PATCH_GAP_MS = 350
const MAX_UNCERTAIN_SAMPLES = 25
const TEXT_PREVIEW_LEN = 180

type NotionPage = {
  id: string
  properties: Record<string, any>
}

export type ResyncOriginalTextOptions = {
  dryRun?: boolean
  limit?: number
  offset?: number
}

export type SkippedUncertainSample = {
  pageId: string
  reviewId: string
  reviewerName: string
  rating: number | null
  notionTextStart: string
  reason: string
  gmb: {
    starRating: string | null
    comment: GmbCommentFieldSnapshot
    originalText: GmbCommentFieldSnapshot
    originalComment: GmbCommentFieldSnapshot
    originalReviewText: GmbCommentFieldSnapshot
  } | null
}

export type ResyncOriginalTextSummary = {
  dryRun: boolean
  limit: number
  offset: number
  checked: number
  updated: number
  wouldUpdate: number
  unchanged: number
  skippedUncertain: number
  notFound: number
  errors: number
  errorSamples: { reviewId: string; pageId: string; error: string }[]
  skippedUncertainSamples: SkippedUncertainSample[]
}

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function parseArgs(argv: string[]): ResyncOriginalTextOptions {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run') || !apply
  const limitRaw = argv.find((a) => a.startsWith('--limit='))
  const offsetRaw = argv.find((a) => a.startsWith('--offset='))
  const limitParsed = limitRaw ? Number.parseInt(limitRaw.slice('--limit='.length), 10) : undefined
  const offsetParsed = offsetRaw ? Number.parseInt(offsetRaw.slice('--offset='.length), 10) : undefined
  return {
    dryRun,
    limit: limitParsed != null && Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : undefined,
    offset: offsetParsed != null && Number.isFinite(offsetParsed) && offsetParsed >= 0 ? offsetParsed : undefined,
  }
}

function defaultLimit(): number {
  const raw = process.env.GMB_REVIEW_ORIGINAL_TEXT_RESYNC_LIMIT?.trim()
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_LIMIT
  return clampLimit(Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT)
}

function clampLimit(n: number): number {
  return Math.min(Math.max(1, n), HARD_MAX_LIMIT)
}

function looksNonEnglish(text: string): boolean {
  return /[äöüõšžа-яё]/i.test(text)
}

function richTextPlain(prop: any): string {
  if (!prop) return ''
  if (Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t: { plain_text?: string }) => t?.plain_text || '').join('')
  }
  return ''
}

function titlePlain(prop: any): string {
  if (!prop || !Array.isArray(prop.title)) return ''
  return prop.title.map((t: { plain_text?: string }) => t?.plain_text || '').join('').trim()
}

function normalizeReviewText(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\u00a0/g, ' ').trim()
}

function previewText(value: string, max = TEXT_PREVIEW_LEN): string {
  return value.replace(/\r\n/g, '\n').replace(/\n/g, ' ').trim().slice(0, max)
}

function notionRating(properties: Record<string, any>): number | null {
  const n = properties['Hinne']?.number
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function pushUncertainSample(summary: ResyncOriginalTextSummary, sample: SkippedUncertainSample) {
  if (summary.skippedUncertainSamples.length >= MAX_UNCERTAIN_SAMPLES) return
  summary.skippedUncertainSamples.push(sample)
}

function googleReviewIdFromPage(properties: Record<string, any>): string {
  const raw = richTextPlain(properties['Google review ID']).trim()
  if (!raw) return ''
  const parts = raw.split('/')
  const idx = parts.lastIndexOf('reviews')
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
  return raw
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchNewestNotionReviewsWithGoogleId(
  apiKey: string,
  databaseId: string,
  offset: number,
  limit: number,
): Promise<NotionPage[]> {
  const needed = offset + limit
  const results: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, any> = {
      page_size: 100,
      filter: {
        property: 'Google review ID',
        rich_text: { is_not_empty: true },
      },
      sorts: [{ property: 'Arvustuse kuupäev', direction: 'descending' }],
    }
    if (startCursor) body.start_cursor = startCursor

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to query Notion reviews: ${response.status} - ${text}`)
    }

    const data = await response.json()
    for (const page of data.results || []) {
      results.push({ id: page.id, properties: page.properties || {} })
    }
    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor && results.length < needed)

  return results.slice(offset, offset + limit)
}

async function patchArvustuseTekst(apiKey: string, pageId: string, original: string) {
  const id = pageId.replace(/-/g, '')
  const maxAttempts = 4
  let lastError = 'unknown'

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          'Arvustuse tekst': {
            rich_text: toNotionRichText(original),
          },
        },
      }),
    })

    if (response.ok) return

    const text = await response.text()
    lastError = `${response.status}: ${text}`
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt === maxAttempts) {
      throw new Error(`Notion PATCH failed ${lastError}`)
    }
    const waitMs = Math.min(1000 * 2 ** (attempt - 1), 8000)
    console.warn(`  retry ${attempt}/${maxAttempts - 1} after ${waitMs}ms`)
    await sleep(waitMs)
  }

  throw new Error(`Notion PATCH failed ${lastError}`)
}

export async function resyncGmbReviewOriginalText(
  options: ResyncOriginalTextOptions = {},
): Promise<ResyncOriginalTextSummary> {
  const dryRun = options.dryRun !== false
  const limit = clampLimit(options.limit ?? defaultLimit())
  const offset = options.offset ?? 0

  const apiKey = assertEnv('NOTION_API_KEY')
  const databaseId = assertEnv('NOTION_REVIEWS_DATABASE_ID').replace(/-/g, '')

  const pages = await fetchNewestNotionReviewsWithGoogleId(apiKey, databaseId, offset, limit)
  const accessToken = await getGmbAccessToken()

  const summary: ResyncOriginalTextSummary = {
    dryRun,
    limit,
    offset,
    checked: 0,
    updated: 0,
    wouldUpdate: 0,
    unchanged: 0,
    skippedUncertain: 0,
    notFound: 0,
    errors: 0,
    errorSamples: [],
    skippedUncertainSamples: [],
  }

  console.log(
    JSON.stringify({
      note: 'PATCH only Arvustuse tekst. Does not touch Vastus / Kinnitatud / Vastus postitatud? / Vastuse postitamise kuupäev.',
      dryRun,
      limit,
      offset,
      batch: pages.length,
    }),
  )

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const props = page.properties
    const name = titlePlain(props['Nimi']) || 'Anonüümne'
    const reviewId = googleReviewIdFromPage(props)
    const notionText = normalizeReviewText(richTextPlain(props['Arvustuse tekst']))
    const rating = notionRating(props)
    const n = `${i + 1}/${pages.length}`

    if (!reviewId) {
      summary.checked++
      summary.skippedUncertain++
      const sample: SkippedUncertainSample = {
        pageId: page.id,
        reviewId: '',
        reviewerName: name,
        rating,
        notionTextStart: previewText(notionText),
        reason: 'no-review-id',
        gmb: null,
      }
      pushUncertainSample(summary, sample)
      console.log(`[${n}] SKIP no-review-id page=${page.id} ${name}`)
      continue
    }

    summary.checked++

    try {
      const gmb = await fetchGmbReviewById(reviewId, accessToken)
      if (!gmb) {
        summary.notFound++
        console.log(`[${n}] NOTFOUND reviewId=${reviewId} ${name}`)
        await sleep(GMB_GET_GAP_MS)
        continue
      }

      if (i === 0) {
        console.log(
          JSON.stringify({
            sampleGmbKeys: Object.keys(gmb),
            hasOriginalText: Boolean(gmb.originalText),
            hasOriginalComment: Boolean(gmb.originalComment),
            commentHasMarkers: gmbCommentLooksTranslated(gmb.comment),
          }),
        )
      }

      const diagnosis = diagnoseGmbOriginalPick(gmb)
      const original = diagnosis.picked
      if (!original || diagnosis.reason) {
        const reason = diagnosis.reason || 'parser-returned-null'
        summary.skippedUncertain++
        const sample: SkippedUncertainSample = {
          pageId: page.id,
          reviewId,
          reviewerName: name,
          rating,
          notionTextStart: previewText(notionText),
          reason,
          gmb: {
            starRating: gmb.starRating ?? null,
            comment: diagnosis.fields.comment,
            originalText: diagnosis.fields.originalText,
            originalComment: diagnosis.fields.originalComment,
            originalReviewText: diagnosis.fields.originalReviewText,
          },
        }
        pushUncertainSample(summary, sample)
        console.log(`[${n}] SKIP uncertain reviewId=${reviewId} ${name} reason=${reason}`)
        await sleep(GMB_GET_GAP_MS)
        continue
      }

      const gmbText = normalizeReviewText(original)
      const namedOriginal = Boolean(
        (gmb.originalComment && String(gmb.originalComment).trim()) ||
          (gmb.originalText && String(gmb.originalText).trim()),
      )
      const unmarkedComment = !namedOriginal && !gmbCommentLooksTranslated(gmb.comment || '')
      if (unmarkedComment && looksNonEnglish(notionText) && !looksNonEnglish(gmbText)) {
        summary.skippedUncertain++
        const sample: SkippedUncertainSample = {
          pageId: page.id,
          reviewId,
          reviewerName: name,
          rating,
          notionTextStart: previewText(notionText),
          reason: 'unmarked-en-over-et-ru',
          gmb: {
            starRating: gmb.starRating ?? null,
            comment: diagnosis.fields.comment,
            originalText: diagnosis.fields.originalText,
            originalComment: diagnosis.fields.originalComment,
            originalReviewText: diagnosis.fields.originalReviewText,
          },
        }
        pushUncertainSample(summary, sample)
        console.log(`[${n}] SKIP unmarked-en-over-et/ru reviewId=${reviewId} ${name}`)
        await sleep(GMB_GET_GAP_MS)
        continue
      }
      if (gmbText === notionText) {
        summary.unchanged++
        console.log(`[${n}] SAME reviewId=${reviewId} ${name}`)
        await sleep(GMB_GET_GAP_MS)
        continue
      }

      if (dryRun) {
        summary.wouldUpdate++
        console.log(`[${n}] DRY would-update reviewId=${reviewId} ${name}`)
        console.log(`  notion (${notionText.length}): ${notionText.slice(0, 180).replace(/\n/g, ' ')}`)
        console.log(`  gmb    (${gmbText.length}): ${gmbText.slice(0, 180).replace(/\n/g, ' ')}`)
        await sleep(GMB_GET_GAP_MS)
        continue
      }

      await patchArvustuseTekst(apiKey, page.id, original)
      summary.updated++
      console.log(`[${n}] UPDATED reviewId=${reviewId} ${name}`)
      await sleep(NOTION_PATCH_GAP_MS)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      summary.errors++
      if (summary.errorSamples.length < 10) {
        summary.errorSamples.push({ reviewId, pageId: page.id, error: message })
      }
      console.error(`[${n}] ERROR reviewId=${reviewId} ${name}  ${message}`)
      await sleep(GMB_GET_GAP_MS)
    }
  }

  console.log('--- KOKKUVÕTE ---')
  console.log(
    JSON.stringify(
      {
        checked: summary.checked,
        updated: summary.updated,
        wouldUpdate: summary.wouldUpdate,
        unchanged: summary.unchanged,
        skippedUncertain: summary.skippedUncertain,
        notFound: summary.notFound,
        errors: summary.errors,
        dryRun: summary.dryRun,
        limit: summary.limit,
        offset: summary.offset,
        errorSamples: summary.errorSamples,
        skippedUncertainSamples: summary.skippedUncertainSamples,
      },
      null,
      2,
    ),
  )

  return summary
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const summary = await resyncGmbReviewOriginalText({
    dryRun: options.dryRun,
    limit: options.limit,
    offset: options.offset,
  })
  if (summary.errors > 0) process.exit(1)
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Originaalteksti resync katkes:', error)
    process.exit(1)
  })
}
