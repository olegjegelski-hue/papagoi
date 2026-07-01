import { Home, Feather, Building, Calendar, ExternalLink } from 'lucide-react'
import { Link } from '@/i18n/navigation'
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
  const title = isRu
    ? 'О нас - Центр попугаев в Тарту | Первый в Эстонии'
    : isEn
      ? 'About us - Parrot Centre Tartu | Estonia\'s first parrot centre'
      : 'Meist - Papagoi Keskus Tartus | Eesti esimene papagoidekeskus'
  const description = isRu
    ? 'Центр попугаев — семья из более чем 50 попугаев в Тарту. Наша история, 50 m² комната попугаев, 15+ видов. Визит и подарочная карта. Первый в Эстонии с 2015.'
    : isEn
      ? 'Parrot Centre is a family of over 50 parrots in Tartu. Our story, 50 m² parrot room, 15+ species, care and hygiene. Visit and gift card. Estonia\'s first parrot centre since 2015.'
      : 'Papagoi Keskus on üle 50 papagoi pere Tartus. Meie lugu, 50m² papagoide tuba, 15+ liiki, hügieen ja hooldus. Külastus ja kinkekaart. Eesti esimene papagoidekeskus alates 2015.'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    keywords: isRu
      ? 'Центр попугаев о нас, первый в Эстонии, история, Тарту, подарочная карта'
      : isEn
        ? 'Parrot Centre about us, Estonia first parrot centre, history Tartu, gift card'
        : 'Papagoi Keskus meie lugu, Eesti esimene papagoidekeskus, Papagoi Keskus ajalugu, papagoidekeskus Tartus, kinkekaart',
    alternates: { canonical: `${base}/${locale}/meist` },
    openGraph: {
      title: isRu ? 'О нас - Центр попугаев в Тарту' : isEn ? 'About us - Parrot Centre Tartu' : 'Meist - Papagoi Keskus Tartus',
      description: isRu ? 'Познакомьтесь с Центром попугаев в Тарту: первый в Эстонии с 2015.' : isEn ? 'Meet Parrot Centre in Tartu: Estonia\'s first parrot centre since 2015.' : 'Tutvuge Papagoi Keskusega Tartus: Eesti esimene papagoidekeskus alates 2015.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/meist`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title: isRu ? 'О нас - Центр попугаев в Тарту' : isEn ? 'About us - Parrot Centre Tartu' : 'Meist - Papagoi Keskus Tartus',
      description: isRu ? 'Познакомьтесь с Центром попугаев в Тарту.' : isEn ? 'Meet Parrot Centre in Tartu: Estonia\'s first parrot centre since 2015.' : 'Tutvuge Papagoi Keskusega Tartus: Eesti esimene papagoidekeskus alates 2015.',
      images: ['/logo.png'],
    },
  }
}

export default async function MeistPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('MeistPage')
  const serviceT = await getTranslations('TeenusedPage')

  return (
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

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('storyTitle')}</h2>
            </div>
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite mb-6 first-letter:text-6xl first-letter:font-bold first-letter:text-papagoi-green first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                  {t('storyP1')}
                </p>
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite mb-6">
                  {t('storyP2')}
                </p>
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite mb-6">
                  {t('storyP3')}
                </p>
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite">
                  {t('storyP4')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
              <div className="flex items-center justify-center space-x-3">
                <Home className="w-8 h-8" />
                <h2 className="text-3xl md:text-4xl font-bold">{t('roomsTitle')}</h2>
              </div>
            </div>
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">{t('houseTitle')}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {t('houseDesc')}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Feather className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">{t('parrotRoomTitle')}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {t('parrotRoomDesc')}
                  </p>
                </div>
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
              <Link
                href="/teenused"
                className="papagoi-cta-outline inline-flex items-center justify-center"
              >
                {t('ctaServices')}
              </Link>
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
                  source="meist"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {serviceT('saleLinkText')}
                </PetsVillaLink>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
