import Hero from '@/components/Hero'
import WhyVisit from '@/components/WhyVisit'
import BookingCTA from '@/components/BookingCTA'
import Statistics from '@/components/Statistics'
import TestimonialsSection from '@/components/testimonials-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus alates 2015',
  description: 'Külasta Papagoi Keskust Tartus! Üle 50 papagoi, külastus broneerimisega, sünnipäevad, grupikülastused. Broneeri külastus juba täna ja koge ainulaadset seiklust meie värvilise perekonnaga.',
  keywords: 'Papagoi Keskus Tartus, papagoidekeskus Tartus, külastus broneerimisega, papagoid sünnipäevale, linnuhotell, papagoide külastus Tartus, papagoid Tartus',
  openGraph: {
    title: 'Papagoi Keskus Tartus | Eesti esimene papagoidekeskus',
    description: 'Külasta Papagoi Keskust Tartus! Üle 50 papagoi, külastus broneerimisega, sünnipäevad, grupikülastused.',
    type: 'website',
    locale: 'et_EE',
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
