import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

export function getSiteUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://papagoi.ee'
  return baseUrl.replace(/\/$/, '')
}

/** Absolute URL for a locale + path (path without leading slash), e.g. localeUrl('et', 'broneeri') */
export function localeUrl(locale: string, path = '') {
  const base = getSiteUrl()
  const clean = path.replace(/^\//, '')
  return clean ? `${base}/${locale}/${clean}` : `${base}/${locale}`
}

/** canonical + hreflang languages (et/en/ru + x-default) for generateMetadata / sitemap */
export function pageAlternates(locale: string, path = ''): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    languages[loc] = localeUrl(loc, path)
  }
  languages['x-default'] = localeUrl(routing.defaultLocale, path)

  return {
    canonical: localeUrl(locale, path),
    languages,
  }
}

/** Sitemap alternates.languages for one logical path across all locales */
export function sitemapLanguageAlternates(path = '') {
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    languages[loc] = localeUrl(loc, path)
  }
  languages['x-default'] = localeUrl(routing.defaultLocale, path)
  return languages
}
