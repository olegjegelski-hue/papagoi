
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, Heart, Star, Clock } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Beautiful Ara Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://cdn.abacus.ai/images/a53ad376-2734-41bc-b5f8-84dc65645611.png"
          alt="Meie kaunis Ara - tõeline Papagoi Keskuse elanik"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay for better text readability with brand colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      </div>
      
      {/* Floating Elements - brändi värvides, reduced opacity for subtle effect */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-papagoi-green-300 rounded-full opacity-20 animate-bounce shadow-lg"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-papagoi-blue-300 rounded-full opacity-20 animate-bounce delay-1000 shadow-lg"></div>
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-papagoi-orange-300 rounded-full opacity-20 animate-bounce delay-2000 shadow-lg"></div>
      <div className="absolute top-60 right-40 w-12 h-12 bg-papagoi-red-300 rounded-full opacity-20 animate-bounce delay-500 shadow-lg"></div>
      <div className="absolute bottom-60 right-10 w-18 h-18 bg-papagoi-yellow-300 rounded-full opacity-20 animate-bounce delay-1500 shadow-lg"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        {/* Main welcome message with transparent effect */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
            <p className="text-xl md:text-2xl lg:text-3xl text-white mb-8 leading-relaxed drop-shadow-xl text-center">
              <span className="font-bold">Tere tulemast!</span> Papagoi Keskuses elab
              <span className="font-bold papagoi-text-gradient"> üle 50 papagoi</span>.
              Tule külla, kuula põnevaid lugusid papagoidest, tee nendega pilti ja soovi korral toida neid oma käest.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/30 hover:scale-105 hover:bg-white/30 transition-all duration-300">
                <Star className="w-5 h-5 text-papagoi-yellow" />
                <span className="font-medium text-white">Ainulaadne kogemus</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/30 hover:scale-105 hover:bg-white/30 transition-all duration-300">
                <Users className="w-5 h-5 text-papagoi-green" />
                <span className="font-medium text-white">Sobib kõigile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Button - centered */}
        <div className="flex justify-center items-center mb-12">
          <Link 
            href="/broneeri"
            className="papagoi-button-primary text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
          >
            <Calendar className="w-5 h-5" />
            <span>Broneeri külastus</span>
          </Link>
        </div>

        {/* Key Information Cards - enhanced for better visibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-l-4 border-papagoi-green hover:scale-105 transition-transform duration-300">
            <h3 className="font-bold text-lg text-papagoi-green mb-2">Peredele</h3>
            <p className="text-deep-anthracite-700">Täiuslik pereväljak - põnevust kõigile vanuseastmetele</p>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-l-4 border-papagoi-blue hover:scale-105 transition-transform duration-300">
            <h3 className="font-bold text-lg text-papagoi-blue mb-2">Koolidele & Lasteaedadele</h3>
            <p className="text-deep-anthracite-700">Hariduslik kogemus, mis jääb meelde elupäevaks</p>
          </div>
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-l-4 border-papagoi-orange hover:scale-105 transition-transform duration-300">
            <h3 className="font-bold text-lg text-papagoi-orange mb-2">Ettevõtetele</h3>
            <p className="text-deep-anthracite-700">Ainulaadne meeskonnaüritus või klientide meelelahutus</p>
          </div>
        </div>

        {/* Quick Info Card - Essential Information */}
        <div className="mt-12 bg-white/15 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30 max-w-3xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-xl">
              🦜 KÜLASTUS PAPAGOI KESKUSES
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">E-P 12-18</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">⏱️</span>
                <span className="text-white font-semibold">ca 1 tund</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">💰</span>
                <span className="text-white font-semibold">10€ inimene</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">👥</span>
                <span className="text-white font-semibold">kuni 20 inimest</span>
              </div>
            </div>
            
            <div className="bg-papagoi-orange/20 backdrop-blur-sm border border-papagoi-orange/30 rounded-lg p-4 mb-4">
              <p className="text-white font-medium drop-shadow-xl">
                ⚠️ Külastused ainult eelneval kokkuleppel. Broneerige aeg ette!
              </p>
            </div>
            
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-3">
              <p className="text-white font-medium drop-shadow-xl text-sm">
                ℹ️ Tavakülastus on minimaalselt 3 inimese jaoks
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
