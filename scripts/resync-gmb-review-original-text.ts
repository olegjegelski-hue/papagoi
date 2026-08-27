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
 *   npm run resync-gmb-review-originals -- --dry-run --review-id <GOOGLE_REVIEW_ID>
 *   npm run resync-gmb-review-originals -- --dry-run --review-ids id1,id2,id3
 *   npm run resync-gmb-review-originals -- --apply --limit=50
 *   npm run resync-gmb-review-originals -- --apply --limit=50 --offset=50
 */

const DEFAULT_LIMIT = 50
const HARD_MAX_LIMIT = 100
const MAX_TARGET_IDS = 20
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
  reviewIds?: string[]
  pageIds?: string[]
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

export type ReviewResyncDiagnostic = {
  pageId: string | null
  reviewId: string
  reviewerName: string | null
  rating: number | null
  notionTextStart: string
  wouldUpdate: boolean
  updated: boolean
  decision:
    | 'would-update'
    | 'updated'
    | 'unchanged'
    | 'skipped-uncertain'
    | 'not-found-notion'
    | 'not-found-gmb'
    | 'error'
  reason: string
  pickedOriginalStart: string | null
  gmb: {
    starRating: string | null
    gmbKeys: string[]
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
  targeted: boolean
  reviewIds: string[]
  pageIds: string[]
  checked: number
  updated: number
  wouldUpdate: number
  unchanged: number
  skippedUncertain: number
  notFound: number
  notFoundNotion: number
  errors: number
  errorSamples: { reviewId: string; pageId: string; error: string }[]
  skippedUncertainSamples: SkippedUncertainSample[]
  diagnostics: ReviewResyncDiagnostic[]
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

function parseArgs(argv: string[]): ResyncOriginalTextOptions {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run') || !apply
  const limitRaw = argv.find((a) => a.startsWith('--limit='))
  const offsetRaw = argv.find((a) => a.startsWith('--offset='))
  const limitParsed = limitRaw ? Number.parseInt(limitRaw.slice('--limit='.length), 10) : undefined
  const offsetParsed = offsetRaw ? Number.parseInt(offsetRaw.slice('--offset='.length), 10) : undefined
  const reviewIds = uniqueIds(
    takeFlagValues(argv, ['--review-id', '--review-ids']),
    normalizeGoogleReviewId,
    MAX_TARGET_IDS,
  )
  const pageIds = uniqueIds(
    takeFlagValues(argv, ['--page-id', '--page-ids']),
    (s) => s.replace(/-/g, '').trim(),
    MAX_TARGET_IDS,
  )
  return {
    dryRun,
    limit: limitParsed != null && Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : undefined,
    offset: offsetParsed != null && Number.isFinite(offsetParsed) && offsetParsed >= 0 ? offsetParsed : undefined,
    reviewIds: reviewIds.length > 0 ? reviewIds : undefined,
    pageIds: pageIds.length > 0 ? pageIds : undefined,
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
  return normalizeGoogleReviewId(raw)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function gmbFieldsFromDiagnosis(
  gmb: { starRating?: string | null } | null,
  diagnosis: ReturnType<typeof diagnoseGmbOriginalPick> | null,
  gmbKeys: string[] = [],
): ReviewResyncDiagnostic['gmb'] {
  if (!gmb || !diagnosis) return null
  return {
    starRating: gmb.starRating ?? null,
    gmbKeys,
    comment: diagnosis.fields.comment,
    originalText: diagnosis.fields.originalText,
    originalComment: diagnosis.fields.originalComment,
    originalReviewText: diagnosis.fields.originalReviewText,
  }
}

function decideRow(input: {
  page: NotionPage | null
  reviewId: string
  gmb: Parameters<typeof diagnoseGmbOriginalPick>[0] & { starRating?: string | null } | null
  gmbKeys: string[]
}): { diagnostic: ReviewResyncDiagnostic; applyOriginal: string | null } {
  const { page, reviewId, gmb, gmbKeys } = input
  const name = page ? titlePlain(page.properties['Nimi']) || 'Anonüümne' : null
  const rating = page ? notionRating(page.properties) : null
  const notionText = page ? normalizeReviewText(richTextPlain(page.properties['Arvustuse tekst'])) : ''
  const diagnosis = gmb ? diagnoseGmbOriginalPick(gmb) : null
  const gmbSnapshot = gmbFieldsFromDiagnosis(gmb, diagnosis, gmbKeys)

  const base = {
    pageId: page?.id ?? null,
    reviewId,
    reviewerName: name,
    rating,
    notionTextStart: previewText(notionText),
    wouldUpdate: false,
    updated: false,
    pickedOriginalStart: diagnosis?.picked ? previewText(diagnosis.picked) : null,
    gmb: gmbSnapshot,
  }

  if (!page && !gmb) {
    return {
      diagnostic: { ...base, decision: 'not-found-notion', reason: 'not-found-notion-and-gmb' },
      applyOriginal: null,
    }
  }
  if (!page) {
    return {
      diagnostic: { ...base, decision: 'not-found-notion', reason: 'not-found-notion' },
      applyOriginal: null,
    }
  }
  if (!gmb) {
    return {
      diagnostic: { ...base, decision: 'not-found-gmb', reason: 'not-found-gmb' },
      applyOriginal: null,
    }
  }
  if (!reviewId) {
    return {
      diagnostic: { ...base, decision: 'skipped-uncertain', reason: 'no-review-id' },
      applyOriginal: null,
    }
  }

  const original = diagnosis?.picked ?? null
  if (!original || diagnosis?.reason) {
    return {
      diagnostic: {
        ...base,
        decision: 'skipped-uncertain',
        reason: diagnosis?.reason || 'parser-returned-null',
      },
      applyOriginal: null,
    }
  }

  const gmbText = normalizeReviewText(original)
  const namedOriginal = Boolean(
    (gmb.originalComment && String(gmb.originalComment).trim()) ||
      (gmb.originalText && String(gmb.originalText).trim()),
  )
  const unmarkedComment = !namedOriginal && !gmbCommentLooksTranslated(gmb.comment || '')
  if (unmarkedComment && looksNonEnglish(notionText) && !looksNonEnglish(gmbText)) {
    return {
      diagnostic: { ...base, decision: 'skipped-uncertain', reason: 'unmarked-en-over-et-ru' },
      applyOriginal: null,
    }
  }
  if (gmbText === notionText) {
    return {
      diagnostic: { ...base, decision: 'unchanged', reason: 'gmb-matches-notion' },
      applyOriginal: null,
    }
  }

  return {
    diagnostic: {
      ...base,
      wouldUpdate: true,
      decision: 'would-update',
      reason: 'confident-original-differs',
    },
    applyOriginal: original,
  }
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
  const filter =
    containsFilters.length === 1 ? containsFilters[0] : { or: containsFilters }

  const results: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, any> = {
      page_size: 100,
      filter,
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
      throw new Error(`Failed to query Notion reviews by ID: ${response.status} - ${text}`)
    }

    const data = await response.json()
    for (const page of data.results || []) {
      results.push({ id: page.id, properties: page.properties || {} })
    }
    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  return results
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
  const reviewIds = uniqueIds(options.reviewIds || [], normalizeGoogleReviewId, MAX_TARGET_IDS)
  const pageIds = uniqueIds(options.pageIds || [], (s) => s.replace(/-/g, '').trim(), MAX_TARGET_IDS)
  const targeted = reviewIds.length > 0 || pageIds.length > 0
  const limit = targeted ? Math.max(reviewIds.length + pageIds.length, 1) : clampLimit(options.limit ?? defaultLimit())
  const offset = targeted ? 0 : options.offset ?? 0

  const apiKey = assertEnv('NOTION_API_KEY')
  const databaseId = assertEnv('NOTION_REVIEWS_DATABASE_ID').replace(/-/g, '')
  const accessToken = await getGmbAccessToken()

  const summary: ResyncOriginalTextSummary = {
    dryRun,
    limit,
    offset,
    targeted,
    reviewIds,
    pageIds,
    checked: 0,
    updated: 0,
    wouldUpdate: 0,
    unchanged: 0,
    skippedUncertain: 0,
    notFound: 0,
    notFoundNotion: 0,
    errors: 0,
    errorSamples: [],
    skippedUncertainSamples: [],
    diagnostics: [],
  }

  type WorkItem = { reviewId: string; page: NotionPage | null; requestedPageId?: string }
  const work: WorkItem[] = []

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
        if (matches.length === 0) work.push({ reviewId: id, page: null })
        else for (const page of matches) work.push({ reviewId: id, page })
      }
    }

    const seenPageIds = new Set(work.map((w) => w.page?.id).filter(Boolean) as string[])
    for (const pageId of pageIds) {
      const page = await fetchNotionPageById(apiKey, pageId)
      if (!page) {
        work.push({ reviewId: '', page: null, requestedPageId: pageId })
        continue
      }
      if (seenPageIds.has(page.id)) continue
      seenPageIds.add(page.id)
      work.push({ reviewId: googleReviewIdFromPage(page.properties), page })
    }
  } else {
    const pages = await fetchNewestNotionReviewsWithGoogleId(apiKey, databaseId, offset, limit)
    for (const page of pages) {
      work.push({ reviewId: googleReviewIdFromPage(page.properties), page })
    }
  }

  console.log(
    JSON.stringify({
      note: 'PATCH only Arvustuse tekst. Does not touch Vastus / Kinnitatud / Vastus postitatud? / Vastuse postitamise kuupäev.',
      dryRun,
      targeted,
      reviewIds,
      pageIds,
      limit,
      offset,
      batch: work.length,
    }),
  )

  function recordDiagnostic(diagnostic: ReviewResyncDiagnostic) {
    if (targeted || diagnostic.decision === 'skipped-uncertain' || diagnostic.decision === 'would-update') {
      summary.diagnostics.push(diagnostic)
    }
    if (diagnostic.decision === 'skipped-uncertain') {
      pushUncertainSample(summary, {
        pageId: diagnostic.pageId || '',
        reviewId: diagnostic.reviewId,
        reviewerName: diagnostic.reviewerName || '',
        rating: diagnostic.rating,
        notionTextStart: diagnostic.notionTextStart,
        reason: diagnostic.reason,
        gmb: diagnostic.gmb
          ? {
              starRating: diagnostic.gmb.starRating,
              comment: diagnostic.gmb.comment,
              originalText: diagnostic.gmb.originalText,
              originalComment: diagnostic.gmb.originalComment,
              originalReviewText: diagnostic.gmb.originalReviewText,
            }
          : null,
      })
    }
  }

  for (let i = 0; i < work.length; i++) {
    const item = work[i]
    const page = item.page
    const reviewId = item.reviewId
    const name = page ? titlePlain(page.properties['Nimi']) || 'Anonüümne' : '—'
    const n = `${i + 1}/${work.length}`
    summary.checked++

    try {
      const gmb = reviewId ? await fetchGmbReviewById(reviewId, accessToken) : null
      const gmbKeys = gmb ? Object.keys(gmb) : []
      const { diagnostic, applyOriginal } = decideRow({
        page,
        reviewId: reviewId || item.requestedPageId || '',
        gmb,
        gmbKeys,
      })
      if (!page && item.requestedPageId && !diagnostic.pageId) {
        diagnostic.pageId = item.requestedPageId
      }

      if (diagnostic.decision === 'not-found-gmb' || diagnostic.reason === 'not-found-notion-and-gmb') {
        summary.notFound++
      }
      if (diagnostic.decision === 'not-found-notion') {
        summary.notFoundNotion++
      }
      if (diagnostic.decision === 'skipped-uncertain') summary.skippedUncertain++
      if (diagnostic.decision === 'unchanged') summary.unchanged++
      if (diagnostic.decision === 'would-update') summary.wouldUpdate++

      if (i === 0 && gmb) {
        console.log(
          JSON.stringify({
            sampleGmbKeys: gmbKeys,
            hasOriginalText: Boolean(gmb.originalText),
            hasOriginalComment: Boolean(gmb.originalComment),
            commentHasMarkers: gmbCommentLooksTranslated(gmb.comment),
          }),
        )
      }

      if (applyOriginal && page && !dryRun) {
        await patchArvustuseTekst(apiKey, page.id, applyOriginal)
        diagnostic.updated = true
        diagnostic.wouldUpdate = false
        diagnostic.decision = 'updated'
        diagnostic.reason = 'updated'
        summary.wouldUpdate = Math.max(0, summary.wouldUpdate - 1)
        summary.updated++
        recordDiagnostic(diagnostic)
        console.log(`[${n}] UPDATED reviewId=${reviewId} ${name}`)
        await sleep(NOTION_PATCH_GAP_MS)
        continue
      }

      recordDiagnostic(diagnostic)
      console.log(`[${n}] ${diagnostic.decision} reviewId=${reviewId} ${name} reason=${diagnostic.reason}`)
      if (diagnostic.decision === 'would-update') {
        console.log(`  notion: ${diagnostic.notionTextStart}`)
        console.log(`  gmb:    ${diagnostic.pickedOriginalStart || ''}`)
      }
      await sleep(GMB_GET_GAP_MS)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      summary.errors++
      if (summary.errorSamples.length < 10) {
        summary.errorSamples.push({ reviewId, pageId: page?.id || item.requestedPageId || '', error: message })
      }
      const diagnostic: ReviewResyncDiagnostic = {
        pageId: page?.id || item.requestedPageId || null,
        reviewId,
        reviewerName: name === '—' ? null : name,
        rating: page ? notionRating(page.properties) : null,
        notionTextStart: page ? previewText(normalizeReviewText(richTextPlain(page.properties['Arvustuse tekst']))) : '',
        wouldUpdate: false,
        updated: false,
        decision: 'error',
        reason: message.slice(0, 180),
        pickedOriginalStart: null,
        gmb: null,
      }
      recordDiagnostic(diagnostic)
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
        notFoundNotion: summary.notFoundNotion,
        errors: summary.errors,
        dryRun: summary.dryRun,
        targeted: summary.targeted,
        reviewIds: summary.reviewIds,
        pageIds: summary.pageIds,
        limit: summary.limit,
        offset: summary.offset,
        errorSamples: summary.errorSamples,
        skippedUncertainSamples: summary.skippedUncertainSamples,
        diagnostics: summary.diagnostics,
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
    reviewIds: options.reviewIds,
    pageIds: options.pageIds,
  })
  if (summary.errors > 0) process.exit(1)
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Originaalteksti resync katkes:', error)
    process.exit(1)
  })
}
