import 'dotenv/config'

// Sisemine ühtlustatud arvustuse kuju
type GoogleReview = {
  reviewId: string
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

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_MY_BUSINESS_BASE = 'https://mybusiness.googleapis.com/v4'

async function getAccessTokenFromRefreshToken() {
  const clientId = assertEnv('GOOGLE_MY_BUSINESS_CLIENT_ID')
  const clientSecret = assertEnv('GOOGLE_MY_BUSINESS_CLIENT_SECRET')
  const refreshToken = assertEnv('GOOGLE_MY_BUSINESS_REFRESH_TOKEN')

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to get access token from Google: ${response.status} - ${text}`)
  }

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('No access_token in Google OAuth response')
  }
  return data.access_token
}

async function fetchAllGoogleReviewsFromGMB(): Promise<GoogleReview[]> {
  const accountId = assertEnv('GOOGLE_MY_BUSINESS_ACCOUNT_ID')
  const locationId = assertEnv('GOOGLE_MY_BUSINESS_LOCATION_ID')
  const accessToken = await getAccessTokenFromRefreshToken()

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

function generateReplyType(rating: number | null): string | null {
  if (rating == null) return null
  if (rating >= 5) return '5★ – tänu ja kutse tagasi'
  if (rating === 4) return '4★ – tänu ja küsi kuidas paremaks'
  if (rating <= 3) return '1–3★ – vabandus ja palu kirjutada'
  return null
}

function generateReplyDraft(name: string | null, rating: number | null): string | null {
  const displayName = name && name.trim() ? name.trim() : 'Papagoi sõber'
  if (rating == null) {
    return `Tere, ${displayName}!

Aitäh, et jagasite oma kogemust Papagoi Keskuses. Meil on väga oluline kuulda, kuidas külastus möödus – see aitab meil veel paremaks saada.

Kui soovite midagi täpsustada või pikemalt jagada, kirjutage meile julgelt aadressil keskus@papagoi.ee või helistage +372 51 27 938.

Sõbralikult
Papagoi Keskus`
  }

  if (rating >= 5) {
    return `Tere, ${displayName}!

Aitäh sooja tagasiside eest – meil on väga hea meel, et külastus Papagoi Keskuses meeldis.

Olete alati teretulnud tagasi, papagoid ootavad teid rõõmuga!

Sõbralikult
Papagoi Keskus`
  }

  if (rating === 4) {
    return `Tere, ${displayName}!

Aitäh, et võtsite aega ja jätsite meile hea arvustuse.

Kui on mõni mõte, mis aitaks kogemuse viie tärnini viia, oleksime väga tänulikud, kui kirjutaksite meile aadressil keskus@papagoi.ee.

Sõbralikult
Papagoi Keskus`
  }

  return `Tere, ${displayName}.

Vabandame siiralt, et külastus Papagoi Keskuses ei vastanud ootustele.

Tahaksime väga aru saada, mis juhtus ja kuidas saaksime paremini – palun kirjutage meile otse aadressil keskus@papagoi.ee või helistage +372 51 27 938.

Sõbralikult
Papagoi Keskus`
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

async function fetchAllNotionReviewPages(databaseId: string, apiKey: string): Promise<NotionPage[]> {
  const results: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, any> = {
      page_size: 100,
    }
    if (startCursor) {
      body.start_cursor = startCursor
    }

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
      throw new Error(`Failed to query Notion reviews database: ${response.status} - ${text}`)
    }

    const data = await response.json()
    const pageResults: any[] = data.results || []
    for (const page of pageResults) {
      results.push({ id: page.id, properties: page.properties || {} })
    }

    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  return results
}

function buildNotionPropertiesFromReview(
  review: GoogleReview,
  existingProperties: Record<string, any> | null,
  reviewUrl: string
) {
  const rating = starRatingToNumber(review.starRating)
  const replyType = generateReplyType(rating)
  const name =
    (review.reviewer?.displayName && review.reviewer.displayName.trim()) || 'Anonüümne'
  const draft = generateReplyDraft(review.reviewer?.displayName || null, rating)
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

  // Arvustuse tekst
  if (review.comment) {
    props['Arvustuse tekst'] = {
      rich_text: [
        {
          type: 'text',
          text: { content: review.comment },
        },
      ],
    }
  }

  // Arvustuse kuupäev
  if (createDate) {
    props['Arvustuse kuupäev'] = {
      date: { start: createDate },
    }
  }

  // Google review ID
  if (review.reviewId) {
    props['Google review ID'] = {
      rich_text: [
        {
          type: 'text',
          text: { content: review.reviewId },
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

  // Staatus
  const status =
    existingProperties?.['Staatus']?.select?.name ||
    (replyExists ? 'Vastus postitatud' : 'Uus')
  props['Staatus'] = {
    select: { name: status },
  }

  // Automaatse vastuse tüüp
  if (replyType) {
    props['Automaatse vastuse tüüp'] = {
      select: { name: replyType },
    }
  }

  // Vastuse mustand – ära kirjuta üle, kui juba olemas
  const existingDraft = existingProperties?.['Vastuse mustand']
  const draftText =
    existingDraft?.rich_text?.[0]?.plain_text && existingDraft.rich_text[0].plain_text.trim().length
      ? existingDraft.rich_text[0].plain_text
      : draft

  if (draftText) {
    props['Vastuse mustand'] = {
      rich_text: [
        {
          type: 'text',
          text: { content: draftText },
        },
      ],
    }
  }

  // Vastuse lõplik tekst – proovime, kui Google'is juba reply olemas
  if (review.reviewReply?.comment) {
    props['Vastuse lõplik tekst'] = {
      rich_text: [
        {
          type: 'text',
          text: { content: review.reviewReply.comment },
        },
      ],
    }
  }

  // Vastus postitatud?
  props['Vastus postitatud?'] = {
    checkbox: Boolean(review.reviewReply && review.reviewReply.comment),
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

async function upsertReviewsIntoNotion(reviews: GoogleReview[]) {
  const NOTION_API_KEY = assertEnv('NOTION_API_KEY')
  const rawDbId = assertEnv('NOTION_REVIEWS_DATABASE_ID')
  const databaseId = rawDbId.replace(/-/g, '')
  const reviewUrl = process.env.REVIEW_GOOGLE_URL || 'https://g.page/r/CXfsGh_UtN6-EBM/review'

  console.log(`Loading existing Notion reviews from database ${databaseId}...`)
  const existingPages = await fetchAllNotionReviewPages(databaseId, NOTION_API_KEY)
  const existingByReviewId = new Map<string, NotionPage>()

  for (const page of existingPages) {
    const prop = page.properties['Google review ID']
    let id: string | null = null
    if (prop?.type === 'rich_text') {
      id = prop.rich_text?.[0]?.plain_text || null
    } else if (prop?.type === 'title') {
      id = prop.title?.[0]?.plain_text || null
    }
    if (id) {
      existingByReviewId.set(id, page)
    }
  }

  console.log(
    `Existing Notion review pages: ${existingPages.length}, mapped by review ID: ${existingByReviewId.size}`
  )

  let created = 0
  let updated = 0

  for (const review of reviews) {
    if (!review.reviewId) continue
    const existing = existingByReviewId.get(review.reviewId)
    const properties = buildNotionPropertiesFromReview(
      review,
      existing?.properties || null,
      reviewUrl
    )

    if (!existing) {
      // Create new page
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
          `Failed to create Notion review page for reviewId=${review.reviewId}: ${response.status} - ${text}`
        )
        continue
      }
      created++
    } else {
      // Update existing page
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
          `Failed to update Notion review page for reviewId=${review.reviewId}: ${response.status} - ${text}`
        )
        continue
      }
      updated++
    }
  }

  console.log(`Sync complete. Created: ${created}, Updated: ${updated}, Total from Google: ${reviews.length}`)
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

