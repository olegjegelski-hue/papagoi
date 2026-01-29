
import StaticBookingInfo from '@/components/StaticBookingInfo'
import { Calendar, Users, Clock, Euro, Phone, AlertCircle } from 'lucide-react'

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
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-papagoi-blue/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">Otse kontakt</h3>
              <div className="space-y-3">
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-blue">Telefon:</strong>{' '}
                  <a href="tel:+3725127938" className="hover:underline">
                    +372 512 7938
                  </a>
                </p>
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-green">E-post:</strong> keskus@papagoi.ee
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-papagoi-green/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-6">Külastuse info</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-papagoi-green" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Broneeringu päring</p>
                    <p className="text-warm-gray-600 text-sm">Vastus 24 tunni jooksul</p>
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
                    <p className="font-medium text-deep-anthracite">Grupi suurus (min 3)</p>
                    <p className="text-warm-gray-600 text-sm">
                      kuni 20 inimest
                      <br />
                      lapsed kuni 30 inimest
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Euro className="w-5 h-5 text-papagoi-orange" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Hind</p>
                    <p className="text-warm-gray-600 text-sm">10€ inimene</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-papagoi-yellow-600" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Tühistamine</p>
                    <p className="text-warm-gray-600 text-sm">24h ette</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Include */}
            <div className="bg-warm-gray-50 rounded-xl p-6 border border-papagoi-blue/20">
              <h4 className="text-lg font-semibold text-deep-anthracite mb-4">Broneerides palun lisage:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-papagoi-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Grupi suurus ja koosseis</p>
                    <p className="text-warm-gray-600 text-sm">Täiskasvanute ja laste arv, vanused</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-papagoi-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Soovitud kuupäev ja kellaaeg</p>
                    <p className="text-warm-gray-600 text-sm">Mitu varianti aitab leida sobiva aja</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-papagoi-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Kontaktandmed</p>
                    <p className="text-warm-gray-600 text-sm">Telefon ja e-post ühenduse pidamiseks</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-papagoi-orange mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-deep-anthracite">Erivajadused</p>
                    <p className="text-warm-gray-600 text-sm">Allergia, liikumisraskused, vms</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
