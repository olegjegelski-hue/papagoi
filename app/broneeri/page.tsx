
import StaticBookingInfo from '@/components/StaticBookingInfo'
import { Calendar, Users, Clock, Euro } from 'lucide-react'

export const metadata = {
  title: 'Broneeri külastus - Papagoi Keskus',
  description: 'Broneerige külastus Eesti ainulaadsesse papagoidekeskusesse. Lihtne broneerimisprotsess ja kiire vastus.',
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-warm-gray-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Broneeri külastus</span>
          </h1>
          <p className="text-xl text-deep-anthracite-700 max-w-3xl mx-auto">
            Täitke vorm ja me võtame teiega ühendust 24 tunni jooksul külastuse aja kokkuleppimiseks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Booking Info */}
          <div className="lg:col-span-2">
            <StaticBookingInfo />
          </div>

          {/* Information Sidebar */}
          <div className="space-y-8">
            
            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-papagoi-green/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-6">Külastuse info</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-papagoi-green" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Broneeringu kinnitus</p>
                    <p className="text-warm-gray-600 text-sm">24 tunni jooksul</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-papagoi-blue" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Külastuse kestus</p>
                    <p className="text-warm-gray-600 text-sm">ca 1 tund</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-papagoi-red" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Grupi suurus</p>
                    <p className="text-warm-gray-600 text-sm">kuni 20 inimest (min 3)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Euro className="w-5 h-5 text-papagoi-orange" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Hinnad alates</p>
                    <p className="text-warm-gray-600 text-sm">10€ inimene</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium">
                  ℹ️ Tavakülastus on minimaalselt 3 inimese jaoks
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-papagoi-green-50 to-papagoi-blue-50 rounded-2xl p-6 border border-papagoi-green/20">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">Hinnakirjad</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-deep-anthracite-700">Külastus</span>
                  <span className="font-semibold text-papagoi-green">10€</span>
                </div>
                <div className="border-t border-papagoi-green/30 pt-2 text-sm text-deep-anthracite-700">
                  Gruppide ja erisoovide korral lepime aja ja külastuse detailid kokku.
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-papagoi-yellow-100 border-l-4 border-papagoi-yellow-500 rounded-r-lg p-4">
              <h4 className="font-semibold text-papagoi-yellow-800 mb-2">⚠️ Oluline!</h4>
              <ul className="text-papagoi-yellow-700 text-sm space-y-1">
                <li>• Külastused ainult eelneval kokkuleppel</li>
                <li>• Asukohta teatame broneerides</li>
                <li>• Tühistamine vähemalt 24h ette</li>
                <li>• Makse kohapeal või pangaülekandega</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-papagoi-blue/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">Otse kontakt</h3>
              <div className="space-y-3">
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-blue">Telefon:</strong> <a href="tel:+3725127938" className="hover:underline">+372 512 7938</a>
                </p>
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-green">E-post:</strong> keskus@papagoi.ee
                </p>
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-orange">Vastame:</strong> E-R 9:00-18:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
