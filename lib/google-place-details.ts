export type PlaceReview = {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url: string
  time: number
  /** IETF kood tagastatud teksti keelele (originaal, kui tõlge on välja lülitatud). */
  language?: string
  /** IETF kood arvustuse kirjutamise keelele. */
  original_language?: string
  translated?: boolean
}

export type PlaceDetailsOk = {
  rating: number
  user_ratings_total: number
  reviews: PlaceReview[]
}

type PlaceDetailsResponse = {
  status?: string
  error_message?: string
  result?: {
    rating?: number
    user_ratings_total?: number
    reviews?: Array<{
      author_name?: string
      rating?: number
      text?: string
      relative_time_description?: string
      profile_photo_url?: string
      time?: number
      language?: string
      original_language?: string
      translated?: boolean
    }>
  }
}

/** JSON-LD AggregateRating, või null kui andmeid ei tohi skeemi panna. */
export type SchemaAggregateRating = {
  '@type': 'AggregateRating'
  ratingValue: string
  ratingCount: string
}

/**
 * Ainult päris hinded. 0 / viga / puuduv arv → null
 * (schema ei tohi väita „5,0 · 0 arvustust").
 */
export function aggregateRatingFromPlace(
  rating: number | undefined,
  userRatingsTotal: number | undefined
): SchemaAggregateRating | null {
  if (typeof userRatingsTotal !== 'number' || !Number.isFinite(userRatingsTotal) || userRatingsTotal < 1) {
    return null
  }
  if (typeof rating !== 'number' || !Number.isFinite(rating) || rating <= 0) {
    return null
  }
  return {
    '@type': 'AggregateRating',
    ratingValue: rating.toFixed(1),
    ratingCount: String(Math.round(userRatingsTotal)),
  }
}

export async function fetchGooglePlaceDetails(): Promise<
  | { ok: true; data: PlaceDetailsOk }
  | { ok: false; status?: string; error_message?: string | null }
> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACES_PLACE_ID
  if (!apiKey || !placeId) {
    return { ok: false, error_message: 'Google Places is not configured' }
  }

  try {
    // Vana Place Details: vaikimisi tõlgib Google teksti päringu keelde.
    // reviews_no_translations hoiab originaali; newest ei eelista ingliskeelseid.
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    detailsUrl.searchParams.set('place_id', placeId)
    detailsUrl.searchParams.set('fields', 'rating,user_ratings_total,reviews')
    detailsUrl.searchParams.set('reviews_no_translations', 'true')
    detailsUrl.searchParams.set('reviews_sort', 'newest')
    detailsUrl.searchParams.set('key', apiKey)

    const detailsResponse = await fetch(detailsUrl.toString(), {
      next: { revalidate: 3600 },
    })
    const detailsData = (await detailsResponse.json()) as PlaceDetailsResponse

    if (detailsData.status === 'OK' && detailsData.result) {
      const raw = detailsData.result
      const reviews: PlaceReview[] = Array.isArray(raw.reviews)
        ? raw.reviews.map((review) => ({
            author_name: review.author_name || '',
            rating: review.rating || 0,
            text: review.text || '',
            relative_time_description: review.relative_time_description || '',
            profile_photo_url: review.profile_photo_url || '',
            time: review.time || 0,
            ...(review.language ? { language: review.language } : {}),
            ...(review.original_language
              ? { original_language: review.original_language }
              : {}),
            ...(typeof review.translated === 'boolean'
              ? { translated: review.translated }
              : {}),
          }))
        : []

      return {
        ok: true,
        data: {
          rating: typeof raw.rating === 'number' ? raw.rating : 5.0,
          user_ratings_total:
            typeof raw.user_ratings_total === 'number' ? raw.user_ratings_total : 0,
          reviews,
        },
      }
    }

    return {
      ok: false,
      status: detailsData.status,
      error_message: detailsData.error_message || null,
    }
  } catch {
    return { ok: false, error_message: 'Failed to fetch reviews' }
  }
}
