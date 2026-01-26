
'use client'
import { Phone, Mail, Calendar, Users, Clock, Euro, AlertCircle } from 'lucide-react'

export default function StaticBookingInfo() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-papagoi-green/10">
      <h2 className="text-2xl font-bold text-deep-anthracite mb-8">Broneerimine</h2>
      
      {/* Important Notice */}
      <div className="bg-papagoi-yellow-100 border-l-4 border-papagoi-yellow-500 rounded-r-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <AlertCircle className="w-6 h-6 text-papagoi-yellow-600" />
          <h3 className="text-lg font-semibold text-papagoi-yellow-800">⚠️ OLULINE!</h3>
        </div>
        <div className="text-papagoi-yellow-700 space-y-2">
          <p><strong>Külastused toimuvad AINULT eelneval kokkuleppel!</strong></p>
          <p>Ilma broneeringuta ei saa meid külastada. Asukohta teatame broneeringu kinnitamisel.</p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="space-y-8">
        
        <div>
          <h3 className="text-xl font-semibold text-deep-anthracite mb-6">Võtke meiega ühendust:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Phone Booking */}
            <div className="bg-gradient-to-r from-papagoi-green-100 to-papagoi-green-50 rounded-xl p-6 border border-papagoi-green-200 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="w-8 h-8 text-papagoi-green" />
                <h4 className="text-lg font-semibold text-deep-anthracite">Telefonil</h4>
              </div>
              <div className="space-y-2">
                <a href="tel:+3725127938" className="text-2xl font-bold text-deep-anthracite hover:underline">+372 512 7938</a>
                <p className="text-warm-gray-600">E-P 12-18</p>
                <p className="text-sm text-warm-gray-500">Kõige kiirem viis broneerimiseks</p>
              </div>
            </div>

            {/* Email Booking */}
            <div className="bg-gradient-to-r from-papagoi-blue-100 to-papagoi-blue-50 rounded-xl p-6 border border-papagoi-blue-200 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="w-8 h-8 text-papagoi-blue" />
                <h4 className="text-lg font-semibold text-deep-anthracite">E-postil</h4>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-deep-anthracite">keskus@papagoi.ee</p>
                <p className="text-warm-gray-600">Vastame 24h jooksul</p>
                <p className="text-sm text-warm-gray-500">Saatke oma kontaktandmed ja soovitud aeg</p>
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

        {/* Process */}
        <div>
          <h4 className="text-lg font-semibold text-deep-anthracite mb-4">Kuidas broneering toimib:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-papagoi-green-50 rounded-lg border border-papagoi-green/20">
              <div className="w-8 h-8 bg-papagoi-green text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">1</div>
              <p className="text-sm font-medium text-deep-anthracite">Võtate ühendust</p>
            </div>
            <div className="text-center p-4 bg-papagoi-blue-50 rounded-lg border border-papagoi-blue/20">
              <div className="w-8 h-8 bg-papagoi-blue text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">2</div>
              <p className="text-sm font-medium text-deep-anthracite">Kinnitame aja</p>
            </div>
            <div className="text-center p-4 bg-papagoi-orange-50 rounded-lg border border-papagoi-orange/20">
              <div className="w-8 h-8 bg-papagoi-orange text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">3</div>
              <p className="text-sm font-medium text-deep-anthracite">Saate asukoha</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-papagoi-green-100 to-papagoi-green-50 rounded-lg border border-papagoi-green/20">
            <Clock className="w-6 h-6 text-papagoi-green mx-auto mb-2" />
            <p className="text-sm font-medium text-deep-anthracite">ca 1 tund</p>
            <p className="text-xs text-warm-gray-600">Kestus</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-papagoi-blue-100 to-papagoi-blue-50 rounded-lg border border-papagoi-blue/20">
            <Users className="w-6 h-6 text-papagoi-blue mx-auto mb-2" />
            <p className="text-sm font-medium text-deep-anthracite">kuni 20</p>
            <p className="text-xs text-warm-gray-600">Inimest</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-papagoi-red-100 to-papagoi-red-50 rounded-lg border border-papagoi-red/20">
            <Euro className="w-6 h-6 text-papagoi-red mx-auto mb-2" />
            <p className="text-sm font-medium text-deep-anthracite">10€</p>
            <p className="text-xs text-warm-gray-600">Hind isik</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-papagoi-yellow-100 to-papagoi-yellow-50 rounded-lg border border-papagoi-yellow/20">
            <Calendar className="w-6 h-6 text-papagoi-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-deep-anthracite">24h</p>
            <p className="text-xs text-warm-gray-600">Vastus</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center parrot-brand-gradient rounded-xl p-8 text-white shadow-xl">
          <h3 className="text-xl font-bold mb-4">Valmis broneerima?</h3>
          <p className="mb-6 opacity-95">Helistage või saatke e-kiri juba täna!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+3725127938"
              className="bg-white text-papagoi-green px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
            >
              <Phone className="w-4 h-4" />
              <span>+372 512 7938</span>
            </a>
            <a
              href="mailto:keskus@papagoi.ee"
              className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-papagoi-blue transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
            >
              <Mail className="w-4 h-4" />
              <span>keskus@papagoi.ee</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
