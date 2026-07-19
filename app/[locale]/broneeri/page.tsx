import StaticBookingInfo from '@/components/StaticBookingInfo'
import GiftCardCTA from '@/components/GiftCardCTA'
import { Calendar, Users, Clock, Euro, Phone, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getSiteUrl, pageAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu ? 'Забронировать визит - Центр попугаев в Тарту' : isEn ? 'Book a visit - Parrot Centre Tartu' : 'Broneeri külastus - Papagoi Keskus Tartus'
  const description = isRu
    ? 'Забронируйте визит в Центр попугаев в Тарту! Ответ в течение 24 ч. Визиты Пн–Вс 12–18, 10€/чел. Мин. 3 чел. Или купите подарочную карту.'
    : isEn
      ? 'Book a visit to the Parrot Centre in Tartu! We reply within 24h. Visits Mon–Fri 12–6pm, €10/person. Min 3 people. Or buy a digital gift card.'
      : 'Broneeri külastus Papagoi Keskusesse Tartus! Vastus 24h jooksul. Külastused E-P 12-18, hind 10€/inimene. Min 3 inimest. Või kingi digitaalne kinkekaart – osta kinkekaart.'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    alternates: pageAlternates(locale, 'broneeri'),
    openGraph: {
      title: isRu ? 'Забронировать визит - Центр попугаев в Тарту' : isEn ? 'Book a visit - Parrot Centre Tartu' : 'Broneeri külastus - Papagoi Keskus Tartus',
      description: isRu ? 'Забронируйте визит в единственный в Эстонии центр попугаев. Ответ за 24 ч. Или купите подарочную карту.' : isEn ? 'Book a visit to Estonia\'s unique parrot centre. Reply within 24h. Or buy a gift card.' : 'Broneeri külastus Eesti ainulaadsesse papagoidekeskusesse. Vastus 24h jooksul. Või osta kinkekaart.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/broneeri`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title: isRu ? 'Забронировать визит - Центр попугаев в Тарту' : isEn ? 'Book a visit - Parrot Centre Tartu' : 'Broneeri külastus - Papagoi Keskus Tartus',
      description: isRu ? 'Забронируйте визит в центр попугаев. Ответ за 24 ч. Или купите подарочную карту.' : isEn ? 'Book a visit to the parrot centre. Reply within 24h. Or buy a gift card.' : 'Broneeri külastus papagoidekeskusesse. Vastus 24h jooksul. Või osta kinkekaart.',
      images: ['/logo.png'],
    },
  }
}

export default async function BookingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('BroneeriPage')

  return (
    <div className="min-h-screen bg-papagoi-beige-50 pt-8 sm:pt-12 pb-28 sm:pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">{t('title')}</span>
          </h1>
          <p className="text-base sm:text-xl text-deep-anthracite-700 max-w-3xl mx-auto">{t('intro')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 min-w-0">
            <StaticBookingInfo />
          </div>

          <div className="space-y-8">
            <div className="bg-card text-card-foreground rounded-2xl shadow-2xl p-6 border border-papagoi-blue/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">{t('directContact')}</h3>
              <div className="space-y-3">
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-blue">{t('phone')}:</strong>{' '}
                  <a href="tel:+3725127938" className="hover:underline">+372 512 7938</a>
                </p>
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-green">{t('email')}:</strong> keskus@papagoi.ee
                </p>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-2xl shadow-2xl p-6 border border-papagoi-green/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-6">{t('visitInfo')}</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-papagoi-green" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('bookingRequest')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('response24h')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-papagoi-blue" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('visitDuration')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('about1h')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-papagoi-red" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('groupSize')}</p>
                    <p className="text-warm-gray-600 text-sm">
                      {t('upTo20')}
                      <br />
                      {t('childrenUpTo30')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Euro className="w-5 h-5 text-papagoi-orange" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('price')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('pricePerPerson')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-papagoi-yellow-600" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('cancellation')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('cancel24h')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-papagoi-beige-50 rounded-xl p-6 border border-papagoi-blue/20">
              <h4 className="text-lg font-semibold text-deep-anthracite mb-4">{t('includeWhenBooking')}</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-papagoi-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('groupSizeComposition')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('groupSizeDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-papagoi-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('preferredDateTime')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('preferredDateTimeDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-papagoi-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('contactDetails')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('contactDetailsDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-papagoi-orange mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">{t('specialNeeds')}</p>
                    <p className="text-warm-gray-600 text-sm">{t('specialNeedsDesc')}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-papagoi-beige-50 rounded-xl p-6 border border-papagoi-green/20">
              <h4 className="text-lg font-semibold text-deep-anthracite mb-3">{t('whatToBringTitle')}</h4>
              <p className="text-warm-gray-700 text-sm leading-relaxed mb-3">{t('whatToBringP1')}</p>
              <p className="text-warm-gray-700 text-sm leading-relaxed mb-3">{t('whatToBringP2')}</p>
              <p className="text-warm-gray-700 text-sm leading-relaxed">{t('whatToBringP3')}</p>
            </div>
          </div>
        </div>

        <GiftCardCTA />
      </div>
    </div>
  )
}
