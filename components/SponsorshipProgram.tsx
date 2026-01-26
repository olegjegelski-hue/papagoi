
'use client'
import { Heart, Gift, Calendar, Camera } from 'lucide-react'

const benefits = [
  {
    icon: Heart,
    title: 'Personaalne side',
    description: 'Loodke eriline emotsionaalne side oma valitud papagaiga'
  },
  {
    icon: Calendar,
    title: 'Kvartaalsed kohtumised',
    description: 'Privaatsed 30-minutilised kohtumised oma ristilapesega'
  },
  {
    icon: Camera,
    title: 'Regulaarsed uudised',
    description: 'Saadame fotosid ja videoid teie ristilapses igapäevaelus'
  },
  {
    icon: Gift,
    title: 'Eriline tunnustus',
    description: 'Teie nimi papagoi elukoha juures ja tänutunnus meie sotsiaalmeedias'
  }
]

export default function SponsorshipProgram() {

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-6">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ole papagoi <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">ristiisa</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Toeta meie keskuse hoolealuseid ja saa osa nende igapäevaelust. Adopteeri sümboolselt oma 
            lemmikpapagoi ja tule temaga kord kvartalis privaatsele kohtumisele.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl mb-4">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>



        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Huvitatud ristivanema programmist?
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Võtke meiega ühendust ja arutame koos sobivaimat papagoid teie jaoks. 
              Iga toetus, olenemata suurusest, aitab meie suliliste sõprade heaolu tagada.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/ristiisa-programm"
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Tutvu programmiga
              </a>
              <a
                href="/papagoid"
                className="text-green-600 border-2 border-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Vali oma papagoi
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
