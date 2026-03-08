import Hero from '@/components/Hero'
import WhyVisit from '@/components/WhyVisit'
import GiftCardCTA from '@/components/GiftCardCTA'
import BookingCTA from '@/components/BookingCTA'
import Statistics from '@/components/Statistics'
import TestimonialsSection from '@/components/testimonials-section'
import SectionDivider from '@/components/SectionDivider'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

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
    alternates: { canonical: `${base}/${locale}` },
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

  return (
    <>
      <Hero />
      <SectionDivider variant="wave" />
      <WhyVisit />
      <SectionDivider />
      <GiftCardCTA />
      <SectionDivider variant="wave" />
      <Statistics />
      <SectionDivider />
      <TestimonialsSection />
      <SectionDivider variant="wave" />
      <BookingCTA />
    </>
  )
}
