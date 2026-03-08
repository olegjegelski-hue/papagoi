import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['et', 'en', 'ru'],
  defaultLocale: 'et',
  localePrefix: 'always',
})
