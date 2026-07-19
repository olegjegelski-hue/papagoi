import Hero from '@/components/Hero'
import WhyVisit from '@/components/WhyVisit'
import GiftCardCTA from '@/components/GiftCardCTA'
import BookingCTA from '@/components/BookingCTA'
import Statistics from '@/components/Statistics'
import TestimonialsSection from '@/components/testimonials-section'
import SectionDivider from '@/components/SectionDivider'
import PetsVillaLink from '@/components/PetsVillaLink'
import { ExternalLink } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { getSiteUrl, pageAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu
    ? 'Центр попугаев в Тарту | Первый в Эстонии с 2015'
    : isEn
      ? 'Parrot Centre Tartu | Estonia\'s first parrot centre since 2015'
      : 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus alates 2015'
  const description = isRu
    ? 'Первый в Эстонии Центр попугаев в Тарту! Более 50 попугаев, экскурсии, подарочная карта, дни рождения и групповые визиты. Забронируйте визит или купите подарочную карту.'
    : isEn
      ? 'Visit Estonia\'s first parrot centre in Tartu! Over 50 parrots, guided tours, gift card, birthdays and group visits. Book a visit or buy a digital gift card.'
      : 'Külasta Eesti esimest papagoidekeskust Tartus! Üle 50 papagoi, giidiga ekskursioonid, kinkekaart, sünnipäevad ja grupikülastused. Broneeri külastus või kingi digitaalne kinkekaart.'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    alternates: pageAlternates(locale),
    openGraph: {
      title: isRu ? 'Центр попугаев в Тарту' : isEn ? 'Parrot Centre Tartu' : 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus',
      description: isRu ? 'Более 50 попугаев, бронирование визита или подарочная карта.' : isEn ? 'Over 50 parrots, book a visit or gift card.' : 'Üle 50 papagoi, külastus broneerimisega, kinkekaart, sünnipäevad ja grupikülastused. Broneeri või kingi kinkekaart.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: isRu ? 'Центр попугаев в Тарту' : isEn ? 'Parrot Centre Tartu' : 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus',
      description: isRu ? 'Более 50 попугаев, бронирование визита или подарочная карта.' : isEn ? 'Over 50 parrots, book a visit or gift card.' : 'Üle 50 papagoi, külastus broneerimisega, kinkekaart, sünnipäevad ja grupikülastused.',
      images: ['/logo.png'],
    },
  }
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('TeenusedPage')

  return (
    <>
      <Hero />
      <SectionDivider variant="wave" />
      <WhyVisit />
      <SectionDivider />
      <BookingCTA />
      <SectionDivider variant="wave" />
      <Statistics />
      <SectionDivider />
      <TestimonialsSection />
      <SectionDivider variant="wave" />
      <GiftCardCTA />
      <section className="bg-papagoi-beige-100 border border-papagoi-beige-200 rounded-2xl shadow-2xl overflow-hidden mx-4 sm:mx-6 lg:mx-8 mt-8 mb-16">
        <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{t('saleTitle')}</h2>
          <p className="text-lg opacity-90">{t('saleSubtitle')}</p>
        </div>
        <div className="p-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200 text-center">
            <p className="text-gray-700 leading-relaxed mb-6">{t('saleDesc')}</p>
            <PetsVillaLink
              source="avaleht"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {t('saleLinkText')}
            </PetsVillaLink>
          </div>
        </div>
      </section>
    </>
  )
}
