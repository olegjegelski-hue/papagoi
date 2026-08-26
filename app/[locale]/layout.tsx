import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Toaster } from 'sonner'
import LocalBusinessSchema from '@/components/LocalBusinessSchema'
import TouristAttractionSchema from '@/components/TouristAttractionSchema'
import OrganizationSchema from '@/components/OrganizationSchema'
import CookieBanner from '@/components/CookieBanner'
import SetHtmlLang from '@/components/SetHtmlLang'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <>
      <SetHtmlLang locale={locale} />
      <LocalBusinessSchema />
      <TouristAttractionSchema />
      <OrganizationSchema />
      <NextIntlClientProvider messages={messages} locale={locale}>
        <Navigation />
        <main className="flex-1 flex flex-col bg-papagoi-beige">
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <Toaster position="top-center" richColors />
      </NextIntlClientProvider>
    </>
  )
}
