import 'dotenv/config'

/**
 * Mustandid ridadele Staatus=Uus, tühi Vastus, alates GMB_AUTO_REPLY_SINCE.
 * Tekstiga read: AI. Tärnita 4–5★: koodi eesti variandid. Tärnita 1–3★: Ei vasta.
 * Cron: kohe pärast sync-gmb-reviews. Vanade rewrite: scripts/rewrite-gmb-review-replies.ts.
 *
 *   npx tsx scripts/generate-google-review-replies.ts
 *   npx tsx scripts/generate-google-review-replies.ts --backfill-starless
 */

import {
  generateGmbReviewReplyDraft,
  isGmbReplyAiRateLimitError,
} from '@/lib/ai/gmb-review-reply-client'
import { extractOriginalGmbComment, toNotionRichText } from '@/lib/gmb-review-comment'
import { tallinnHour } from '@/lib/gmb-review-generate-window'
import { GMB_STATUS } from '@/lib/gmb-review-workflow'
import {
  autoReplySinceDate,
  generateReplyType,
  generateStarlessAutoReplyDraft,
  hasReviewTextForReply,
} from '@/lib/google-review-replies'

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

type NotionPage = {
  id: string
  properties: Record<string, any>
}

export type GenerateGmbRepliesOptions = {
  dryRun?: boolean
  /** Alles API/CLI ühilduvuseks; ajaakent enam pole. */
  force?: boolean
  limit?: number
  backfillStarless?: boolean
}

export type GenerateGmbRepliesSummary = {
  tallinnHour: string
  found: number
  drafted: number
  starlessDrafted: number
  skipped: number
  errors: number
  rateLimited: boolean
  stoppedEarly: boolean
  dryRun: boolean
  backfillStarless?: boolean
}

const DEFAULT_AI_GAP_MS = 2500
const STARLESS_GAP_MS = 350
const MULL_MULL_PAGE_ID = '321a1c6a247e81329076de049efb6a72'

function parseArgs(argv: string[]): GenerateGmbRepliesOptions {
  const dryRun = argv.includes('--dry-run')
  const force = argv.includes('--force')
  const backfillStarless = argv.includes('--backfill-starless')
  const limitRaw = argv.find((a) => a.startsWith('--limit='))
  const limit = limitRaw ? Number.parseInt(limitRaw.slice('--limit='.length), 10) : undefined
  return {
    dryRun,
    force,
    backfillStarless,
    limit: limit != null && Number.isFinite(limit) && limit > 0 ? limit : undefined,
  }
}

function defaultLimit(): number {
  const raw = process.env.GMB_REPLY_GENERATE_LIMIT?.trim()
  const n = raw ? Number.parseInt(raw, 10) : 25
  return Number.isFinite(n) && n > 0 ? n : 25
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

function notionRating(props: Record<string, any>): number | null {
  const n = props['Hinne']?.number
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function normalizePageId(id: string): string {
  return id.replace(/-/g, '').toLowerCase()
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function queryNotionPages(filter: Record<string, any>): Promise<NotionPage[]> {
  const apiKey = assertEnv('NOTION_API_KEY')
  const databaseId = assertEnv('NOTION_REVIEWS_DATABASE_ID').replace(/-/g, '')
  const results: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, any> = { page_size: 100, filter }
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
      throw new Error(`Failed to query Notion generate candidates: ${response.status} - ${text}`)
    }
    const data = await response.json()
    for (const page of data.results || []) {
      results.push({ id: page.id, properties: page.properties || {} })
    }
    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  return results
}

async function fetchCandidatePages(): Promise<NotionPage[]> {
  return queryNotionPages({
    and: [
      { property: 'Staatus', select: { equals: GMB_STATUS.uus } },
      { property: 'Vastus', rich_text: { is_empty: true } },
      { property: 'Kinnitatud', checkbox: { equals: false } },
      { property: 'Vastus postitatud?', checkbox: { equals: false } },
      { property: 'Google review ID', rich_text: { is_not_empty: true } },
      {
        property: 'Arvustuse kuupäev',
        date: { on_or_after: autoReplySinceDate() },
      },
    ],
  })
}

async function fetchStarlessSkipBackfillPages(): Promise<NotionPage[]> {
  return queryNotionPages({
    and: [
      { property: 'Staatus', select: { equals: GMB_STATUS.skip } },
      { property: 'Kinnitatud', checkbox: { equals: false } },
      { property: 'Vastus postitatud?', checkbox: { equals: false } },
      { property: 'Google review ID', rich_text: { is_not_empty: true } },
    ],
  })
}

function isSafeCandidate(props: Record<string, any>): boolean {
  const status = props['Staatus']?.select?.name
  if (status !== GMB_STATUS.uus) return false
  if (richTextPlain(props['Vastus']).trim()) return false
  if (props['Kinnitatud']?.checkbox === true) return false
  if (props['Vastus postitatud?']?.checkbox === true) return false
  if (!richTextPlain(props['Google review ID']).trim()) return false
  return true
}

function draftProperties(reply: string, rating: number | null): Record<string, any> {
  const properties: Record<string, any> = {
    Vastus: { rich_text: toNotionRichText(reply) },
    Staatus: { select: { name: GMB_STATUS.draft } },
    Kinnitatud: { checkbox: false },
    'Vastus postitatud?': { checkbox: false },
  }
  const replyType = generateReplyType(rating)
  if (replyType) {
    properties['Automaatse vastuse tüüp'] = { select: { name: replyType } }
  }
  return properties
}

async function patchNotion(pageId: string, properties: Record<string, any>) {
  const apiKey = assertEnv('NOTION_API_KEY')
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId.replace(/-/g, '')}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Notion PATCH failed ${response.status}: ${text}`)
  }
}

async function writeStarlessDraft(input: {
  pageId: string
  reviewId: string
  rating: number | null
  dryRun: boolean
}): Promise<string> {
  const reply = generateStarlessAutoReplyDraft({
    reviewId: input.reviewId,
    rating: input.rating,
  })
  if (!reply) {
    throw new Error('starless variant puudub (hinne või reviewId)')
  }
  if (!input.dryRun) {
    await patchNotion(input.pageId, draftProperties(reply, input.rating))
  }
  return reply
}

export async function backfillStarlessSkipReplies(
  options: GenerateGmbRepliesOptions = {},
): Promise<GenerateGmbRepliesSummary> {
  const dryRun = Boolean(options.dryRun)
  const hour = tallinnHour()
  const pages = await fetchStarlessSkipBackfillPages()

  const eligible = pages.filter((page) => {
    if (normalizePageId(page.id) === MULL_MULL_PAGE_ID) return false
    const props = page.properties
    if (titlePlain(props['Nimi']) === 'Mull Mull') return false
    if (props['Kinnitatud']?.checkbox === true) return false
    if (props['Vastus postitatud?']?.checkbox === true) return false
    if (props['Staatus']?.select?.name !== GMB_STATUS.skip) return false
    if (hasReviewTextForReply(richTextPlain(props['Arvustuse tekst']))) return false
    const rating = notionRating(props)
    return rating === 4 || rating === 5
  })

  const targets = options.limit != null ? eligible.slice(0, options.limit) : eligible

  console.log(
    JSON.stringify({
      backfillStarless: true,
      tallinnHour: hour,
      found: pages.length,
      eligible: eligible.length,
      processing: targets.length,
      dryRun,
    }),
  )

  let drafted = 0
  let skipped = pages.length - eligible.length
  let errors = 0

  for (let i = 0; i < targets.length; i++) {
    const page = targets[i]
    const props = page.properties
    const name = titlePlain(props['Nimi']) || 'Anonüümne'
    const reviewId = richTextPlain(props['Google review ID']).trim()
    const rating = notionRating(props)
    const n = `${i + 1}/${targets.length}`

    try {
      const reply = await writeStarlessDraft({
        pageId: page.id,
        reviewId,
        rating,
        dryRun,
      })
      drafted++
      console.log(
        `[${n}] ${dryRun ? 'DRY' : 'DRAFT'} name=${name} page=${page.id} hinne=${rating} reply=${reply}`,
      )
    } catch (error) {
      errors++
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[${n}] ERROR name=${name} page=${page.id} reviewId=${reviewId}: ${message}`)
    }

    await sleep(STARLESS_GAP_MS)
  }

  const summary: GenerateGmbRepliesSummary = {
    tallinnHour: hour,
    found: pages.length,
    drafted,
    starlessDrafted: drafted,
    skipped,
    errors,
    rateLimited: false,
    stoppedEarly: false,
    dryRun,
    backfillStarless: true,
  }
  console.log('--- KOKKUVÕTE ---')
  console.log(JSON.stringify(summary, null, 2))
  return summary
}

export async function generateGmbReviewReplies(
  options: GenerateGmbRepliesOptions = {},
): Promise<GenerateGmbRepliesSummary> {
  if (options.backfillStarless) {
    return backfillStarlessSkipReplies(options)
  }

  const dryRun = Boolean(options.dryRun)
  const hour = tallinnHour()

  const pages = await fetchCandidatePages()
  const limit = options.limit ?? defaultLimit()
  const targets = pages.slice(0, limit)

  console.log(
    JSON.stringify({
      tallinnHour: hour,
      since: autoReplySinceDate(),
      found: pages.length,
      processing: targets.length,
      limit,
      dryRun,
    }),
  )

  let drafted = 0
  let starlessDrafted = 0
  let skipped = 0
  let errors = 0
  let rateLimited = false
  let stoppedEarly = false

  for (const page of targets) {
    const props = page.properties
    const name = titlePlain(props['Nimi']) || 'Anonüümne'
    const reviewId = richTextPlain(props['Google review ID']).trim()

    if (!isSafeCandidate(props)) {
      console.log(`SKIP unsafe page=${page.id} reviewId=${reviewId}`)
      skipped++
      continue
    }

    const rating = notionRating(props)
    const reviewText = extractOriginalGmbComment(richTextPlain(props['Arvustuse tekst']))
    const reviewDate = props['Arvustuse kuupäev']?.date?.start || null
    const hasText = hasReviewTextForReply(richTextPlain(props['Arvustuse tekst']))

    if (!hasText) {
      try {
        if (rating === 4 || rating === 5) {
          const reply = await writeStarlessDraft({
            pageId: page.id,
            reviewId,
            rating,
            dryRun,
          })
          drafted++
          starlessDrafted++
          console.log(
            `${dryRun ? 'DRY' : 'DRAFT'} starless name=${name} page=${page.id} hinne=${rating} reply=${reply}`,
          )
        } else if (rating != null && rating <= 3) {
          skipped++
          console.log(`SKIP starless-low-rating page=${page.id} reviewId=${reviewId} hinne=${rating}`)
          if (!dryRun) {
            await patchNotion(page.id, {
              Staatus: { select: { name: GMB_STATUS.skip } },
            })
          }
        } else {
          skipped++
          console.log(`SKIP starless-no-rating page=${page.id} reviewId=${reviewId}`)
        }
      } catch (error) {
        errors++
        const message = error instanceof Error ? error.message : String(error)
        console.error(`ERROR starless page=${page.id} reviewId=${reviewId}: ${message}`)
      }
      await sleep(STARLESS_GAP_MS)
      continue
    }

    try {
      if (dryRun) {
        console.log(`DRY page=${page.id} reviewId=${reviewId} hinne=${rating}`)
        drafted++
        await sleep(STARLESS_GAP_MS)
        continue
      }

      const ai = await generateGmbReviewReplyDraft({
        reviewerName: name,
        rating,
        reviewText,
        reviewDate,
      })

      if (ai.decision === 'skip') {
        skipped++
        console.log(`SKIP page=${page.id} reviewId=${reviewId}: ${ai.reason}`)
        if (/mixes Estonian/i.test(ai.reason)) {
          await sleep(DEFAULT_AI_GAP_MS)
          continue
        }
        const technical = /tehniline|timeout|valideer|ebaselge|json|gateway|parse/i.test(ai.reason)
        await patchNotion(page.id, {
          Staatus: { select: { name: technical ? GMB_STATUS.error : GMB_STATUS.skip } },
        })
        await sleep(DEFAULT_AI_GAP_MS)
        continue
      }

      const properties: Record<string, any> = {
        Vastus: { rich_text: toNotionRichText(ai.reply || '') },
        Staatus: { select: { name: GMB_STATUS.draft } },
        Kinnitatud: { checkbox: false },
        'Vastus postitatud?': { checkbox: false },
      }
      if (ai.replyType) {
        properties['Automaatse vastuse tüüp'] = { select: { name: ai.replyType } }
      }
      await patchNotion(page.id, properties)
      drafted++
      console.log(`DRAFT page=${page.id} reviewId=${reviewId} type=${ai.replyType}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (isGmbReplyAiRateLimitError(error)) {
        console.warn(`RATE LIMIT page=${page.id} reviewId=${reviewId}: ${message}`)
        rateLimited = true
        stoppedEarly = true
        break
      }
      errors++
      console.error(`ERROR page=${page.id} reviewId=${reviewId}: ${message}`)
      if (!dryRun) {
        try {
          await patchNotion(page.id, {
            Staatus: { select: { name: GMB_STATUS.error } },
          })
        } catch (patchError) {
          console.error(`Failed to mark Viga for page=${page.id}:`, patchError)
        }
      }
    }

    await sleep(DEFAULT_AI_GAP_MS)
  }

  const summary: GenerateGmbRepliesSummary = {
    tallinnHour: hour,
    found: pages.length,
    drafted,
    starlessDrafted,
    skipped,
    errors,
    rateLimited,
    stoppedEarly,
    dryRun,
  }
  console.log('--- KOKKUVÕTE ---')
  console.log(JSON.stringify(summary, null, 2))
  return summary
}

if (require.main === module) {
  generateGmbReviewReplies(parseArgs(process.argv.slice(2)))
    .then((summary) => {
      if (summary.errors > 0) process.exit(1)
    })
    .catch((error) => {
      console.error('Generate GMB review replies failed:', error)
      process.exit(1)
    })
}
