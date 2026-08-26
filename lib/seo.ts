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

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export type ShareImageVariant = 'default' | 'kinkekaart'

const SHARE_IMAGE_PATH: Record<ShareImageVariant, string> = {
  default: '/og/default.jpg',
  kinkekaart: '/og/kinkekaart.jpg',
}

const SHARE_IMAGE_ALT: Record<ShareImageVariant, Record<string, string>> = {
  default: {
    et: 'Sinine ja kuldne ara Papagoi Keskuses Tartus',
    en: 'Blue-and-gold macaw at the Parrot Centre in Tartu',
    ru: 'Сине-жёлтый ара в Центре попугаев в Тарту',
  },
  kinkekaart: {
    et: 'Papagoi Keskuse kinkekaart',
    en: 'Parrot Centre gift card',
    ru: 'Подарочная карта Центра попугаев',
  },
}

/** Absolute 1200×630 og:image (+ width/height/alt) for Open Graph and Twitter. */
export function shareImages(locale = 'et', variant: ShareImageVariant = 'default') {
  const alt = SHARE_IMAGE_ALT[variant][locale] ?? SHARE_IMAGE_ALT[variant].et
  return [
    {
      url: `${getSiteUrl()}${SHARE_IMAGE_PATH[variant]}`,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt,
      type: 'image/jpeg',
    },
  ]
}
