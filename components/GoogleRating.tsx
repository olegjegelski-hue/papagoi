'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { loadGoogleReviews } from '@/lib/google-reviews-client'

interface GoogleRatingData {
  rating: number
  user_ratings_total: number
  error?: string
}

type GoogleRatingProps = {
  rating?: number
  userRatingsTotal?: number
  loading?: boolean
}

export default function GoogleRating({
  rating: ratingProp,
  userRatingsTotal: countProp,
  loading: loadingProp,
}: GoogleRatingProps = {}) {
  const t = useTranslations('GoogleRating')
  const fromParent = loadingProp !== undefined || ratingProp !== undefined
  const [fetched, setFetched] = useState<GoogleRatingData | null>(null)
  const [fetchLoading, setFetchLoading] = useState(!fromParent)

  useEffect(() => {
    if (fromParent) return

    async function fetchRating() {
      try {
        const data = await loadGoogleReviews()
        setFetched({
          rating: typeof data.rating === 'number' ? data.rating : 5.0,
          user_ratings_total:
            typeof data.user_ratings_total === 'number' ? data.user_ratings_total : 0,
          error: data.error,
        })
      } catch (error) {
        console.error('Error fetching Google rating:', error)
        setFetched({ rating: 5.0, user_ratings_total: 0 })
      } finally {
        setFetchLoading(false)
      }
    }

    fetchRating()
  }, [fromParent])

  const loading = fromParent ? Boolean(loadingProp) : fetchLoading
  const ratingData: GoogleRatingData | null = fromParent
    ? ratingProp !== undefined
      ? { rating: ratingProp, user_ratings_total: countProp ?? 0 }
      : null
    : fetched

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-white">...</span>
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-current text-yellow-400" />
            ))}
          </div>
        </div>
        <span className="text-white/90 text-sm">{t('loading')}</span>
      </div>
    )
  }

  if (!ratingData) {
    return null
  }

  const rating = ratingData.rating || 5.0
  const reviewCount = ratingData.user_ratings_total || 0

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-3xl font-bold text-white">{rating.toFixed(1)}</span>
        <div className="flex items-center space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-6 w-6 ${
                i < Math.floor(rating)
                  ? 'fill-current text-yellow-400'
                  : i < rating
                    ? 'fill-current text-yellow-200'
                    : 'text-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      <span className="text-white/90 text-sm">
        {reviewCount > 0 ? t('reviewCount', { count: reviewCount }) : t('reviews')}
      </span>
    </div>
  )
}
