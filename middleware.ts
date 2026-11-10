import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { etBlogPostPathFromLocalized } from './lib/blog-post-locale'
import { annetusRedirect, ristiisaRedirect, type ClosedPageRedirect } from './lib/closed-page-redirects'
import { RISTIISA_ENABLED } from './lib/features'
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

/** EN/RU blogipostitus → 301 /et/blogi/[slug]. Nimekirjaleht /en/blogi ja /ru/blogi jääb. */
function blogPostLocaleRedirect(request: NextRequest): NextResponse | null {
  const target = etBlogPostPathFromLocalized(request.nextUrl.pathname)
  if (!target) return null
  const url = request.nextUrl.clone()
  url.pathname = target
  return NextResponse.redirect(url, 301)
}

function applyClosedRedirect(request: NextRequest, dest: ClosedPageRedirect): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = dest.pathname
  if (dest.hash) url.hash = dest.hash
  return NextResponse.redirect(url, dest.status)
}

/** Ristiisa programm suletud — 307 ajutine suunamine /toetused peale (lipp RISTIISA_ENABLED). */
function ristiisaPageRedirect(request: NextRequest): NextResponse | null {
  const dest = ristiisaRedirect(request.nextUrl.pathname, RISTIISA_ENABLED)
  return dest ? applyClosedRedirect(request, dest) : null
}

/** /annetus eemaldatud — 308 püsiv suunamine /toetused#anneta (query, sh purpose, säilib). */
function annetusPageRedirect(request: NextRequest): NextResponse | null {
  const dest = annetusRedirect(request.nextUrl.pathname)
  return dest ? applyClosedRedirect(request, dest) : null
}

export default function middleware(request: NextRequest) {
  return (
    toetusegaRedirect(request) ??
    grupidRedirect(request) ??
    ristiisaPageRedirect(request) ??
    annetusPageRedirect(request) ??
    blogPostLocaleRedirect(request) ??
    handleI18n(request)
  )
}

export const config = {
  // dev/* jääb ilma locale prefiksita (app/dev/… ei ole [locale] all)
  matcher: ['/((?!api|trpc|_next|_vercel|dev|.*\\..*).*)'],
}
