import 'dotenv/config'

import { generateReplyType } from '@/lib/google-review-replies'
import {
  extractOriginalGmbComment,
  toNotionRichText,
} from '@/lib/gmb-review-comment'
import {
  findExistingByGoogleReviewId,
  googleReviewIdFromGmbReview,
  googleReviewIdFromNotionProperty,
  richTextPlainFromProp,
} from '@/lib/gmb-review-id'
import { GMB_STATUS } from '@/lib/gmb-review-workflow'
import { getGmbAccessToken } from '@/lib/gmb-access-token'
import {
  googleReviewIdEqualsFilter,
  queryNotionReviewPages,
  resolveReviewDataSourceIds,
} from '@/lib/notion-reviews-query'

export { getGmbAccessToken }

// Sisemine ühtlustatud arvustuse kuju
type GoogleReview = {
  reviewId?: string | null
  name?: string | null
  reviewer?: { displayName?: string | null }
  starRating?: string | null
  comment?: string | null
  createTime?: string | null
  updateTime?: string | null
  reviewReply?: {
    comment?: string | null
    updateTime?: string | null
  } | null
}

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

const GOOGLE_MY_BUSINESS_BASE = 'https://mybusiness.googleapis.com/v4'

export type GmbReviewApiRecord = GoogleReview & {
  originalComment?: string | null
  originalText?: string | null
}

export async function fetchGmbReviewById(
  reviewId: string,
  accessToken?: string,
): Promise<GmbReviewApiRecord | null> {
  const accountId = assertEnv('GOOGLE_MY_BUSINESS_ACCOUNT_ID')
  const locationId = assertEnv('GOOGLE_MY_BUSINESS_LOCATION_ID')
  const token = accessToken || (await getGmbAccessToken())
  const id = reviewId.trim()
  const url = `${GOOGLE_MY_BUSINESS_BASE}/accounts/${accountId}/locations/${locationId}/reviews/${encodeURIComponent(id)}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (response.status === 404) return null
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GMB GET review ${id} failed ${response.status}: ${text}`)
  }
  return (await response.json()) as GmbReviewApiRecord
}

async function fetchAllGoogleReviewsFromGMB(): Promise<GoogleReview[]> {
  const accountId = assertEnv('GOOGLE_MY_BUSINESS_ACCOUNT_ID')
  const locationId = assertEnv('GOOGLE_MY_BUSINESS_LOCATION_ID')
  const accessToken = await getGmbAccessToken()

  const parent = `accounts/${accountId}/locations/${locationId}`
  const pageSize = 50
  const all: GoogleReview[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${GOOGLE_MY_BUSINESS_BASE}/${parent}/reviews`)
    url.searchParams.set('pageSize', String(pageSize))
    url.searchParams.set('orderBy', 'updateTime desc')
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

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

  return all
}

function starRatingToNumber(starRating: string | null | undefined): number | null {
  if (!starRating) return null
  switch (starRating.toUpperCase()) {
    case 'ONE':
      return 1
    case 'TWO':
      return 2
    case 'THREE':
      return 3
    case 'FOUR':
      return 4
    case 'FIVE':
      return 5
    default: {
      const asNumber = Number.parseInt(starRating, 10)
      return Number.isFinite(asNumber) ? asNumber : null
    }
  }
}

async function fetchAllGoogleReviewsViaPlaces(): Promise<GoogleReview[]> {
  const apiKey = assertEnv('GOOGLE_PLACES_API_KEY')
  const placeId = assertEnv('GOOGLE_PLACES_PLACE_ID')

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  // NB: Places API tagastab ainult piiratud arvu arvustusi (Google’i arvates kõige olulisemad).
  url.searchParams.set('fields', 'reviews,rating,user_ratings_total,url')
  url.searchParams.set('key', apiKey)

  const response = await fetch(url.toString())
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

function buildNotionPropertiesFromReview(
  review: GoogleReview,
  existingProperties: Record<string, any> | null,
  reviewUrl: string
) {
  const originalComment = extractOriginalGmbComment(review.comment)
  const rating = starRatingToNumber(review.starRating)
  const replyType = generateReplyType(rating)
  const name =
    (review.reviewer?.displayName && review.reviewer.displayName.trim()) || 'Anonüümne'
  const createDate = review.createTime || null
  const replyExists = Boolean(review.reviewReply && review.reviewReply.comment)

  const props: Record<string, any> = {}

  // Title: Nimi
  props['Nimi'] = {
    title: [
      {
        type: 'text',
        text: { content: name },
      },
    ],
  }

  // Hinne: number
  if (rating != null) {
    props['Hinne'] = { number: rating }
  }

  // Arvustuse tekst: ainult originaal (GMB võib saata tõlke + originaali koos).
  if (originalComment) {
    props['Arvustuse tekst'] = {
      rich_text: toNotionRichText(originalComment),
    }
  }

  // Arvustuse kuupäev
  if (createDate) {
    props['Arvustuse kuupäev'] = {
      date: { start: createDate },
    }
  }

  // Google review ID — salvesta normaliseeritud lühike ID (mitte resource name)
  const reviewId = googleReviewIdFromGmbReview(review)
  if (reviewId) {
    props['Google review ID'] = {
      rich_text: [
        {
          type: 'text',
          text: { content: reviewId },
        },
      ],
    }
  }

  // Google review URL
  if (reviewUrl) {
    props['Google review URL'] = {
      url: reviewUrl,
    }
  }

  // Staatus: Google'i vastus võidab lokaalse „Valmis postitamiseks“ ilma tekstita.
  const existingStatus = existingProperties?.['Staatus']?.select?.name as string | undefined
  const alreadyPosted = existingProperties?.['Vastus postitatud?']?.checkbox === true
  const status =
    replyExists || alreadyPosted
      ? GMB_STATUS.posted
      : existingStatus || GMB_STATUS.uus
  props['Staatus'] = {
    select: { name: status },
  }

  // Automaatse vastuse tüüp
  if (replyType) {
    props['Automaatse vastuse tüüp'] = {
      select: { name: replyType },
    }
  }

  // Vastus täidab /api/generate-gmb-review-replies. Sync ei kirjuta ega tühjenda seda.

  // Vastus postitatud? — ära võta maha, kui Notion juba ütleb et postitatud (GMB viivitus).
  props['Vastus postitatud?'] = {
    checkbox: alreadyPosted || replyExists,
  }

  // Vastuse postitamise kuupäev
  if (review.reviewReply?.updateTime) {
    props['Vastuse postitamise kuupäev'] = {
      date: { start: review.reviewReply.updateTime },
    }
  }

  // Viimati sünkroniseeritud
  props['Viimati sünkroniseeritud'] = {
    date: { start: new Date().toISOString() },
  }

  return props
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

async function upsertReviewsIntoNotion(reviews: GoogleReview[]) {
  const NOTION_API_KEY = assertEnv('NOTION_API_KEY')
  const rawDbId = assertEnv('NOTION_REVIEWS_DATABASE_ID')
  const databaseId = rawDbId.replace(/-/g, '')
  const reviewUrl = process.env.REVIEW_GOOGLE_URL || 'https://g.page/r/CXfsGh_UtN6-EBM/review'

  console.log(`Loading existing Notion reviews from database ${databaseId}...`)
  const resolved = await resolveReviewDataSourceIds({ apiKey: NOTION_API_KEY, databaseId })
  console.log(
    JSON.stringify({
      note: 'Notion reviews data sources',
      dataSourceIds: resolved.ids,
      dataSourceSource: resolved.source,
    }),
  )
  const existingPages = await fetchAllNotionReviewPages(databaseId, NOTION_API_KEY, resolved.ids)
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

  let created = 0
  let updated = 0
  let skippedNoId = 0
  let liveLookupHits = 0

  for (const review of reviews) {
    const reviewId = googleReviewIdFromGmbReview(review)
    if (!reviewId) {
      skippedNoId++
      continue
    }

    let existing = findExistingByGoogleReviewId(existingByReviewId, reviewId)

    if (!existing) {
      const live = await findNotionPageByGoogleReviewId(
        NOTION_API_KEY,
        databaseId,
        reviewId,
        resolved.ids,
      )
      if (live) {
        liveLookupHits++
        existing = live
        rememberExistingPage(existingByReviewId, live)
      }
    }

    const properties = buildNotionPropertiesFromReview(
      review,
      existing?.properties || null,
      reviewUrl,
    )

    if (!existing) {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error(
          `Failed to create Notion review page for reviewId=${reviewId}: ${response.status} - ${text}`,
        )
        continue
      }
      const createdPage = (await response.json()) as { id?: string; properties?: Record<string, unknown> }
      if (createdPage.id) {
        rememberExistingPage(existingByReviewId, {
          id: createdPage.id,
          properties: createdPage.properties || properties,
        })
      } else {
        rememberExistingPage(existingByReviewId, {
          id: `created-${reviewId}`,
          properties,
        })
      }
      created++
    } else {
      const pageId = existing.id.replace(/-/g, '')
      const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error(
          `Failed to update Notion review page for reviewId=${reviewId}: ${response.status} - ${text}`,
        )
        continue
      }
      rememberExistingPage(existingByReviewId, {
        id: existing.id,
        properties: { ...existing.properties, ...properties },
      })
      updated++
    }
  }

  console.log(
    `Sync complete. Created: ${created}, Updated: ${updated}, Skipped no ID: ${skippedNoId}, Live ID hits: ${liveLookupHits}, Total from Google: ${reviews.length}`,
  )
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

