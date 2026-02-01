import Hero from '@/components/Hero'
import WhyVisit from '@/components/WhyVisit'
import BookingCTA from '@/components/BookingCTA'
import Statistics from '@/components/Statistics'
import TestimonialsSection from '@/components/testimonials-section'
import type { Metadata } from 'next'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata: Metadata = {
  title: 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus alates 2015',
  description: 'Külasta Eesti esimest papagoidekeskust Tartus! Üle 50 papagoi, giidiga ekskursioonid, fotod Araga. Sobib peredele, koolidele ja ettevõtetele. Broneeri külastus!',
  keywords: 'Papagoi Keskus Tartus, papagoidekeskus, papagoidekeskus Tartus, papagoid Tartus, papagoid Eestis, külastus broneerimisega, papagoid sünnipäevale, linnuhotell, papagoide külastus Tartus, laste tegevused Tartu, perepuhkus Tartu, ekskursioon papagoidega, kus saab papagoid näha Eestis, papagoidega fotod Tartu, lapsesõbralik tegevus Tartu, kooli ekskursioon Tartu',
  alternates: {
    canonical: `${getSiteUrl()}/`,
  },
  openGraph: {
    title: 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus',
    description: 'Külasta Papagoi Keskust Tartus! Üle 50 papagoi, külastus broneerimisega, sünnipäevad, grupikülastused.',
    type: 'website',
    locale: 'et_EE',
    url: `${getSiteUrl()}/`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus',
    description: 'Külasta Papagoi Keskust Tartus! Üle 50 papagoi, külastus broneerimisega, sünnipäevad, grupikülastused.',
    images: ['/logo.png'],
  },
}

export default async function Home() {
  return (
    <>
      <Hero />
      <WhyVisit />
      <Statistics />
      <TestimonialsSection />
      <BookingCTA />
    </>
  )
}
