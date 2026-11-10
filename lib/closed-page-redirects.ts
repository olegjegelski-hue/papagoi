import { routing } from '@/i18n/routing'

export type ClosedPageRedirect = {
  pathname: string
  status: 307 | 308
  hash?: string
}

function matchLocaleSlug(pathname: string, slug: string): { locale: string } | null {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const withLocale = pathname.match(new RegExp(`^/(et|en|ru)/${escaped}/?$`))
  if (withLocale) return { locale: withLocale[1] }
  if (pathname === `/${slug}` || pathname === `/${slug}/`) {
    return { locale: routing.defaultLocale }
  }
  return null
}

/** Ristiisa programm suletud: 307 /{locale}/toetused. Lipuga välja. */
export function ristiisaRedirect(
  pathname: string,
  enabled: boolean,
): ClosedPageRedirect | null {
  if (enabled) return null
  const match = matchLocaleSlug(pathname, 'ristiisa-programm')
  if (!match) return null
  return { pathname: `/${match.locale}/toetused`, status: 307 }
}

/** /annetus on kustutatud: 308 /{locale}/toetused#anneta. Query (nt purpose) jääb URL-ile. */
export function annetusRedirect(pathname: string): ClosedPageRedirect | null {
  const match = matchLocaleSlug(pathname, 'annetus')
  if (!match) return null
  return { pathname: `/${match.locale}/toetused`, status: 308, hash: '#anneta' }
}
