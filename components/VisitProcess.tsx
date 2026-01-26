
'use client'

import { Clock, Camera, Heart, Sparkles, Users, Gift } from 'lucide-react'

const visitSteps = [
  {
    icon: Users,
    title: 'Tervitamine ja tutvustus',
    description: 'Tutvustame end ja räägime külastuse käigust',
    details: 'Saate ülevaate meie keskusest ja külastuse reeglitest',
    color: 'bg-blue-500'
  },
  {
    icon: Sparkles,
    title: 'Papagoidega tutvumine',
    description: 'Räägime papagoidest, nende iseloomust ja toitumisest',
    details: 'Õpite tundma erinevaid liike ja nende käitumist',
    color: 'bg-green-500'
  },
  {
    icon: Gift,
    title: 'Pähklite andmine',
    description: 'Saate käega anda pähkleid meie papagoidele',
    details: 'Kogemus otsesest kontaktist lindudega',
    color: 'bg-yellow-500'
  },
  {
    icon: Camera,
    title: 'Fotosessioon Araga',
    description: 'Teeme fotod - paneme Ara teile käe peale istuma!',
    details: 'Unustamatuid pilte suure Ara macao papagoiga',
    color: 'bg-red-500'
  },
  {
    icon: Heart,
    title: 'Lisaks (soovi korral)',
    description: 'Vastame küsimustele ja räägime papagoide hooldusest',
    details: 'Külastus on paindlik – keskendume papagoidele ja teie huvidele',
    color: 'bg-purple-500'
  },
  {
    icon: Clock,
    title: 'Nõuanded ja küsimused',
    description: 'Õpime, kuidas papagoie lemmikloomana kasvatada',
    details: 'Vastame kõikidele küsimustele ja jagame kogemusi',
    color: 'bg-indigo-500'
  }
]

export default function VisitProcess() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Külastuse käik
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Iga külastus on ainulaadne kogemus! Vaata, mida huvitavat teid ootab meie papagoidega.
          </p>
          
          {/* Panoramic Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8">
            <img 
              src="https://cdn.abacus.ai/images/0f9d7ce0-d271-49fa-ba78-0220eb17d36f.png" 
              alt="Papagoi keskuse siseruum panoraampilt" 
              className="w-full h-64 md:h-80 lg:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-lg font-semibold">Meie hubane ja turvaline ruum</p>
              <p className="text-sm opacity-90">Kus toimuvad kõik külastused</p>
            </div>
          </div>
          
          {/* Room Description */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-3">🏡 Puuridevaba elu meie keskuses</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Papagoid elavad puuridevabat elu, neile on kasutada <strong className="text-green-600">suur tuba (50m²)</strong>. 
                  Piki seinu on palju oksi kus saavad papagoid istuda. Samas toas elavad ka <strong className="text-blue-600">40 tõumerisiga</strong> ning 
                  toome ka <strong className="text-purple-600">küüliku</strong>. 
                  <span className="text-orange-600 font-semibold"> Linde ja merisigu saab toita oma käest.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visit Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {visitSteps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`${step.color} p-6 text-white relative`}>
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="w-8 h-8" />
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-lg opacity-90">{step.description}</p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">{step.details}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                💡 Oluline teada
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Külastuse kestvus:</strong> 45-60 minutit</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Grupid:</strong> kokkuleppel (min 3 inimest)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Vanus:</strong> Sobib kõigile vanuseastmetele</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Tavakülastus:</strong> Minimaalselt 3 inimest</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Fotod:</strong> Võtke kaasa telefonid või fotokad!</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Turvaline:</strong> Kõik loomad on harjunud inimestega</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                🌟 Meie eripära
              </h4>
              <div className="space-y-3">
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="font-semibold text-gray-800">Ara käe peale istutamine</p>
                  <p className="text-sm text-gray-600">Ainulaadne kogemus suure papagoiga!</p>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="font-semibold text-gray-800">Individuaalne lähenemine</p>
                  <p className="text-sm text-gray-600">Igale külastajale pöörame isiklikku tähelepanu</p>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="font-semibold text-gray-800">Hariduslik väärtus</p>
                  <p className="text-sm text-gray-600">Õpite palju uut eksootiliste loomade kohta</p>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  )
}
