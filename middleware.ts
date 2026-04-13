import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // dev/* jääb ilma locale prefiksita (app/dev/… ei ole [locale] all)
  matcher: ['/((?!api|trpc|_next|_vercel|dev|.*\\..*).*)'],
}
