import Hero from '@/components/Hero'
import WhyVisit from '@/components/WhyVisit'
import BookingCTA from '@/components/BookingCTA'
import Statistics from '@/components/Statistics'
import TestimonialsSection from '@/components/testimonials-section'

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
