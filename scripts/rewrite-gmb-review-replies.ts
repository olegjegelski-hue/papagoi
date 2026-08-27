import 'dotenv/config'

/**
 * Käsitsi vanade postitamata GMB vastuste AI rewrite.
 * Ei ole cron. Ei postita Google’isse. Vaikimisi dry-run.
 *
 *   npm run rewrite-gmb-review-replies -- --dry-run
 *   npm run rewrite-gmb-review-replies -- --dry-run --limit=5
 *   npm run rewrite-gmb-review-replies -- --dry-run --review-ids id1,id2
 *   Esimene apply soovitatavalt --limit=5 või --limit=10 (max 20).
 *   npm run rewrite-gmb-review-replies -- --apply --limit=5
 */

import { generateGmbReviewReplyDraft, isGmbReplyAiRateLimitError } from '@/lib/ai/gmb-review-reply-client'
import { extractOriginalGmbComment, toNotionRichText } from '@/lib/gmb-review-comment'
import {
  GMB_REWRITE_ALLOWED_STATUSES,
  GMB_STATUS,
  isGmbReplySafeToRewrite,
} from '@/lib/gmb-review-workflow'

const DEFAULT_LIMIT = 10
const HARD_MAX_LIMIT = 20
const MAX_TARGET_IDS = 20
const MAX_SAMPLES = 10
const TEXT_PREVIEW_LEN = 180
const DEFAULT_AI_GAP_MS = 2500
const RATE_LIMIT_RETRY_MS = 8000

type NotionPage = {
  id: string
  properties: Record<string, any>
}

export type RewriteGmbRepliesOptions = {
  dryRun?: boolean
  limit?: number
  reviewIds?: string[]
  pageIds?: string[]
}

export type RewriteGmbReplySample = {
  pageId: string
  reviewId: string
  reviewerName: string
  rating: number | null
  reviewTextStart: string
  oldReplyStart: string
  newReplyStart: string | null
  replyType: string | null
  decision: 'draft' | 'skip' | 'skipped-unsafe' | 'error' | 'rate-limited' | 'batch-stopped'
  reason: string
}

export type RewriteGmbRepliesSummary = {
  dryRun: boolean
  targeted: boolean
  reviewIds: string[]
  pageIds: string[]
  checked: number
  processing: number
  wouldRewrite: number
  rewritten: number
  skipped: number
  rateLimited: number
  errors: number
  stoppedEarly: boolean
  samples: RewriteGmbReplySample[]
}

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function splitIds(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeGoogleReviewId(raw: string): string {
  const s = raw.trim()
  if (!s) return ''
  const parts = s.split('/')
  const idx = parts.lastIndexOf('reviews')
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
  return s
}

function uniqueIds(raws: string[], normalize: (s: string) => string, max: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of raws) {
    const id = normalize(raw)
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
    if (out.length >= max) break
  }
  return out
}

function takeFlagValues(argv: string[], names: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    for (const name of names) {
      if (a === name && argv[i + 1] && !argv[i + 1].startsWith('--')) {
        out.push(argv[i + 1])
        i++
        break
      }
      if (a.startsWith(`${name}=`)) {
        out.push(a.slice(name.length + 1))
        break
      }
    }
  }
  return out
}

function parseArgs(argv: string[]): RewriteGmbRepliesOptions {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run') || !apply
  const limitRaw = argv.find((a) => a.startsWith('--limit='))
  const limitParsed = limitRaw ? Number.parseInt(limitRaw.slice('--limit='.length), 10) : undefined
  const reviewIds = uniqueIds(
    takeFlagValues(argv, ['--review-id', '--review-ids']).flatMap(splitIds),
    normalizeGoogleReviewId,
    MAX_TARGET_IDS,
  )
  const pageIds = uniqueIds(
    takeFlagValues(argv, ['--page-id', '--page-ids']).flatMap(splitIds),
    (s) => s.replace(/-/g, '').trim(),
    MAX_TARGET_IDS,
  )
  return {
    dryRun,
    limit: limitParsed != null && Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : undefined,
    reviewIds: reviewIds.length > 0 ? reviewIds : undefined,
    pageIds: pageIds.length > 0 ? pageIds : undefined,
  }
}

function defaultLimit(): number {
  const raw = process.env.GMB_REPLY_REWRITE_LIMIT?.trim()
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_LIMIT
  return clampLimit(Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT)
}

function clampLimit(n: number): number {
  return Math.min(Math.max(1, n), HARD_MAX_LIMIT)
}

function aiGapMs(): number {
  const raw = process.env.GMB_REPLY_REWRITE_GAP_MS?.trim()
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_AI_GAP_MS
  if (!Number.isFinite(n) || n < 1500) return DEFAULT_AI_GAP_MS
  return Math.min(n, 10000)
}

async function generateDraftWithOneRetry(input: {
  reviewerName: string
  rating: number | null
  reviewText: string | null
  reviewDate: string | null
}) {
  try {
    return await generateGmbReviewReplyDraft(input)
  } catch (error) {
    if (!isGmbReplyAiRateLimitError(error)) throw error
    await sleep(RATE_LIMIT_RETRY_MS)
    return await generateGmbReviewReplyDraft(input)
  }
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

function previewText(value: string, max = TEXT_PREVIEW_LEN): string {
  return value.replace(/\r\n/g, '\n').replace(/\n/g, ' ').trim().slice(0, max)
}

function googleReviewIdFromPage(properties: Record<string, any>): string {
  return normalizeGoogleReviewId(richTextPlain(properties['Google review ID']))
}

function notionRating(properties: Record<string, any>): number | null {
  const n = properties['Hinne']?.number
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function reviewDateIso(properties: Record<string, any>): string {
  return typeof properties['Arvustuse kuupäev']?.date?.start === 'string'
    ? properties['Arvustuse kuupäev'].date.start
    : ''
}

function gateInputFromPage(properties: Record<string, any>) {
  return {
    status: properties['Staatus']?.select?.name || null,
    confirmed: properties['Kinnitatud']?.checkbox === true,
    replyPosted: properties['Vastus postitatud?']?.checkbox === true,
    replyText: richTextPlain(properties['Vastus']),
    reviewId: googleReviewIdFromPage(properties),
  }
}

function ratingRank(rating: number | null): number {
  if (rating != null && rating >= 1 && rating <= 4) return 0
  if (rating === 5) return 1
  return 2
}

function sortRewriteCandidates(pages: NotionPage[]): NotionPage[] {
  return [...pages].sort((a, b) => {
    const aText = richTextPlain(a.properties['Arvustuse tekst']).trim() ? 0 : 1
    const bText = richTextPlain(b.properties['Arvustuse tekst']).trim() ? 0 : 1
    if (aText !== bText) return aText - bText
    const aRank = ratingRank(notionRating(a.properties))
    const bRank = ratingRank(notionRating(b.properties))
    if (aRank !== bRank) return aRank - bRank
    return reviewDateIso(b.properties).localeCompare(reviewDateIso(a.properties))
  })
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function notionHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }
}

async function queryNotionPages(apiKey: string, databaseId: string, filter: Record<string, any>): Promise<NotionPage[]> {
  const results: NotionPage[] = []
  let startCursor: string | undefined
  do {
    const body: Record<string, any> = { page_size: 100, filter }
    if (startCursor) body.start_cursor = startCursor
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: notionHeaders(apiKey),
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to query Notion rewrite candidates: ${response.status} - ${text}`)
    }
    const data = await response.json()
    for (const page of data.results || []) {
      results.push({ id: page.id, properties: page.properties || {} })
    }
    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)
  return results
}

async function fetchRewriteCandidates(apiKey: string, databaseId: string): Promise<NotionPage[]> {
  return queryNotionPages(apiKey, databaseId, {
    and: [
      { property: 'Google review ID', rich_text: { is_not_empty: true } },
      { property: 'Vastus', rich_text: { is_not_empty: true } },
      { property: 'Kinnitatud', checkbox: { equals: false } },
      { property: 'Vastus postitatud?', checkbox: { equals: false } },
      {
        or: GMB_REWRITE_ALLOWED_STATUSES.map((status) => ({
          property: 'Staatus',
          select: { equals: status },
        })),
      },
    ],
  })
}

async function fetchNotionReviewsByGoogleIds(
  apiKey: string,
  databaseId: string,
  reviewIds: string[],
): Promise<NotionPage[]> {
  if (reviewIds.length === 0) return []
  const containsFilters = reviewIds.map((id) => ({
    property: 'Google review ID',
    rich_text: { contains: id },
  }))
  return queryNotionPages(
    apiKey,
    databaseId,
    containsFilters.length === 1 ? containsFilters[0] : { or: containsFilters },
  )
}

async function fetchNotionPageById(apiKey: string, pageId: string): Promise<NotionPage | null> {
  const id = pageId.replace(/-/g, '')
  const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (response.status === 404) return null
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch Notion page ${id}: ${response.status} - ${text}`)
  }
  const page = await response.json()
  return { id: page.id, properties: page.properties || {} }
}

async function patchNotion(pageId: string, properties: Record<string, any>) {
  const apiKey = assertEnv('NOTION_API_KEY')
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId.replace(/-/g, '')}`, {
    method: 'PATCH',
    headers: notionHeaders(apiKey),
    body: JSON.stringify({ properties }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Notion PATCH failed ${response.status}: ${text}`)
  }
}

function pushSample(summary: RewriteGmbRepliesSummary, sample: RewriteGmbReplySample) {
  if (summary.samples.length >= MAX_SAMPLES) return
  summary.samples.push(sample)
}

export async function rewriteGmbReviewReplies(
  options: RewriteGmbRepliesOptions = {},
): Promise<RewriteGmbRepliesSummary> {
  const dryRun = options.dryRun !== false
  const reviewIds = uniqueIds(options.reviewIds || [], normalizeGoogleReviewId, MAX_TARGET_IDS)
  const pageIds = uniqueIds(options.pageIds || [], (s) => s.replace(/-/g, '').trim(), MAX_TARGET_IDS)
  const targeted = reviewIds.length > 0 || pageIds.length > 0
  const limit = targeted ? Math.max(reviewIds.length + pageIds.length, 1) : clampLimit(options.limit ?? defaultLimit())

  const apiKey = assertEnv('NOTION_API_KEY')
  const databaseId = assertEnv('NOTION_REVIEWS_DATABASE_ID').replace(/-/g, '')

  type WorkItem = { page: NotionPage | null; reviewId: string; requestedPageId?: string }
  let work: WorkItem[] = []

  if (targeted) {
    const notionByReviewId = new Map<string, NotionPage[]>()
    if (reviewIds.length > 0) {
      const found = await fetchNotionReviewsByGoogleIds(apiKey, databaseId, reviewIds)
      for (const page of found) {
        const id = googleReviewIdFromPage(page.properties)
        if (!id) continue
        const list = notionByReviewId.get(id) || []
        list.push(page)
        notionByReviewId.set(id, list)
      }
      for (const id of reviewIds) {
        const matches = notionByReviewId.get(id) || []
        if (matches.length === 0) work.push({ page: null, reviewId: id })
        else for (const page of matches) work.push({ page, reviewId: id })
      }
    }
    const seenPageIds = new Set(work.map((w) => w.page?.id).filter(Boolean) as string[])
    for (const pageId of pageIds) {
      const page = await fetchNotionPageById(apiKey, pageId)
      if (!page) {
        work.push({ page: null, reviewId: '', requestedPageId: pageId })
        continue
      }
      if (seenPageIds.has(page.id)) continue
      seenPageIds.add(page.id)
      work.push({ page, reviewId: googleReviewIdFromPage(page.properties), requestedPageId: pageId })
    }
  } else {
    const pages = sortRewriteCandidates(await fetchRewriteCandidates(apiKey, databaseId)).slice(0, limit)
    work = pages.map((page) => ({ page, reviewId: googleReviewIdFromPage(page.properties) }))
  }

  const summary: RewriteGmbRepliesSummary = {
    dryRun,
    targeted,
    reviewIds,
    pageIds,
    checked: 0,
    processing: 0,
    wouldRewrite: 0,
    rewritten: 0,
    skipped: 0,
    rateLimited: 0,
    errors: 0,
    stoppedEarly: false,
    samples: [],
  }

  const gapMs = aiGapMs()
  let stopRemaining = false

  console.log(
    JSON.stringify({
      note: 'Manual GMB reply rewrite. Never posts to Google. Default dry-run. apply=1 writes Notion only. Sequential AI with throttle; 429 stops the batch.',
      dryRun,
      targeted,
      reviewIds,
      pageIds,
      limit,
      batch: work.length,
      aiGapMs: gapMs,
    }),
  )

  for (let i = 0; i < work.length; i++) {
    const item = work[i]
    const page = item.page
    const n = `${i + 1}/${work.length}`
    summary.checked++

    if (stopRemaining) {
      summary.skipped++
      pushSample(summary, {
        pageId: page?.id || item.requestedPageId || '',
        reviewId: item.reviewId,
        reviewerName: page ? titlePlain(page.properties['Nimi']) || 'Anonüümne' : '',
        rating: page ? notionRating(page.properties) : null,
        reviewTextStart: page ? previewText(richTextPlain(page.properties['Arvustuse tekst'])) : '',
        oldReplyStart: page ? previewText(richTextPlain(page.properties['Vastus'])) : '',
        newReplyStart: null,
        replyType: null,
        decision: 'batch-stopped',
        reason: 'batch-stopped-after-rate-limit',
      })
      console.log(`[${n}] STOPPED reviewId=${item.reviewId} after rate limit`)
      continue
    }

    if (!page) {
      summary.skipped++
      pushSample(summary, {
        pageId: item.requestedPageId || '',
        reviewId: item.reviewId,
        reviewerName: '',
        rating: null,
        reviewTextStart: '',
        oldReplyStart: '',
        newReplyStart: null,
        replyType: null,
        decision: 'skipped-unsafe',
        reason: item.requestedPageId ? 'not-found-notion-page' : 'not-found-notion',
      })
      console.log(`[${n}] SKIP not-found reviewId=${item.reviewId}`)
      continue
    }

    const props = page.properties
    const name = titlePlain(props['Nimi']) || 'Anonüümne'
    const reviewId = item.reviewId || googleReviewIdFromPage(props)
    const rating = notionRating(props)
    const reviewTextRaw = richTextPlain(props['Arvustuse tekst'])
    const reviewText = extractOriginalGmbComment(reviewTextRaw)
    const oldReply = richTextPlain(props['Vastus'])
    const gate = isGmbReplySafeToRewrite(gateInputFromPage(props))

    if (!gate.ok) {
      summary.skipped++
      pushSample(summary, {
        pageId: page.id,
        reviewId,
        reviewerName: name,
        rating,
        reviewTextStart: previewText(reviewTextRaw),
        oldReplyStart: previewText(oldReply),
        newReplyStart: null,
        replyType: null,
        decision: 'skipped-unsafe',
        reason: gate.reason,
      })
      console.log(`[${n}] SKIP unsafe page=${page.id} reviewId=${reviewId} ${gate.reason}`)
      continue
    }

    summary.processing++
    const reviewDate = props['Arvustuse kuupäev']?.date?.start || null

    try {
      const ai = await generateDraftWithOneRetry({
        reviewerName: name,
        rating,
        reviewText,
        reviewDate,
      })

      if (ai.decision === 'skip') {
        summary.skipped++
        pushSample(summary, {
          pageId: page.id,
          reviewId,
          reviewerName: name,
          rating,
          reviewTextStart: previewText(reviewTextRaw),
          oldReplyStart: previewText(oldReply),
          newReplyStart: null,
          replyType: null,
          decision: 'skip',
          reason: ai.reason,
        })
        console.log(`[${n}] SKIP ai page=${page.id} reviewId=${reviewId}: ${ai.reason}`)
        if (!dryRun) {
          await patchNotion(page.id, {
            Vastus: { rich_text: [] },
            Staatus: { select: { name: GMB_STATUS.skip } },
            Kinnitatud: { checkbox: false },
            'Vastus postitatud?': { checkbox: false },
          })
        }
        await sleep(gapMs)
        continue
      }

      const newReply = (ai.reply || '').trim()
      pushSample(summary, {
        pageId: page.id,
        reviewId,
        reviewerName: name,
        rating,
        reviewTextStart: previewText(reviewTextRaw),
        oldReplyStart: previewText(oldReply),
        newReplyStart: previewText(newReply),
        replyType: ai.replyType,
        decision: 'draft',
        reason: ai.reason,
      })

      if (dryRun) {
        summary.wouldRewrite++
        console.log(`[${n}] DRY would-rewrite page=${page.id} reviewId=${reviewId} type=${ai.replyType}`)
        console.log(`  old: ${previewText(oldReply)}`)
        console.log(`  new: ${previewText(newReply)}`)
        await sleep(gapMs)
        continue
      }

      const properties: Record<string, any> = {
        Vastus: { rich_text: toNotionRichText(newReply) },
        Staatus: { select: { name: GMB_STATUS.draft } },
        Kinnitatud: { checkbox: false },
        'Vastus postitatud?': { checkbox: false },
      }
      if (ai.replyType) {
        properties['Automaatse vastuse tüüp'] = { select: { name: ai.replyType } }
      }
      await patchNotion(page.id, properties)
      summary.rewritten++
      console.log(`[${n}] REWRITE page=${page.id} reviewId=${reviewId} type=${ai.replyType}`)
      await sleep(gapMs)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (isGmbReplyAiRateLimitError(error)) {
        summary.rateLimited++
        summary.stoppedEarly = true
        stopRemaining = true
        pushSample(summary, {
          pageId: page.id,
          reviewId,
          reviewerName: name,
          rating,
          reviewTextStart: previewText(reviewTextRaw),
          oldReplyStart: previewText(oldReply),
          newReplyStart: null,
          replyType: null,
          decision: 'rate-limited',
          reason: message.slice(0, TEXT_PREVIEW_LEN),
        })
        console.warn(`[${n}] RATE_LIMITED page=${page.id} reviewId=${reviewId} — stopping batch; Notion unchanged`)
        continue
      }
      summary.errors++
      pushSample(summary, {
        pageId: page.id,
        reviewId,
        reviewerName: name,
        rating,
        reviewTextStart: previewText(reviewTextRaw),
        oldReplyStart: previewText(oldReply),
        newReplyStart: null,
        replyType: null,
        decision: 'error',
        reason: message.slice(0, TEXT_PREVIEW_LEN),
      })
      console.error(`[${n}] ERROR page=${page.id} reviewId=${reviewId}: ${message}`)
      if (!dryRun) {
        try {
          await patchNotion(page.id, {
            Staatus: { select: { name: GMB_STATUS.error } },
            Kinnitatud: { checkbox: false },
            'Vastus postitatud?': { checkbox: false },
          })
        } catch {
          console.error(`Failed to mark Viga for page=${page.id}`)
        }
      }
      await sleep(gapMs)
    }
  }

  console.log('--- KOKKUVÕTE ---')
  console.log(
    JSON.stringify(
      {
        dryRun: summary.dryRun,
        targeted: summary.targeted,
        checked: summary.checked,
        processing: summary.processing,
        wouldRewrite: summary.wouldRewrite,
        rewritten: summary.rewritten,
        skipped: summary.skipped,
        rateLimited: summary.rateLimited,
        errors: summary.errors,
        stoppedEarly: summary.stoppedEarly,
        samples: summary.samples,
      },
      null,
      2,
    ),
  )
  return summary
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const summary = await rewriteGmbReviewReplies(options)
  if (summary.errors > 0) process.exit(1)
}

if (require.main === module) {
  main().catch((error) => {
    console.error('GMB reply rewrite katkes:', error)
    process.exit(1)
  })
}
