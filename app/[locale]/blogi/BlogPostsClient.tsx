'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type BlogPost = {
  id: string
  slug?: string
  title: string
  excerpt?: string
  cover?: string
  categories?: string[]
  date?: string | null
}

type Props = {
  posts: BlogPost[]
}

const ALL_CATEGORY = '__all__'

function dateLocale(locale: string): string {
  if (locale === 'ru') return 'ru-RU'
  if (locale === 'en') return 'en-GB'
  return 'et-EE'
}

export default function BlogPostsClient({ posts }: Props) {
  const t = useTranslations('BlogPage')
  const locale = useLocale()
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY)

  const categories = useMemo(() => {
    const values = new Set<string>()
    posts.forEach((post) => {
      ;(post.categories || []).forEach((category) => values.add(category))
    })
    return [ALL_CATEGORY, ...Array.from(values)]
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) return posts
    return posts.filter((post) => (post.categories || []).includes(selectedCategory))
  }, [posts, selectedCategory])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {categories.map((category) => {
          const isActive = category === selectedCategory
          const label = category === ALL_CATEGORY ? t('allCategories') : category
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={[
                'px-4 py-2 rounded-full text-sm font-semibold transition-colors border',
                isActive
                  ? 'bg-papagoi-green text-white border-papagoi-green'
                  : 'bg-papagoi-beige-100 text-gray-700 border-papagoi-beige-300 hover:bg-card',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => {
          const formattedDate = post.date
            ? new Date(post.date).toLocaleDateString(dateLocale(locale), {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : ''

          return (
            <article key={post.id} className="bg-card text-card-foreground border rounded-3xl shadow-2xl overflow-hidden border-border">
              {post.cover && (
                <div className="h-56 w-full overflow-hidden">
                  <img
                    src={post.cover}
                    alt={t('coverAlt', { title: post.title })}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {(post.categories || []).map((category) => (
                    <span
                      key={category}
                      className="bg-papagoi-green/10 text-papagoi-green text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                  {formattedDate && (
                    <span className="text-xs text-gray-500">{formattedDate}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-gray-600 leading-relaxed mb-6">{post.excerpt}</p>
                )}
                <Link
                  href={`/blogi/${post.slug || post.id}`}
                  className="inline-flex items-center text-papagoi-blue font-semibold hover:underline"
                >
                  {t('readMore')}
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
