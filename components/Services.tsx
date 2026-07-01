
import { Users, GraduationCap, Building, Heart, Clock, Euro, PartyPopper, Utensils, Feather, ExternalLink } from 'lucide-react'
import PetsVillaLink from '@/components/PetsVillaLink'

const services = [
  {
    icon: Users,
    title: 'Pered',
    description: 'Ideaalne pereväljak kõigile vanuseastmetele - lapsed saavad papagoidega tutvuda ja mängida',
    color: 'bg-blue-500'
  },
  {
    icon: GraduationCap,
    title: 'Koolid ja lasteaiad',
    description: 'Hariduslik külastus õpilastele - õpivad loomadest ja nende käitumisest',
    color: 'bg-green-500'
  },
  {
    icon: Building,
    title: 'Ettevõtted',
    description: 'Ainulaadne meeskonnaüritus või klientide meelelahutus',
    color: 'bg-purple-500'
  },
  {
    icon: Heart,
    title: 'Erivajadused',
    description: 'Kohandatud teenused erivajadustega inimestele - rahudlikum tempo ja individuaalne lähenemine',
    color: 'bg-red-500'
  }
]



export default function Services() {
  return (
    <section id="teenused" className="py-20 bg-papagoi-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Meie teenused</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Valige teile sobiv külastusviis ja nautige aega meie papagoidega
          </p>
        </div>

        {/* Main Service */}
        <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">🦜 Külastus Papagoi Keskuses</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6" />
                <span className="text-xl font-semibold">45-60 minutit</span>
              </div>
              <div className="flex items-center space-x-2">
                <Euro className="w-6 h-6" />
                <span className="text-xl font-semibold">10€ inimene</span>
              </div>
            </div>
            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              <p className="text-white text-sm font-medium">
                ℹ️ Tavakülastus on minimaalselt 3 inimese jaoks
              </p>
            </div>
          </div>
          
          {/* Target Groups */}
          <div className="p-8">
            <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sobib kõigile vanusgruppidele ja sihtrühmadele</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <div key={index} className="text-center p-6 bg-papagoi-beige-100 rounded-xl hover:bg-papagoi-beige-200 transition-colors">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${service.color} text-white mb-4`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h5 className="font-bold text-gray-800 mb-2">{service.title}</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Event Services */}
        <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8 text-white text-center">
            <h3 className="text-3xl md:text-4xl font-bold">🎉 Üritus Papagoi Keskuses</h3>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Õhtusöök */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500 text-white mb-4">
                    <Utensils className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">Õhtusöök papagoidega</h4>
                  <p className="text-purple-600 font-semibold text-lg">Eksklusiivne õhtuelamus</p>
                </div>
                
                <div className="space-y-4 text-gray-700">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <p className="font-medium mb-2">📅 Privaatselt pärast sulgemisaega</p>
                    <p className="font-medium mb-2">👥 5-8 külalist</p>
                    <p className="font-medium mb-2">⏱️ 30-45 minutit</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <h5 className="font-semibold mb-2 text-purple-700">Elamus sisaldab:</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• Hoitaja professionaalne juhendamine</li>
                      <li>• Papagoid käest toitmine värskete puuviljadega</li>
                      <li>• Privaatne ja rahulik keskkond</li>
                      <li>• Ainulaadne lähedus meie lindudega</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sünnipäev */}
              <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-8 border border-pink-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-500 text-white mb-4">
                    <PartyPopper className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">Sünnipäev papagoi keskuses</h4>
                  <p className="text-pink-600 font-semibold text-lg">2,5-tunnine meeldejääv pidu</p>
                </div>
                
                <div className="space-y-4 text-gray-700">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <p className="font-medium mb-2">🎂 Mõeldud lapsele, kes armastab linde</p>
                    <p className="font-medium mb-2">🪑 Sünnipäevalaua kasutamine (12 kohta)</p>
                    <p className="font-medium">⏱️ 2,5 tundi programmi ja pidamist</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                    <h5 className="font-semibold mb-2 text-pink-700">Peo ülesehitus:</h5>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>2.5 tunnine programm:</strong> tutvustame papagoisid, merisigu, küülikuid ning kameeleone</li>
                      <li>• <strong>Õppimine:</strong> põnevad faktid eri liikide ja lemmikloomade kohta</li>
                      <li>• <strong>Interaktsioon:</strong> pildistamine, paitamine, küsimused</li>
                      <li>• <strong>Üllatusprogramm &quot;Laps mullis&quot;:</strong> lapsed pannakse suure seebimulli sisse ja saab teha vahvaid pilte</li>
                      <li>• <strong>Sünnipäevalaud:</strong> oma tort ja joogid kaasa võtta</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Info for Events */}
            <div className="bg-papagoi-beige-100 rounded-xl p-6">
              <h5 className="font-bold text-gray-800 mb-3">📞 Ürituste broneerimiseks võta meiega ühendust:</h5>
              <p className="text-gray-700">Küsi hinnainfot ja vaba aega!</p>
            </div>
          </div>
        </div>

        {/* Mobile Event Service */}
        <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-8 text-white text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">🪶 Üritus papagoidega väljas</h3>
            <p className="text-xl opacity-90">Papagoid tulevad teie juurde</p>
          </div>
          
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 border border-green-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 text-white mb-4">
                    <Feather className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">Sünnipäev, perega koosistumine, firmapidu vm sündmus</h4>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Üllatage oma peolisi unikaalsete külalistega - elevus ja vahvad emotsioonid garanteeritud!
                  </p>
                </div>
                
                <div className="space-y-6 text-gray-700">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6">
                    <h5 className="font-semibold mb-4 text-green-700 text-lg">🎭 Programm sisaldab:</h5>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold">•</span>
                        <span><strong>Peremees tutvustab</strong> papagoi maailma ja räägib palju põnevat nendest imelistest sulelistest</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold">•</span>
                        <span><strong>Kaasas on kaks-kolm papagoid:</strong> põhitegelased aara Mac ja aafrika hall Millie 🥰</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold">•</span>
                        <span><strong>Papagoide interaktiivset suhtlust ning trikkide näitamist</strong></span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold">•</span>
                        <span><strong>Kui seltskonnas on lapsi,</strong> võtame kindlasti kaasa ka mõned kääbusküülikud ja merisead, kes ootavad paitamist</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="bg-papagoi-beige-100 rounded-xl p-6">
              <h5 className="font-bold text-gray-800 mb-3">📞 Broneerimiseks võta meiega ühendust:</h5>
              <p className="text-gray-700">Küsi hinnainfot ja vaba aega!</p>
            </div>
          </div>
        </div>

        {/* PetsVilla link (müük/kasvatus eraldi lehel) */}
        <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">Papagoide ja merisigade müük</h3>
            <p className="text-lg opacity-90">
              Müügikuulutused ja kasvatuse info on eraldi lehel (PetsVilla)
            </p>
          </div>
          
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500 text-white mb-4">
                  <Heart className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">PetsVilla.ee</h4>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Kui otsite papagoide või merisigade müügipakkumisi ning kasvatuse infot, vaadake meie teist kodulehte.
                  Papagoi Keskus on eelkõige koht, kuhu tulla külla ja kogeda papagoisid kohapeal.
                </p>
                <PetsVillaLink
                  source="teenused-komponent"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Ava PetsVilla.ee
                </PetsVillaLink>
                <p className="text-sm text-gray-500 mt-4">
                  Avaneb uues aknas
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/broneeri"
                className="papagoi-cta-white inline-flex items-center justify-center px-8 py-3"
              >
                Broneeri külastus
              </a>
              <a
                href="/papagoid"
                className="papagoi-cta-outline inline-flex items-center justify-center px-8 py-3"
              >
                Vaata meie papagoie
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
