import 'dotenv/config'

import {
  findExistingByGoogleReviewId,
  googleReviewIdFromGmbReview,
  googleReviewIdFromNotionProperty,
  gmbReviewResourceUrl,
  gmbReviewsListUrl,
  richTextPlainFromProp,
} from '@/lib/gmb-review-id'
import { GMB_STATUS } from '@/lib/gmb-review-workflow'
import { getGmbAccessToken, logGmbAuthCompareProbe } from '@/lib/gmb-access-token'
import {
  googleApiFetch,
  isGmbUnauthorizedStatus,
  logGmbTokenInvalid,
  type FetchLike,
} from '@/lib/google-api-fetch'
import {
  applyReviewSyncPatchLimit,
  GMB_REVIEW_SYNC_PATCH_DIFF_LOG_LIMIT,
  GMB_REVIEW_SYNC_PATCH_LIMIT,
  notionReviewSyncFieldDiffs,
  planReviewSyncActions,
  type GoogleReviewForSync,
} from '@/lib/gmb-review-sync'
import {
  googleReviewIdEqualsFilter,
  queryNotionReviewPages,
  resolveReviewDataSourceIds,
} from '@/lib/notion-reviews-query'

export { getGmbAccessToken }

// Sisemine ühtlustatud arvustuse kuju
type GoogleReview = GoogleReviewForSync

// Google Places API arvustuse kuju
type PlacesReview = {
  author_name?: string
  rating?: number
  text?: string
  time?: number // unix seconds
  relative_time_description?: string
  language?: string
  profile_photo_url?: string
}

type PlacesDetailsResponse = {
  result?: {
    reviews?: PlacesReview[]
    rating?: number
    user_ratings_total?: number
    url?: string
  } | null
  status?: string
  error_message?: string
}

type NotionPage = {
  id: string
  properties: Record<string, any>
}

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

export type GmbReviewApiRecord = GoogleReview & {
  originalComment?: string | null
  originalText?: string | null
}

type SyncLogger = Pick<Console, 'log' | 'warn' | 'error'>

export type FetchAllGoogleReviewsFromGMBOptions = {
  fetchImpl?: FetchLike
  accessToken?: string
  accountId?: string
  locationId?: string
  log?: SyncLogger
  skipAuthProbe?: boolean
}

export async function fetchGmbReviewById(
  reviewId: string,
  accessToken?: string,
  fetchImpl: FetchLike = fetch,
): Promise<GmbReviewApiRecord | null> {
  const accountId = assertEnv('GOOGLE_MY_BUSINESS_ACCOUNT_ID')
  const locationId = assertEnv('GOOGLE_MY_BUSINESS_LOCATION_ID')
  const token = accessToken || (await getGmbAccessToken({ fetchImpl }))
  const url = gmbReviewResourceUrl(accountId, locationId, reviewId)
  const response = await googleApiFetch(
    url,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
    fetchImpl,
  )
  if (response.status === 404) return null
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GMB GET review ${reviewId} failed ${response.status}: ${text}`)
  }
  return (await response.json()) as GmbReviewApiRecord
}

export async function fetchAllGoogleReviewsFromGMB(
  opts: FetchAllGoogleReviewsFromGMBOptions = {},
): Promise<GoogleReview[]> {
  const log = opts.log ?? console
  const fetchImpl = opts.fetchImpl ?? fetch
  const accountId = opts.accountId ?? assertEnv('GOOGLE_MY_BUSINESS_ACCOUNT_ID')
  const locationId = opts.locationId ?? assertEnv('GOOGLE_MY_BUSINESS_LOCATION_ID')
  const accessToken = opts.accessToken || (await getGmbAccessToken({ fetchImpl, log }))
  if (!opts.skipAuthProbe) {
    await logGmbAuthCompareProbe({
      accessToken,
      accountId,
      locationId,
      fetchImpl,
      log,
    })
  }

  const pageSize = 50
  const all: GoogleReview[] = []
  let pageToken: string | undefined
  let page = 0
  const startedAtMs = Date.now()

  do {
    page += 1
    const url = gmbReviewsListUrl(accountId, locationId, {
      pageSize,
      orderBy: 'updateTime desc',
      pageToken,
    })

    const response = await googleApiFetch(
      url,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      fetchImpl,
    )

    log.log(
      JSON.stringify({
        note: 'GMB reviews list page',
        page,
        httpStatus: response.status,
      }),
    )

    if (isGmbUnauthorizedStatus(response.status)) {
      logGmbTokenInvalid(log)
      const text = await response.text()
      throw new Error(`Failed to fetch Google reviews from GMB API: ${response.status} - ${text}`)
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to fetch Google reviews from GMB API: ${response.status} - ${text}`)
    }

    const data = (await response.json()) as {
      reviews?: GoogleReview[]
      nextPageToken?: string | null
    }

    if (Array.isArray(data.reviews)) {
      all.push(...data.reviews)
    }

    pageToken = data.nextPageToken || undefined
  } while (pageToken)

  log.log(
    JSON.stringify({
      note: 'GMB reviews list done',
      pages: page,
      reviews: all.length,
      elapsedMs: Date.now() - startedAtMs,
    }),
  )

  return all
}

async function fetchAllGoogleReviewsViaPlaces(): Promise<GoogleReview[]> {
  const apiKey = assertEnv('GOOGLE_PLACES_API_KEY')
  const placeId = assertEnv('GOOGLE_PLACES_PLACE_ID')

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  // NB: Places API tagastab ainult piiratud arvu arvustusi (Google’i arvates kõige olulisemad).
  url.searchParams.set('fields', 'reviews,rating,user_ratings_total,url')
  url.searchParams.set('key', apiKey)

  const response = await googleApiFetch(url.toString())
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch Google Places details: ${response.status} - ${text}`)
  }

  const data = (await response.json()) as PlacesDetailsResponse

  if (data.status && data.status !== 'OK') {
    throw new Error(
      `Google Places API error: ${data.status}${
        data.error_message ? ` - ${data.error_message}` : ''
      }`,
    )
  }

  const reviews = data.result?.reviews ?? []

  const mapped: GoogleReview[] = reviews.map((r, index) => {
    const createdAtIso =
      typeof r.time === 'number' ? new Date(r.time * 1000).toISOString() : null

    return {
      // Places API ei anna eraldi reviewId-d; kasutame deterministlikku kombinatsiooni
      reviewId: r.time ? String(r.time) : `places-review-${index}`,
      name: null,
      reviewer: { displayName: r.author_name ?? null },
      starRating: r.rating != null ? String(r.rating) : null,
      comment: r.text ?? null,
      createTime: createdAtIso,
      updateTime: createdAtIso,
      reviewReply: null,
    }
  })

  return mapped
}

export async function fetchAllNotionReviewPages(
  databaseId: string,
  apiKey: string,
  dataSourceIds?: string[],
): Promise<NotionPage[]> {
  const result = await queryNotionReviewPages({ apiKey, databaseId, dataSourceIds })
  console.log(
    JSON.stringify({
      note: 'fetchAllNotionReviewPages',
      queryPath: result.queryPath,
      dataSourceIds: result.dataSourceIds,
      existingPages: result.pages.length,
    }),
  )
  return result.pages
}

function notionPageRank(page: NotionPage): number {
  const status = page.properties['Staatus']?.select?.name
  const posted = page.properties['Vastus postitatud?']?.checkbox === true
  const confirmed = page.properties['Kinnitatud']?.checkbox === true
  const hasReply = Boolean(richTextPlainFromProp(page.properties['Vastus']).trim())
  if (posted || status === GMB_STATUS.posted) return 50
  if (confirmed && status === GMB_STATUS.ready) return 40
  if (hasReply) return 30
  if (status === GMB_STATUS.draft) return 20
  if (status === GMB_STATUS.skip) return 10
  return 0
}

function preferNotionReviewPage(a: NotionPage, b: NotionPage): NotionPage {
  const ra = notionPageRank(a)
  const rb = notionPageRank(b)
  return rb > ra ? b : a
}

function rememberExistingPage(byId: Map<string, NotionPage>, page: NotionPage) {
  const id = googleReviewIdFromNotionProperty(page.properties['Google review ID'])
  if (!id) return
  const prev = byId.get(id)
  byId.set(id, prev ? preferNotionReviewPage(prev, page) : page)
}

async function findNotionPageByGoogleReviewId(
  apiKey: string,
  databaseId: string,
  reviewId: string,
  dataSourceIds?: string[],
): Promise<NotionPage | null> {
  try {
    const result = await queryNotionReviewPages({
      apiKey,
      databaseId,
      dataSourceIds,
      pageSize: 5,
      filter: googleReviewIdEqualsFilter(reviewId),
    })
    if (result.pages.length === 0) return null
    return result.pages.reduce(preferNotionReviewPage)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Failed to query Notion by review ID ${reviewId}: ${message}`)
    return null
  }
}

export type UpsertReviewsIntoNotionOptions = {
  fetchImpl?: typeof fetch
  existingPages?: NotionPage[]
  apiKey?: string
  databaseId?: string
  reviewUrl?: string
  dataSourceIds?: string[]
  skipLiveLookup?: boolean
  nowIso?: string
  patchLimit?: number
}

function notionWriteHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }
}

export async function upsertReviewsIntoNotion(
  reviews: GoogleReview[],
  options: UpsertReviewsIntoNotionOptions = {},
) {
  const fetchImpl = options.fetchImpl ?? fetch
  const NOTION_API_KEY = options.apiKey ?? assertEnv('NOTION_API_KEY')
  const rawDbId = options.databaseId ?? assertEnv('NOTION_REVIEWS_DATABASE_ID')
  const databaseId = rawDbId.replace(/-/g, '')
  const reviewUrl =
    options.reviewUrl ?? process.env.REVIEW_GOOGLE_URL ?? 'https://g.page/r/CXfsGh_UtN6-EBM/review'

  let dataSourceIds = options.dataSourceIds
  let existingPages = options.existingPages

  if (!existingPages) {
    console.log(`Loading existing Notion reviews from database ${databaseId}...`)
    const resolved = await resolveReviewDataSourceIds({ apiKey: NOTION_API_KEY, databaseId })
    dataSourceIds = resolved.ids
    console.log(
      JSON.stringify({
        note: 'Notion reviews data sources',
        dataSourceIds: resolved.ids,
        dataSourceSource: resolved.source,
      }),
    )
    existingPages = await fetchAllNotionReviewPages(databaseId, NOTION_API_KEY, resolved.ids)
  }

  const existingByReviewId = new Map<string, NotionPage>()
  for (const page of existingPages) {
    rememberExistingPage(existingByReviewId, page)
  }

  console.log(
    JSON.stringify({
      existingPages: existingPages.length,
      mappedByReviewId: existingByReviewId.size,
    }),
  )

  let liveLookupHits = 0
  if (!options.skipLiveLookup) {
    for (const review of reviews) {
      const reviewId = googleReviewIdFromGmbReview(review)
      if (!reviewId) continue
      if (findExistingByGoogleReviewId(existingByReviewId, reviewId)) continue
      const live = await findNotionPageByGoogleReviewId(
        NOTION_API_KEY,
        databaseId,
        reviewId,
        dataSourceIds,
      )
      if (live) {
        liveLookupHits++
        rememberExistingPage(existingByReviewId, live)
      }
    }
  }

  const plan = planReviewSyncActions(reviews, existingByReviewId, reviewUrl, options.nowIso)
  console.log(
    JSON.stringify({
      note: 'reviewSyncPlan',
      creates: plan.creates.length,
      patches: plan.patches.length,
      skippedUnchanged: plan.skippedUnchanged,
      skippedNoId: plan.skippedNoId,
    }),
  )

  const { patches: patchesToApply, deferredPatches } = applyReviewSyncPatchLimit(
    plan.patches,
    options.patchLimit ?? GMB_REVIEW_SYNC_PATCH_LIMIT,
  )

  for (const item of patchesToApply.slice(0, GMB_REVIEW_SYNC_PATCH_DIFF_LOG_LIMIT)) {
    const diffs = notionReviewSyncFieldDiffs(item.existing?.properties, item.properties)
    console.log(
      JSON.stringify({
        note: 'patchFieldDiff',
        fields: diffs.map((diff) => `${diff.name}: ${diff.type}`),
      }),
    )
  }

  if (deferredPatches > 0) {
    console.log(`${deferredPatches} patchi jäi järgmisele korrale`)
  }

  let created = 0
  let updated = 0

  for (const item of plan.creates) {
    const response = await fetchImpl('https://api.notion.com/v1/pages', {
      method: 'POST',
      cache: 'no-store',
      headers: notionWriteHeaders(NOTION_API_KEY),
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: item.properties,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(
        `Failed to create Notion review page for reviewId=${item.reviewId}: ${response.status} - ${text}`,
      )
      continue
    }
    const createdPage = (await response.json()) as {
      id?: string
      properties?: Record<string, unknown>
    }
    rememberExistingPage(existingByReviewId, {
      id: createdPage.id || `created-${item.reviewId}`,
      properties: createdPage.properties || item.properties,
    })
    created++
  }

  for (const item of patchesToApply) {
    const existing = item.existing
    if (!existing) continue
    const pageId = existing.id.replace(/-/g, '')
    const response = await fetchImpl(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      cache: 'no-store',
      headers: notionWriteHeaders(NOTION_API_KEY),
      body: JSON.stringify({
        properties: item.properties,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(
        `Failed to update Notion review page for reviewId=${item.reviewId}: ${response.status} - ${text}`,
      )
      continue
    }
    rememberExistingPage(existingByReviewId, {
      id: existing.id,
      properties: { ...existing.properties, ...item.properties },
    })
    updated++
  }

  console.log(
    `Sync complete. Created: ${created}, Updated: ${updated}, Unchanged skipped: ${plan.skippedUnchanged}, Skipped no ID: ${plan.skippedNoId}, Live ID hits: ${liveLookupHits}, Total from Google: ${reviews.length}, Deferred patches: ${deferredPatches}`,
  )

  return {
    created,
    updated,
    skippedUnchanged: plan.skippedUnchanged,
    skippedNoId: plan.skippedNoId,
    liveLookupHits,
    totalFromGoogle: reviews.length,
    deferredPatches,
  }
}

export async function syncGoogleReviewsToNotion() {
  console.log('Starting sync of Google reviews to Notion (GMB API)...')
  const reviews = await fetchAllGoogleReviewsFromGMB()
  console.log(`Fetched ${reviews.length} reviews from Google My Business API`)
  await upsertReviewsIntoNotion(reviews)
}

if (require.main === module) {
  // CLI usage: tsx scripts/sync-google-reviews-to-notion.ts
  syncGoogleReviewsToNotion().catch((error) => {
    console.error('Sync failed:', error)
    process.exit(1)
  })
}

