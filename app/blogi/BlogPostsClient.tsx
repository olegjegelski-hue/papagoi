'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

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

export default function BlogPostsClient({ posts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Kõik')

  const categories = useMemo(() => {
    const values = new Set<string>()
    posts.forEach((post) => {
      ;(post.categories || []).forEach((category) => values.add(category))
    })
    return ['Kõik', ...Array.from(values)]
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'Kõik') return posts
    return posts.filter((post) => (post.categories || []).includes(selectedCategory))
  }, [posts, selectedCategory])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {categories.map((category) => {
          const isActive = category === selectedCategory
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={[
                'px-4 py-2 rounded-full text-sm font-semibold transition-colors border',
                isActive
                  ? 'bg-papagoi-green text-white border-papagoi-green'
                  : 'bg-white/80 text-gray-700 border-white/60 hover:bg-white',
              ].join(' ')}
            >
              {category}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => {
          const formattedDate = post.date
            ? new Date(post.date).toLocaleDateString('et-EE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : ''

          return (
            <article key={post.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/60">
              {post.cover && (
                <div className="h-56 w-full overflow-hidden">
                  <img
                    src={post.cover}
                    alt={`${post.title} kaanepilt`}
                    className="h-full w-full object-cover"
                    loading="lazy"
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
                  Loe edasi
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
