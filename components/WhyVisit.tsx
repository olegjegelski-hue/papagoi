import { Check } from 'lucide-react'

export default function WhyVisit() {
  const reasons = [
    'Eesti esimene papagoidekeskus - üle 50 papagoi',
    'Lapsesõbralik tegevus Tartus ja perepuhkus Tartus',
    'Ekskursioon papagoidega koolidele ja gruppidele',
    'Kuulete põnevaid lugusid ja saate teada papagoidest',
    'Papagoidega fotod Tartus (soovi korral ka Ara käe peale!)',
    'Personaalne tähelepanu ja turvaline keskkond',
    'Võimalusel saate papagoisid toita oma käest'
  ]

  return (
    <section className="py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
              Miks külastada <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">Papagoi Keskust Tartus?</span>
            </h2>
            
            <div className="space-y-4">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 hover:bg-white/80 transition-all duration-300">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - African Grey Image */}
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
              <img 
                src="https://cdn.abacus.ai/images/6baf6a7b-99c8-468a-b03c-176e7a3f2380.png"
                alt="African Grey papagoi - üks meie kauneid elanikke"
                className="w-full h-auto rounded-2xl shadow-lg scale-x-[-1]"
              />
              <div className="mt-6 text-center">
                <p className="text-gray-700 font-medium text-lg">
                  Tutvuge meie sõbralike papagoidega
                </p>
                <p className="text-gray-600 mt-2">
                  Iga papagoi on unikaalne isiksus oma loo ja iseloomuga
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}