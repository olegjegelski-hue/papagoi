import 'dotenv/config'

import {
  extractOriginalGmbComment,
  gmbCommentLooksTranslated,
  toNotionRichText,
} from '@/lib/gmb-review-comment'
import { fetchAllNotionReviewPages } from '@/scripts/sync-google-reviews-to-notion'

function existingPlainText(prop: any): string {
  if (!prop) return ''
  if (Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t: { plain_text?: string }) => t?.plain_text || '').join('')
  }
  return ''
}

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function pageTitle(properties: Record<string, any>): string {
  const title = properties['Nimi']?.title
  if (!Array.isArray(title)) return ''
  return title.map((t: { plain_text?: string }) => t?.plain_text || '').join('').trim()
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run')
  const limitRaw = argv.find((a) => a.startsWith('--limit='))
  const limit = limitRaw ? Number.parseInt(limitRaw.slice('--limit='.length), 10) : null
  return {
    dryRun,
    limit: limit != null && Number.isFinite(limit) && limit > 0 ? limit : null,
  }
}

/** Esmase kontrolli 3 rida: ET tõlge-enne, RU originaal-enne, emoji. */
const SAMPLE_NAMES = ['Geito Oolo', 'Nataļja B', 'Jana S']

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
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
    console.warn(`  retry ${attempt}/${maxAttempts - 1} after ${waitMs}ms (${lastError.slice(0, 120)})`)
    await sleep(waitMs)
  }

  throw new Error(`Notion PATCH failed ${lastError}`)
}

async function main() {
  const { dryRun, limit } = parseArgs(process.argv.slice(2))
  const apiKey = assertEnv('NOTION_API_KEY')
  const databaseId = assertEnv('NOTION_REVIEWS_DATABASE_ID').replace(/-/g, '')

  const pages = await fetchAllNotionReviewPages(databaseId, apiKey)
  const dual = pages
    .map((page) => {
      const before = existingPlainText(page.properties['Arvustuse tekst'])
      const after = extractOriginalGmbComment(before)
      return {
        id: page.id,
        name: pageTitle(page.properties) || '(pealkirjata)',
        before,
        after,
        needsUpdate: Boolean(after && gmbCommentLooksTranslated(before) && after !== before.trim()),
      }
    })
    .filter((row) => row.needsUpdate)

  dual.sort((a, b) => a.name.localeCompare(b.name, 'et'))

  let targets = dual
  if (limit != null) {
    const preferred = SAMPLE_NAMES.map((name) => dual.find((row) => row.name === name)).filter(
      (row): row is (typeof dual)[number] => Boolean(row),
    )
    const rest = dual.filter((row) => !SAMPLE_NAMES.includes(row.name))
    targets = [...preferred, ...rest].slice(0, limit)
  }

  const verbose = dryRun || targets.length <= 5

  console.log(
    JSON.stringify(
      {
        totalPages: pages.length,
        dualNeedingUpdate: dual.length,
        selected: targets.length,
        dryRun,
        limit,
        note: 'PATCH only: Arvustuse tekst',
      },
      null,
      2,
    ),
  )

  if (dryRun && limit == null) {
    console.log(`Kuiv-jooks: näitan 5/${dual.length} näidet. Ülejäänud jäetakse.`)
    targets = targets.slice(0, 5)
  }

  let patched = 0
  const failures: { name: string; id: string; error: string }[] = []

  for (let i = 0; i < targets.length; i++) {
    const row = targets[i]
    const n = `${i + 1}/${targets.length}`
    if (verbose) {
      console.log('---')
      console.log(`Nimi: ${row.name}`)
      console.log(`Page: ${row.id}`)
      console.log(`Enne (${row.before.length} märki):\n${row.before}`)
      console.log(`Pärast (${row.after!.length} märki):\n${row.after}`)
    }
    if (dryRun) {
      console.log(`[${n}] DRY ${row.name}`)
      continue
    }
    try {
      await patchArvustuseTekst(apiKey, row.id, row.after!)
      patched++
      console.log(`[${n}] OK  ${row.name}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push({ name: row.name, id: row.id, error: message })
      console.error(`[${n}] FAIL ${row.name}  ${row.id}  ${message}`)
    }
    await sleep(350)
  }

  let remainingDual: number | null = null
  if (!dryRun) {
    const afterPages = await fetchAllNotionReviewPages(databaseId, apiKey)
    remainingDual = afterPages.filter((page) =>
      gmbCommentLooksTranslated(existingPlainText(page.properties['Arvustuse tekst'])),
    ).length
  }

  const summary = {
    planned: targets.length,
    patched: dryRun ? 0 : patched,
    failed: failures.length,
    remainingDualInNotion: remainingDual,
    failures,
  }
  console.log('--- KOKKUVÕTE ---')
  console.log(JSON.stringify(summary, null, 2))

  if (failures.length > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Skript katkes enne lõppu:', error)
  process.exit(1)
})
