import Hero from '@/components/Hero'
import ParrotShowcase from '@/components/ParrotShowcase'
import Services from '@/components/Services'
import WhyVisit from '@/components/WhyVisit'
import VisitProcess from '@/components/VisitProcess'
import BookingCTA from '@/components/BookingCTA'
import Statistics from '@/components/Statistics'
import SponsorshipProgram from '@/components/SponsorshipProgram'
import TestimonialsSection from '@/components/testimonials-section'

// Server-side funktsioon, mis toob andmed Notion'ist
async function getParrotsFromNotion() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/notion/parrots`, {
      cache: 'no-store', // Alati värske andmed
    })
    
    if (!response.ok) {
      throw new Error('Notion API viga')
    }
    
    const data = await response.json()
    return data.parrots || []
  } catch (error) {
    console.error('Viga Notion API päringul:', error)
    return []
  }
}

export default async function Home() {
  // Proovime võtta andmed Notion'ist
  const notionParrots = await getParrotsFromNotion()
  
  return (
    <>
      <Hero />
      <WhyVisit />
      <VisitProcess />
      <TestimonialsSection />
      <BookingCTA />
      <Statistics />
      <ParrotShowcase parrots={notionParrots} />
      <SponsorshipProgram />
      <Services />
    </>
  )
}
