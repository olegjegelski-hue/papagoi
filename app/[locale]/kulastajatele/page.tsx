import { Clock, Euro, Users, Camera, Shield, AlertCircle, Phone, Calendar, CheckCircle, XCircle, Info, Car, Baby } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import VisitProcess from '@/components/VisitProcess'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getSiteUrl, pageAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu
    ? 'Посетителям - Центр попугаев в Тарту | Информация, правила, цены'
    : isEn
      ? 'For visitors - Parrot Centre Tartu | Info, rules, prices'
      : 'Külastajatele - Papagoi Keskus Tartus | Info, reeglid, hinnad'
  const description = isRu
    ? 'Информация для гостей: как проходит визит, правила, цены. Бронирование и подарочная карта. Парковка, оплата.'
    : isEn
      ? 'Visitor info: how a visit runs in 6 steps, rules, prices. Book or give a gift card. Parking, payment. All you need!'
      : 'Külastajate info: külastuse käik 6 sammuga, reeglid, hinnad. Broneeri külastus või kingi kinkekaart. Parkimine, maksmine. Kõik vajalik info!'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    keywords: isRu ? 'Центр попугаев посетителям, визит по записи, подарочная карта' : isEn ? 'Parrot Centre visitors, book visit Tartu, gift card' : 'Papagoi Keskus külastajatele, külastus broneerimisega Tartus, kinkekaart',
    alternates: pageAlternates(locale, 'kulastajatele'),
    openGraph: {
      title: isRu ? 'Посетителям - Центр попугаев в Тарту' : isEn ? 'For visitors - Parrot Centre Tartu' : 'Külastajatele - Papagoi Keskus Tartus',
      description: isRu ? 'Вся нужная информация для визита. Бронирование и подарочная карта. Пн–Вс 12–18.' : isEn ? 'All you need to know for your visit. Book or give a gift card. Open Mon–Sun 12–6pm.' : 'Kõik vajalik info Papagoi Keskuse külastamiseks. Broneeri või kingi kinkekaart. Lahtiolekuajad: E-P 12-18.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/kulastajatele`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title: isRu ? 'Посетителям - Центр попугаев в Тарту' : isEn ? 'For visitors - Parrot Centre Tartu' : 'Külastajatele - Papagoi Keskus Tartus',
      description: isRu ? 'Вся нужная информация для визита.' : isEn ? 'All you need to know for your visit. Book or give a gift card.' : 'Kõik vajalik info Papagoi Keskuse külastamiseks. Broneeri või kingi kinkekaart.',
      images: ['/logo.png'],
    },
  }
}

export default async function VisitorsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('KulastajatelePage')
  const allowedLi = t.raw('allowedLi') as string[]
  const forbiddenLi = t.raw('forbiddenLi') as string[]
  const tipsLi = t.raw('tipsLi') as string[]
  const babyLi = t.raw('babyLi') as string[]
  const paymentLi = t.raw('paymentLi') as string[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-papagoi-beige-50 via-papagoi-beige to-papagoi-green-50/50">
      <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">{t('title')}</span>
            </h1>
            <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">
              {t('intro')}
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-8 mb-12 shadow-lg">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-4">{t('importantTitle')}</h3>
                <div className="text-amber-800 space-y-3 text-lg">
                  <p><strong>{t('importantLine1')}</strong></p>
                  <p>{t('importantLine2')}</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <a href="tel:+3725127938" className="font-semibold hover:underline">+372 512 7938</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl text-center border-t-4 border-papagoi-green">
              <Clock className="w-8 h-8 text-papagoi-green mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">{t('hoursTitle')}</h3>
              <p className="text-gray-600 font-medium">{t('hoursValue')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('hoursNote')}</p>
            </div>
            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl text-center border-t-4 border-papagoi-blue">
              <Users className="w-8 h-8 text-papagoi-blue mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">{t('groupTitle')}</h3>
              <p className="text-gray-600 font-medium">{t('groupValue')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('groupNote')}</p>
            </div>
            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl text-center border-t-4 border-papagoi-yellow">
              <Euro className="w-8 h-8 text-papagoi-yellow mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">{t('priceTitle')}</h3>
              <p className="text-gray-600 font-medium">{t('priceValue')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('priceNote')}</p>
            </div>
            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl text-center border-t-4 border-papagoi-orange">
              <Camera className="w-8 h-8 text-papagoi-orange mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">{t('photosTitle')}</h3>
              <p className="text-gray-600 font-medium">{t('photosValue')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('photosNote')}</p>
            </div>
          </div>

          <VisitProcess />

          {/* Reeglid ja juhised */}
          <div id="reeglid-ja-juhised" className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Shield className="w-6 h-6 text-papagoi-blue mr-2" />
              {t('rulesTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-papagoi-green-50 rounded-xl p-6 border border-papagoi-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-papagoi-green mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">{t('allowedTitle')}</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {allowedLi.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-papagoi-green font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-papagoi-red-50 rounded-xl p-6 border border-papagoi-red-200">
                <div className="flex items-center mb-4">
                  <XCircle className="w-6 h-6 text-papagoi-red mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">{t('forbiddenTitle')}</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {forbiddenLi.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-papagoi-red font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-papagoi-blue-50 rounded-xl p-6 border border-papagoi-blue-200">
                <div className="flex items-center mb-4">
                  <Info className="w-6 h-6 text-papagoi-blue mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">{t('tipsTitle')}</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {tipsLi.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-papagoi-blue font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 bg-papagoi-yellow-50 rounded-xl p-6 border border-papagoi-yellow-200">
              <div className="flex items-center mb-4">
                <Baby className="w-6 h-6 text-papagoi-yellow-600 mr-2" />
                <h3 className="font-semibold text-gray-800 text-lg">{t('babyTitle')}</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                {babyLi.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-papagoi-yellow-600 font-bold mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Praktiline info */}
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Info className="w-6 h-6 text-papagoi-green mr-2" />
              {t('practicalTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-papagoi-green-50 rounded-xl p-6 border border-papagoi-green-200">
                <div className="flex items-center mb-4">
                  <Car className="w-6 h-6 text-papagoi-green mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">{t('parkingTitle')}</h3>
                </div>
                <p className="text-gray-700">{t('parkingDesc')}</p>
                <p className="text-gray-700 mt-2 font-semibold text-papagoi-red">{t('parkingNote')}</p>
              </div>
              <div className="bg-papagoi-blue-50 rounded-xl p-6 border border-papagoi-blue-200">
                <div className="flex items-center mb-4">
                  <Euro className="w-6 h-6 text-papagoi-blue mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">{t('paymentTitle')}</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {paymentLi.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-papagoi-red font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-papagoi-orange-50 rounded-xl p-6 border border-papagoi-orange-200">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-papagoi-orange mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">{t('lateTitle')}</h3>
                </div>
                <p className="text-gray-700">{t('lateText')} <a href="tel:+3725127938" className="text-papagoi-red font-semibold hover:underline">+372 512 7938</a></p>
              </div>
              <div className="bg-papagoi-red-50 rounded-xl p-6 border border-papagoi-red-200">
                <div className="flex items-center mb-4">
                  <XCircle className="w-6 h-6 text-papagoi-red mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">{t('cancelTitle')}</h3>
                </div>
                <p className="text-gray-700">{t('cancelText')} <a href="tel:+3725127938" className="text-papagoi-red font-semibold hover:underline">+372 512 7938</a></p>
              </div>
            </div>
          </div>


          {/* CTA */}
          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ctaTitle')}</h2>
            <p className="text-xl mb-8 opacity-90">{t('ctaSubtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/broneeri" className="papagoi-cta-white inline-flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                {t('ctaBook')}
              </Link>
              <a href="tel:+3725127938" className="papagoi-cta-outline inline-flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                {t('ctaPhone')}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
