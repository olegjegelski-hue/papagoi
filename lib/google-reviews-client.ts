'use client'

export type GoogleReviewsPayload = {
  rating?: number
  user_ratings_total?: number
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
    relative_time_description?: string
    time?: number
    profile_photo_url?: string
    language?: string
    original_language?: string
    translated?: boolean
  }>
  error?: string
}

let inflight: Promise<GoogleReviewsPayload> | null = null

/** Üks võrgu-päring ka React Strict Mode'i topelt-mount'i korral. */
export function loadGoogleReviews(): Promise<GoogleReviewsPayload> {
  if (!inflight) {
    inflight = fetch('/api/google-reviews')
      .then((res) => res.json() as Promise<GoogleReviewsPayload>)
      .catch((error) => {
        inflight = null
        throw error
      })
  }
  return inflight
}
