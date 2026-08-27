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

async function patchArvustuseTekst(apiKey: string, pageId: string, original: string) {
  const id = pageId.replace(/-/g, '')
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
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Notion PATCH failed ${response.status}: ${text}`)
  }
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

  const preview = limit != null || !dryRun ? targets : targets.slice(0, 5)
  if (dryRun && limit == null) {
    console.log(`Kuiv-jooks: näitan 5/${dual.length} näidet. Ülejäänud jäetakse.`)
  }

  for (const row of preview) {
    console.log('---')
    console.log(`Nimi: ${row.name}`)
    console.log(`Page: ${row.id}`)
    console.log(`Enne (${row.before.length} märki):\n${row.before}`)
    console.log(`Pärast (${row.after!.length} märki):\n${row.after}`)
    if (dryRun) continue
    await patchArvustuseTekst(apiKey, row.id, row.after!)
    console.log('Patched.')
    await new Promise((r) => setTimeout(r, 350))
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
