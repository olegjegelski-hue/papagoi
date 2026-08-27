import 'dotenv/config'

/**
 * AI mustandid ainult uutele ridadele (Staatus=Uus, tühi Vastus, alates GMB_AUTO_REPLY_SINCE).
 * Vanade postitamata vastuste rewrite: scripts/rewrite-gmb-review-replies.ts (käsitsi, mitte cron).
 */

import { generateGmbReviewReplyDraft } from '@/lib/ai/gmb-review-reply-client'
import { extractOriginalGmbComment, toNotionRichText } from '@/lib/gmb-review-comment'
import { isGmbReplyGenerateWindow, tallinnHour } from '@/lib/gmb-review-generate-window'
import { GMB_STATUS } from '@/lib/gmb-review-workflow'
import { autoReplySinceDate } from '@/lib/google-review-replies'

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
  /** Jäta vahele Tallinna kella 20:00 aken (käsitsi / test). */
  force?: boolean
  limit?: number
}

export type GenerateGmbRepliesSummary = {
  skippedWindow?: boolean
  tallinnHour: string
  found: number
  drafted: number
  skipped: number
  errors: number
  dryRun: boolean
}

function parseArgs(argv: string[]): GenerateGmbRepliesOptions {
  const dryRun = argv.includes('--dry-run')
  const force = argv.includes('--force')
  const limitRaw = argv.find((a) => a.startsWith('--limit='))
  const limit = limitRaw ? Number.parseInt(limitRaw.slice('--limit='.length), 10) : undefined
  return {
    dryRun,
    force,
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchCandidatePages(): Promise<NotionPage[]> {
  const apiKey = assertEnv('NOTION_API_KEY')
  const databaseId = assertEnv('NOTION_REVIEWS_DATABASE_ID').replace(/-/g, '')
  const results: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, any> = {
      page_size: 100,
      filter: {
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
      },
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

function isSafeToGenerate(props: Record<string, any>): boolean {
  const status = props['Staatus']?.select?.name
  if (status !== GMB_STATUS.uus) return false
  if (richTextPlain(props['Vastus']).trim()) return false
  if (props['Kinnitatud']?.checkbox === true) return false
  if (props['Vastus postitatud?']?.checkbox === true) return false
  if (!richTextPlain(props['Google review ID']).trim()) return false
  return true
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

export async function generateGmbReviewReplies(
  options: GenerateGmbRepliesOptions = {},
): Promise<GenerateGmbRepliesSummary> {
  const dryRun = Boolean(options.dryRun)
  const force = Boolean(options.force)
  const hour = tallinnHour()

  if (!force && !isGmbReplyGenerateWindow()) {
    const summary: GenerateGmbRepliesSummary = {
      skippedWindow: true,
      tallinnHour: hour,
      found: 0,
      drafted: 0,
      skipped: 0,
      errors: 0,
      dryRun,
    }
    console.log(
      JSON.stringify({
        ...summary,
        note: 'Not 20:00 Europe/Tallinn — no-op (Vercel UTC 17:00/18:00). Use --force to run anyway.',
      }),
    )
    return summary
  }

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
  let skipped = 0
  let errors = 0

  for (const page of targets) {
    const props = page.properties
    const name = titlePlain(props['Nimi']) || 'Anonüümne'
    const reviewId = richTextPlain(props['Google review ID']).trim()

    if (!isSafeToGenerate(props)) {
      console.log(`SKIP unsafe page=${page.id} reviewId=${reviewId}`)
      skipped++
      continue
    }

    const rating = typeof props['Hinne']?.number === 'number' ? props['Hinne'].number : null
    const reviewText = extractOriginalGmbComment(richTextPlain(props['Arvustuse tekst']))
    const reviewDate = props['Arvustuse kuupäev']?.date?.start || null

    try {
      if (dryRun) {
        console.log(`DRY page=${page.id} reviewId=${reviewId} hinne=${rating}`)
        drafted++
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
        const technical = /tehniline|timeout|valideer|ebaselge|json|gateway|parse/i.test(ai.reason)
        await patchNotion(page.id, {
          Staatus: { select: { name: technical ? GMB_STATUS.error : GMB_STATUS.skip } },
        })
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
      errors++
      const message = error instanceof Error ? error.message : String(error)
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

    await sleep(250)
  }

  const summary: GenerateGmbRepliesSummary = {
    tallinnHour: hour,
    found: pages.length,
    drafted,
    skipped,
    errors,
    dryRun,
  }
  console.log('--- KOKKUVÕTE ---')
  console.log(JSON.stringify(summary, null, 2))
  return summary
}

if (require.main === module) {
  generateGmbReviewReplies(parseArgs(process.argv.slice(2))).catch((error) => {
    console.error('Generate GMB review replies failed:', error)
    process.exit(1)
  })
}
