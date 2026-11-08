import { Heart } from 'lucide-react'
import DonationForm from '@/components/DonationForm'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { parseDonationPurpose } from '@/lib/donation'
import { getSiteUrl, pageAlternates, shareImages } from '@/lib/seo'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AnnetusPage' })
  const base = getSiteUrl()
  const title = t('metaTitle')
  const description = t('metaDescription')
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'

  return {
    title,
    description,
    alternates: pageAlternates(locale, 'annetus'),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/annetus`,
      images: shareImages(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImages(locale),
    },
  }
}

export default async function AnnetusPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('AnnetusPage')
  const tContact = await getTranslations('KontaktPage')
  const initialPurpose = parseDonationPurpose(firstQuery(sp.purpose)) ?? undefined

  return (
    <div className="min-h-screen bg-papagoi-beige-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-xl text-deep-anthracite-700 max-w-3xl mx-auto">{t('intro')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden border-papagoi-green/10">
              <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue p-8 text-white text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl md:text-3xl font-bold">{t('formTitle')}</h2>
              </div>
              <div className="p-8">
                <DonationForm initialPurpose={initialPurpose} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-6 border-papagoi-green/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">{t('howItWorks')}</h3>
              <ol className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-papagoi-green/20 text-papagoi-green font-bold flex items-center justify-center">1</span>
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('step1Title')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('step1Desc')}</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-papagoi-blue/20 text-papagoi-blue font-bold flex items-center justify-center">2</span>
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('step2Title')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('step2Desc')}</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-papagoi-orange/20 text-papagoi-orange font-bold flex items-center justify-center">3</span>
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('step3Title')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('step3Desc')}</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-6 border-papagoi-blue/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">{t('questions')}</h3>
              <div className="space-y-3">
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-green">{tContact('phone')}:</strong>{' '}
                  <a href="tel:+3725127938" className="hover:underline">+372 512 7938</a>
                </p>
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-blue">{tContact('email')}:</strong> keskus@papagoi.ee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
