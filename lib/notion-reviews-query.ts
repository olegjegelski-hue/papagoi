/**
 * Google arvustuste Notioni päringud.
 * Alates API 2025-09-03 elavad read data source'is, mitte databases/{id}/query vaikimisi teel.
 * 2022-06-28 databases/query võib tagastada pooliku hulga (produktsioonis 783 vs 799).
 */

import {
  googleReviewIdFromNotionProperty,
  richTextPlainFromProp,
} from '@/lib/gmb-review-id'
import { GMB_STATUS } from '@/lib/gmb-review-workflow'

export const NOTION_VERSION_LEGACY = '2022-06-28'
export const NOTION_VERSION_DATA_SOURCES = '2025-09-03'

/** Ridade tegelik data source (ülesande hüpotees + MCP fetch). */
export const NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK = 'a37b127d-017d-429e-9025-9d24875b7884'

export type NotionReviewPage = {
  id: string
  properties: Record<string, any>
}

export type NotionQueryPath = 'data_sources' | 'databases'

export type RecoveredVia = 'pending-filter' | 'without-status' | 'all-pages-js'

type FetchLike = typeof fetch

function normalizeNotionId(id: string): string {
  return id.replace(/-/g, '').toLowerCase()
}

function uniqueNotionIds(ids: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    const trimmed = String(id || '').trim()
    if (!trimmed) continue
    const key = normalizeNotionId(trimmed)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
  }
  return out
}

export function parseDataSourceIdsFromDatabaseResponse(body: unknown): string[] {
  if (!body || typeof body !== 'object') return []
  const sources = (body as { data_sources?: unknown }).data_sources
  if (!Array.isArray(sources)) return []
  return uniqueNotionIds(
    sources
      .map((item) => {
        if (!item || typeof item !== 'object') return ''
        const id = (item as { id?: unknown }).id
        return typeof id === 'string' ? id : ''
      })
      .filter(Boolean),
  )
}

export function pendingReplyFilter(readyStatus: string = GMB_STATUS.ready): Record<string, unknown> {
  return {
    and: [
      { property: 'Google review ID', rich_text: { is_not_empty: true } },
      { property: 'Vastus', rich_text: { is_not_empty: true } },
      { property: 'Vastus postitatud?', checkbox: { equals: false } },
      { property: 'Kinnitatud', checkbox: { equals: true } },
      { property: 'Staatus', select: { equals: readyStatus } },
    ],
  }
}

/** Sama päring ilma Staatus-filtrita — vahe ütleb, kas viga on staatuses või nähtavuses. */
export function confirmedUnpostedFilter(): Record<string, unknown> {
  return {
    and: [
      { property: 'Kinnitatud', checkbox: { equals: true } },
      { property: 'Vastus postitatud?', checkbox: { equals: false } },
    ],
  }
}

export function googleReviewIdEqualsFilter(reviewId: string): Record<string, unknown> {
  return {
    property: 'Google review ID',
    rich_text: { equals: reviewId },
  }
}

export function notionSelectName(prop: unknown): string | null {
  if (!prop || typeof prop !== 'object') return null
  const rec = prop as { select?: { name?: unknown }; status?: { name?: unknown } }
  if (typeof rec.select?.name === 'string' && rec.select.name) return rec.select.name
  if (typeof rec.status?.name === 'string' && rec.status.name) return rec.status.name
  return null
}

export function pageMatchesPendingReply(
  page: NotionReviewPage,
  readyStatus: string = GMB_STATUS.ready,
): boolean {
  const props = page.properties || {}
  const reviewId = googleReviewIdFromNotionProperty(props['Google review ID'])
  const reply = richTextPlainFromProp(props['Vastus']).trim()
  const posted = props['Vastus postitatud?']?.checkbox === true
  const confirmed = props['Kinnitatud']?.checkbox === true
  const status = notionSelectName(props['Staatus'])
  return Boolean(reviewId && reply && !posted && confirmed && status === readyStatus)
}

export function recoverPendingPages(input: {
  pending: NotionReviewPage[]
  withoutStatus: NotionReviewPage[]
  allPages: NotionReviewPage[]
  readyStatus?: string
}): { pages: NotionReviewPage[]; recoveredVia: RecoveredVia } {
  const readyStatus = input.readyStatus ?? GMB_STATUS.ready
  const candidates: Array<{ pages: NotionReviewPage[]; recoveredVia: RecoveredVia }> = [
    { pages: input.pending, recoveredVia: 'pending-filter' },
    {
      pages: input.withoutStatus.filter((page) => pageMatchesPendingReply(page, readyStatus)),
      recoveredVia: 'without-status',
    },
    {
      pages: input.allPages.filter((page) => pageMatchesPendingReply(page, readyStatus)),
      recoveredVia: 'all-pages-js',
    },
  ]
  return candidates.reduce((best, candidate) =>
    candidate.pages.length > best.pages.length ? candidate : best,
  )
}

/** Õige filtri rike ei tohi vaikselt varuteele langeda. */
export function recoveredViaNeedsWarning(recoveredVia: RecoveredVia): boolean {
  return recoveredVia !== 'pending-filter'
}

export function gmbDebugQueriesEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.GMB_DEBUG_QUERIES === '1'
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    return await response.text()
  } catch {
    return ''
  }
}

export async function resolveReviewDataSourceIds(input: {
  apiKey: string
  databaseId: string
  fetchImpl?: FetchLike
  extraIds?: string[]
}): Promise<{ ids: string[]; source: 'database' | 'env' | 'fallback' }> {
  const fetchImpl = input.fetchImpl ?? fetch
  const envId = process.env.NOTION_REVIEWS_DATA_SOURCE_ID?.trim()
  let discovered: string[] = []
  let source: 'database' | 'env' | 'fallback' = 'fallback'

  try {
    const response = await fetchImpl(`https://api.notion.com/v1/databases/${input.databaseId}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        'Notion-Version': NOTION_VERSION_DATA_SOURCES,
      },
    })
    if (response.ok) {
      const body = await response.json()
      discovered = parseDataSourceIdsFromDatabaseResponse(body)
      if (discovered.length) source = 'database'
    } else {
      const text = await readErrorBody(response)
      console.error(`GET Notion database for data sources failed: ${response.status} - ${text}`)
    }
  } catch (error) {
    console.error('GET Notion database for data sources failed', error)
  }

  const ids = uniqueNotionIds([
    ...discovered,
    ...(input.extraIds || []),
    envId || '',
    NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK,
  ])

  if (source !== 'database') {
    source = envId ? 'env' : 'fallback'
  }
  return { ids, source }
}

async function queryNotionCollection(input: {
  url: string
  apiKey: string
  version: string
  filter?: Record<string, unknown>
  pageSize?: number
  fetchImpl: FetchLike
}): Promise<NotionReviewPage[]> {
  const results: NotionReviewPage[] = []
  let startCursor: string | undefined
  const pageSize = input.pageSize ?? 100

  do {
    const body: Record<string, unknown> = { page_size: pageSize }
    if (input.filter) body.filter = input.filter
    if (startCursor) body.start_cursor = startCursor

    const response = await input.fetchImpl(input.url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        'Notion-Version': input.version,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await readErrorBody(response)
      throw new Error(`Failed to query Notion reviews: ${response.status} - ${text}`)
    }

    const data = (await response.json()) as {
      results?: Array<{ id?: string; properties?: Record<string, unknown> }>
      has_more?: boolean
      next_cursor?: string | null
    }
    for (const page of data.results || []) {
      if (!page?.id) continue
      results.push({ id: page.id, properties: page.properties || {} })
    }
    startCursor = data.has_more ? data.next_cursor || undefined : undefined
  } while (startCursor)

  return results
}

export async function queryNotionReviewPages(input: {
  apiKey: string
  databaseId: string
  filter?: Record<string, unknown>
  pageSize?: number
  dataSourceIds?: string[]
  fetchImpl?: FetchLike
}): Promise<{ pages: NotionReviewPage[]; queryPath: NotionQueryPath; dataSourceIds: string[] }> {
  const fetchImpl = input.fetchImpl ?? fetch
  const dataSourceIds =
    input.dataSourceIds && input.dataSourceIds.length > 0
      ? uniqueNotionIds(input.dataSourceIds)
      : (await resolveReviewDataSourceIds({ ...input, fetchImpl })).ids

  try {
    const pages: NotionReviewPage[] = []
    const seen = new Set<string>()
    for (const dataSourceId of dataSourceIds) {
      try {
        const batch = await queryNotionCollection({
          url: `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
          apiKey: input.apiKey,
          version: NOTION_VERSION_DATA_SOURCES,
          filter: input.filter,
          pageSize: input.pageSize,
          fetchImpl,
        })
        for (const page of batch) {
          const key = normalizeNotionId(page.id)
          if (seen.has(key)) continue
          seen.add(key)
          pages.push(page)
        }
      } catch (error) {
        console.error(`data_sources query failed for ${dataSourceId}`, error)
      }
    }
    if (pages.length > 0) {
      return { pages, queryPath: 'data_sources', dataSourceIds }
    }
    console.warn(
      input.filter
        ? 'data_sources filtered query returned 0 pages; trying databases/query'
        : 'data_sources query returned 0 pages without a filter; falling back to databases/query',
    )
  } catch (error) {
    console.error('data_sources query failed, falling back to databases/query', error)
  }

  const pages = await queryNotionCollection({
    url: `https://api.notion.com/v1/databases/${input.databaseId}/query`,
    apiKey: input.apiKey,
    version: NOTION_VERSION_LEGACY,
    filter: input.filter,
    pageSize: input.pageSize,
    fetchImpl,
  })
  return { pages, queryPath: 'databases', dataSourceIds }
}
