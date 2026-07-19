import { Clock, Users, GraduationCap, Heart, ExternalLink, Calendar, Phone } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import ServiceSchema from '@/components/ServiceSchema'
import GiftCardCTA from '@/components/GiftCardCTA'
import GroupVisitsCards from '@/components/GroupVisitsCards'
import PetsVillaLink from '@/components/PetsVillaLink'
import ScrollToHash from '@/components/ScrollToHash'
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
    ? 'Услуги - Центр попугаев в Тарту | Визит, подарочная карта, день рождения'
    : isEn
      ? 'Services - Parrot Centre Tartu | Visit, gift card, birthday, group visits'
      : 'Teenused - Papagoi Keskus Tartus | Külastus, kinkekaart, sünnipäev, grupikülastused'
  const description = isRu
    ? 'Услуги Центра попугаев: визит 10€, подарочная карта, день рождения 350€, VIP, выезды, групповые визиты. Бронируйте или купите карту!'
    : isEn
      ? 'Parrot Centre services: visit €10, digital gift card, birthday €350, VIP visit, events with parrots, group visits. Book or buy a gift card!'
      : 'Papagoi Keskuse teenused: külastus 10€, digitaalne kinkekaart, sünnipäev 350€, VIP külastus, üritused papagoidega väljas, grupikülastused. Broneeri või osta kinkekaart!'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    keywords: isRu
      ? 'Центр попугаев услуги, подарочная карта, день рождения, групповые визиты'
      : isEn
        ? 'Parrot Centre services, gift card, parrot birthday, group visits Tartu'
        : 'Papagoi Keskus teenused, kinkekaart, papagoid sünnipäevale, külastus broneerimisega, grupikülastused Tartus',
    alternates: pageAlternates(locale, 'teenused'),
    openGraph: {
      title: isRu ? 'Услуги - Центр попугаев в Тарту' : isEn ? 'Services - Parrot Centre Tartu' : 'Teenused - Papagoi Keskus Tartus',
      description: isRu ? 'Визит 10€, подарочная карта, день рождения, VIP, групповые визиты.' : isEn ? 'Visit €10, gift card, birthdays, VIP, group visits.' : 'Külastus 10€, kinkekaart, sünnipäevad, VIP külastus, grupikülastused.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/teenused`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title: isRu ? 'Услуги - Центр попугаев в Тарту' : isEn ? 'Services - Parrot Centre Tartu' : 'Teenused - Papagoi Keskus Tartus',
      description: isRu ? 'Визит 10€, подарочная карта, групповые визиты.' : isEn ? 'Visit €10, gift card, group visits.' : 'Külastus 10€, kinkekaart, grupikülastused.',
      images: ['/logo.png'],
    },
  }
}

export default async function TeenusedPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('TeenusedPage')
  const visitWhatLi = t.raw('visitWhatLi') as string[]
  const vipWhatLi = t.raw('vipWhatLi') as string[]
  const birthdayWhatLi = t.raw('birthdayWhatLi') as string[]
  const outsideWhatLi = t.raw('outsideWhatLi') as string[]

  const bookButton = (
    <div className="flex justify-center mt-8">
      <Link href="/broneeri" className="papagoi-cta text-white shadow-2xl">
        <Calendar className="w-5 h-5" aria-hidden />
        <span>{t('ctaBook')}</span>
      </Link>
    </div>
  )

  return (
    <>
      <ServiceSchema />
      <ScrollToHash />
      <div className="min-h-screen bg-gradient-to-b from-papagoi-beige-50 via-papagoi-beige to-papagoi-green-50/50">
        <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{t('title')}</span>
            </h1>
            <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">
              {t('intro')}
            </p>
          </div>

          <div id="kulastus" className="scroll-mt-[12.5rem] bg-papagoi-beige-100 text-card-foreground border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('visitTitle')}</h2>
              <p className="text-xl opacity-90">{t('visitSubtitle')}</p>
              <p className="text-sm opacity-90 mt-2">{t('visitMinNote')}</p>
            </div>
            <div className="p-8">
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-4 text-green-700 text-lg">{t('visitWhatTitle')}</h4>
                <ul className="space-y-3 text-gray-700">
                  {visitWhatLi.map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-4 text-green-700 text-lg">{t('visitWhoTitle')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-papagoi-beige-100 rounded-lg">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">{t('visitWho1')}</p>
                  </div>
                  <div className="text-center p-4 bg-papagoi-beige-100 rounded-lg">
                    <GraduationCap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">{t('visitWho2')}</p>
                  </div>
                  <div className="text-center p-4 bg-papagoi-beige-100 rounded-lg">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">{t('visitWho3')}</p>
                    <p className="text-sm text-gray-600">{t('visitWho3Sub')}</p>
                  </div>
                  <div className="text-center p-4 bg-papagoi-beige-100 rounded-lg">
                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">{t('visitWho4')}</p>
                    <p className="text-sm text-gray-600">{t('visitWho4Sub')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-gray-700">{t('visitPrice')}</p>
              </div>
              {bookButton}
            </div>
          </div>

          <div className="bg-papagoi-beige-100 border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('vipTitle')}</h2>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="text-lg font-semibold">{t('vipGuests')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-semibold">{t('vipDuration')}</span>
                </div>
              </div>
              <p className="text-xl opacity-90">{t('vipSubtitle')}</p>
            </div>
            <div className="p-8">
              <div className="mb-0">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-semibold text-gray-800">{t('vipWhen')}</span>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold mb-4 text-indigo-700 text-lg">{t('vipWhatTitle')}</h4>
                  <ul className="space-y-3 text-gray-700">
                    {vipWhatLi.map((item, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <span className="text-indigo-600 font-bold mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-gray-700">{t('vipPrice')}</p>
                </div>
              </div>
              {bookButton}
            </div>
          </div>

          <div id="grupikylastused" className="scroll-mt-[12.5rem] bg-papagoi-beige-100 border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('groupTitle')}</h2>
              <p className="text-xl opacity-90">{t('groupSubtitle')}</p>
            </div>
            <div className="p-8">
              <GroupVisitsCards />
              {bookButton}
            </div>
          </div>

          <GiftCardCTA variant="service" />

          <div className="bg-papagoi-beige-100 border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('birthdayTitle')}</h2>
              <p className="text-xl opacity-90">{t('birthdaySubtitle')}</p>
            </div>
            <div className="p-8">
              <div className="bg-pink-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-4 text-pink-700 text-lg">{t('birthdayWhatTitle')}</h4>
                <ul className="space-y-3 text-gray-700">
                  {birthdayWhatLi.map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <span className="text-pink-600 font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-gray-700">{t('birthdayPrice')}</p>
              </div>
              <p className="mt-6 text-center text-gray-700 leading-relaxed">
                {t('birthdaySimpleTip')}
              </p>
              {bookButton}
            </div>
          </div>

          <div className="bg-papagoi-beige-100 border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('outsideTitle')}</h2>
              <p className="text-xl opacity-90">{t('outsideSubtitle')}</p>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('outsideDescTitle')}</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">{t('outsideDesc')}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-4 text-green-700 text-lg">{t('outsideWhatTitle')}</h4>
                <ul className="space-y-3 text-gray-700">
                  {outsideWhatLi.map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-gray-700">{t('outsidePrice')}</p>
              </div>
              {bookButton}
            </div>
          </div>

          <div className="bg-papagoi-beige-100 border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{t('saleTitle')}</h2>
              <p className="text-lg opacity-90">{t('saleSubtitle')}</p>
            </div>
            <div className="p-8">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200 text-center">
                <p className="text-gray-700 leading-relaxed mb-6">{t('saleDesc')}</p>
                <PetsVillaLink
                  source="teenused"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {t('saleLinkText')}
                </PetsVillaLink>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ctaTitle')}</h2>
            <p className="text-xl mb-8 opacity-90">{t('ctaSubtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/broneeri"
                className="papagoi-cta-white inline-flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t('ctaBook')}
              </Link>
              <a
                href="tel:+3725127938"
                className="papagoi-cta-outline inline-flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                {t('ctaPhone')}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
