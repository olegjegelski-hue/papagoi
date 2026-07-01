import { Link } from '@/i18n/navigation'
import { Gift, QrCode, Calendar, ExternalLink } from 'lucide-react'
import GiftCardForm from '@/components/GiftCardForm'
import PetsVillaLink from '@/components/PetsVillaLink'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu ? 'Подарочная карта - Центр попугаев в Тарту | Подарить визит' : isEn ? 'Gift card - Parrot Centre Tartu | Give a visit' : 'Kinkekaart - Papagoi Keskus Tartus | Kingi külastus'
  const description = isRu
    ? 'Купите цифровую подарочную карту Центра попугаев. 10 € = 1 визит. Сумма шагами по 10 €. Идеально на день рождения или юбилей. Быстрый заказ и подтверждение по эл. почте.'
    : isEn
      ? 'Buy a digital gift card for the Parrot Centre. €10 = 1 visit. Choose amount in €10 steps. Ideal for birthdays or anniversaries. Quick order and confirmation by email.'
      : 'Osta Papagoi Keskuse digitaalne kinkekaart. 10 € = 1 külastus. Vali summa 10 € sammuga. Ideaalse kingituseks sünnipäevaks või juubeliks. Kiire tellimine ja kinnitus e-kirjaga.'
  const keywords = isRu
    ? 'подарочная карта Центр попугаев, подарить визит, карта центр попугаев Тарту, цифровая подарочная карта'
    : isEn
      ? 'gift card Parrot Centre, give a visit, parrot centre gift card, Tartu gift card, digital gift card'
      : 'kinkekaart Papagoi Keskus, kingi külastus, papagoidekeskus kinkekaart, Tartu kinkekaart, digitaalne kinkekaart, kingi elamus'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `${base}/${locale}/kinkekaart` },
    openGraph: {
      title: isRu ? 'Подарочная карта - Центр попугаев в Тарту' : isEn ? 'Gift card - Parrot Centre Tartu' : 'Kinkekaart - Papagoi Keskus Tartus',
      description: isRu ? 'Подарите визит в Центр попугаев. Цифровая карта шагами по 10 €. На день рождения или юбилей.' : isEn ? 'Give a visit to the Parrot Centre. Digital gift card in €10 steps. For birthdays or anniversaries.' : 'Kingi külastus Papagoi Keskuses. Digitaalne kinkekaart 10 € sammuga. Sünnipäevaks või juubeliks.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/kinkekaart`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title: isRu ? 'Подарочная карта - Центр попугаев в Тарту' : isEn ? 'Gift card - Parrot Centre Tartu' : 'Kinkekaart - Papagoi Keskus Tartus',
      description: isRu ? 'Подарите визит в Центр попугаев. Цифровая карта шагами по 10 €.' : isEn ? 'Give a visit to the Parrot Centre. Digital gift card in €10 steps.' : 'Kingi külastus Papagoi Keskuses. Digitaalne kinkekaart 10 € sammuga.',
      images: ['/logo.png'],
    },
  }
}

export default async function KinkekaartPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('KinkekaartPage')
  const tContact = await getTranslations('KontaktPage')
  const serviceT = await getTranslations('TeenusedPage')

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
            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden border border-papagoi-green/10">
              <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue p-8 text-white text-center">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl md:text-3xl font-bold">{t('digitalGiftCard')}</h2>
              </div>
              <div className="p-8">
                <GiftCardForm />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-6 border border-papagoi-green/10">
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

            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-6 border border-papagoi-blue/10">
              <div className="flex items-center space-x-3 mb-4">
                <QrCode className="w-6 h-6 text-papagoi-blue" />
                <h3 className="text-xl font-bold text-deep-anthracite">{t('qrTitle')}</h3>
              </div>
              <p className="text-warm-gray-700 text-sm">{t('qrDesc')}</p>
            </div>

            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-6 border border-papagoi-green/10">
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

            <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-2xl p-6 text-white text-center">
              <p className="font-semibold mb-4">{t('recipientBook')}</p>
              <Link href="/broneeri" className="papagoi-cta-white inline-flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                {t('bookVisit')}
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-papagoi-beige-100 border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mt-12">
          <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{serviceT('saleTitle')}</h2>
            <p className="text-lg opacity-90">{serviceT('saleSubtitle')}</p>
          </div>
          <div className="p-8">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200 text-center">
              <p className="text-gray-700 leading-relaxed mb-6">{serviceT('saleDesc')}</p>
              <PetsVillaLink
                source="kinkekaart"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                {serviceT('saleLinkText')}
              </PetsVillaLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
