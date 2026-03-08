
import Link from 'next/link'
import { Calendar } from 'lucide-react'

export default function BookingCTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-papagoi-green-50 to-papagoi-blue-50">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-anthracite-800 mb-6">
            Valmis meie papagoidega tutvuma?
          </h2>
          <p className="text-lg text-deep-anthracite-600 mb-8 max-w-2xl mx-auto">
            Broneerige oma külastus juba täna ja kogege ainulaadset seiklust
            koos üle 50 erineva papagoiga!
          </p>
          
          {/* Call to Action Button - same style as Hero */}
          <div className="flex justify-center items-center">
            <Link 
              href="/broneeri"
              className="papagoi-cta text-white shadow-2xl"
            >
              <Calendar className="w-5 h-5" />
              <span>Broneeri külastus</span>
            </Link>
          </div>
          
          {/* Additional info */}
          <div className="mt-8 text-sm text-deep-anthracite-500">
            <p>📞 Helistage meile: +372 512 7938 | ✉️ Kirjutage: keskus@papagoi.ee</p>
          </div>
        </div>
      </div>
    </section>
  )
}
