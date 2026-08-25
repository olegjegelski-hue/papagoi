'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, ExternalLink } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { useTranslations } from 'next-intl'
import GoogleRating from './GoogleRating'
import { loadGoogleReviews } from '@/lib/google-reviews-client'

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  relative_time_description?: string
  time?: number
}

export default function TestimonialsSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })
  const [googleReviews, setGoogleReviews] = React.useState<GoogleReview[]>([])
  const [googleReviewsLoaded, setGoogleReviewsLoaded] = React.useState(false)
  const [rating, setRating] = React.useState<number | undefined>(undefined)
  const [reviewCount, setReviewCount] = React.useState(0)
  const t = useTranslations('Testimonials')

  React.useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        const data = await loadGoogleReviews()
        setRating(typeof data.rating === 'number' ? data.rating : 5.0)
        setReviewCount(
          typeof data.user_ratings_total === 'number' ? data.user_ratings_total : 0
        )
        if (Array.isArray(data.reviews)) {
          const withText = data.reviews.filter((r: GoogleReview) => r.text && r.text.trim().length > 0)
          const byNewest = [...withText].sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
          setGoogleReviews(byNewest.slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching Google reviews:', error)
        setRating(5.0)
        setReviewCount(0)
      } finally {
        setGoogleReviewsLoaded(true)
      }
    }
    fetchGoogleReviews()
  }, [])

  const formatFirstName = (fullName: string) => {
    if (!fullName) return ''
    const parts = fullName.trim().split(' ')
    return parts[0] || fullName
  }

  return (
    <section className="pt-0 pb-12 bg-gradient-to-b from-papagoi-blue-50 to-papagoi-yellow-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-0">{t('subtitle')}</p>
        </motion.div>

        <div className="mt-1 mb-3 flex justify-center">
          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-3xl px-6 py-4 text-white inline-block shadow-lg">
            <GoogleRating
              loading={!googleReviewsLoaded}
              rating={rating}
              userRatingsTotal={reviewCount}
            />
          </div>
        </div>

        {googleReviewsLoaded && googleReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {googleReviews.map((review, index) => (
                <div
                  key={`${review.author_name}-${index}`}
                  className="bg-card text-card-foreground border rounded-3xl shadow-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">&quot;{review.text}&quot;</p>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-gray-900">{formatFirstName(review.author_name)}</div>
                    {review.relative_time_description && (
                      <div className="text-xs text-gray-500">{review.relative_time_description}</div>
                    )}
                    <div className="text-xs text-papagoi-blue mt-1">{t('source')}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('shareTitle')}</h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">{t('shareSubtitle')}</p>
            <a
              href="https://g.page/r/CXfsGh_UtN6-EAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="papagoi-cta-white inline-flex items-center justify-center space-x-2"
            >
              <Star className="w-5 h-5 fill-current text-yellow-400" />
              <span>{t('leaveReview')}</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
