import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const handleI18n = createMiddleware(routing)

/** /toetusega on ümber nimetatud — püsiv 301 samas keeles /toetused peale. */
function toetusegaRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const withLocale = pathname.match(/^\/(et|en|ru)\/toetusega\/?$/)
  if (withLocale) {
    const url = request.nextUrl.clone()
    url.pathname = `/${withLocale[1]}/toetused`
    return NextResponse.redirect(url, 301)
  }
  if (pathname === '/toetusega' || pathname === '/toetusega/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${routing.defaultLocale}/toetused`
    return NextResponse.redirect(url, 301)
  }
  return null
}

/** /grupid on eemaldatud — püsiv 301 samas keeles /teenused peale. */
function grupidRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const withLocale = pathname.match(/^\/(et|en|ru)\/grupid\/?$/)
  if (withLocale) {
    const url = request.nextUrl.clone()
    url.pathname = `/${withLocale[1]}/teenused`
    return NextResponse.redirect(url, 301)
  }
  if (pathname === '/grupid' || pathname === '/grupid/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${routing.defaultLocale}/teenused`
    return NextResponse.redirect(url, 301)
  }
  return null
}

export default function middleware(request: NextRequest) {
  return toetusegaRedirect(request) ?? grupidRedirect(request) ?? handleI18n(request)
}

export const config = {
  // dev/* jääb ilma locale prefiksita (app/dev/… ei ole [locale] all)
  matcher: ['/((?!api|trpc|_next|_vercel|dev|.*\\..*).*)'],
}
