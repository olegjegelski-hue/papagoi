import type { MetadataRoute } from 'next'

const LOCALES = ['et', 'en'] as const
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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee'
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const now = new Date()

  const entries: MetadataRoute.Sitemap = []
  for (const locale of LOCALES) {
    for (const { path, changeFrequency, priority } of PATHS) {
      entries.push({
        url: path ? `${normalizedBaseUrl}/${locale}/${path}` : `${normalizedBaseUrl}/${locale}`,
        lastModified: now,
        changeFrequency,
        priority,
      })
    }
  }
  return entries
}
