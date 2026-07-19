import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getPublishedBlogSlugsForSitemap } from '@/lib/notion-blog-slugs'
import { localeUrl, sitemapLanguageAlternates } from '@/lib/seo'

const PATHS = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1 },
  { path: 'teenused', changeFrequency: 'monthly' as const, priority: 0.9 },
  { path: 'broneeri', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: 'kinkekaart', changeFrequency: 'monthly' as const, priority: 0.9 },
  { path: 'kontakt', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: 'meist', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: 'kulastajatele', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: 'papagoid', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: 'blogi', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: 'grupid', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: 'ristiisa-programm', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: 'privaatsus', changeFrequency: 'yearly' as const, priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const { path, changeFrequency, priority } of PATHS) {
    const languages = sitemapLanguageAlternates(path)
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: now,
        changeFrequency,
        priority,
        alternates: { languages },
      })
    }
  }

  const blogPosts = await getPublishedBlogSlugsForSitemap()
  for (const post of blogPosts) {
    const path = `blogi/${post.slug}`
    const languages = sitemapLanguageAlternates(path)
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: post.lastModified || now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages },
      })
    }
  }

  return entries
}
