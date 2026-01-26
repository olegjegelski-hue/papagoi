
import Link from 'next/link'
import { Calendar, Phone, MapPin, ArrowRight } from 'lucide-react'

export default function CallToAction() {
  return (
    <section className="py-20 parrot-brand-gradient text-white overflow-hidden relative">
      {/* Background Pattern - brändi värvides */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-papagoi-yellow rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-white rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border border-papagoi-yellow rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Main Heading */}
        <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-xl">
          Alustame koos
          <span className="block text-papagoi-yellow drop-shadow-lg">unustamatut seiklust!</span>
        </h2>
        
        <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-3xl mx-auto drop-shadow-md">
          Eesti ainulaadne papagoidekeskus ootab teid. Broneerige külastus juba täna ja 
          tutvuge meie värviliste sõpradega!
        </p>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link
            href="/broneeri"
            className="bg-white text-deep-anthracite px-8 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-transparent hover:border-papagoi-yellow"
          >
            <Calendar className="w-6 h-6 text-papagoi-green" />
            <span>Broneeri külastus</span>
            <ArrowRight className="w-5 h-5 text-papagoi-orange" />
          </Link>
          
          <Link
            href="/kontakt"
            className="border-2 border-white text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-white hover:text-deep-anthracite transition-all duration-300 flex items-center justify-center space-x-2 hover:border-papagoi-yellow"
          >
            <Phone className="w-6 h-6" />
            <span>Küsi lisainfot</span>
          </Link>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-papagoi-yellow/30 hover:scale-105 transition-transform duration-300">
            <Calendar className="w-8 h-8 text-papagoi-yellow mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Kiire broneerimine</h3>
            <p className="opacity-90">Broneerige külastus 2 klõpsuga</p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-papagoi-yellow/30 hover:scale-105 transition-transform duration-300">
            <MapPin className="w-8 h-8 text-papagoi-yellow mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Privaatne asukoht</h3>
            <p className="opacity-90">Rahulik keskkond ainult teile</p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-papagoi-yellow/30 hover:scale-105 transition-transform duration-300">
            <Phone className="w-8 h-8 text-papagoi-yellow mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Personaalne teenindus</h3>
            <p className="opacity-90">Igale grupile pühendatud tähelepanu</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Kontakteerige meiega otse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold mb-3 text-lg">Külastuste broneerimine:</h4>
              <div className="space-y-2 opacity-90">
                <p>📞 Telefon: +372 XXX XXXX</p>
                <p>📧 Email: info@papagoi.ee</p>
                <p>⏰ Vastame: E-R 9:00-18:00</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-lg">Oluline teada:</h4>
              <div className="space-y-2 opacity-90">
                <p>• Külastused ainult eelneval kokkuleppel</p>
                <p>• Asukohta teatame broneerides</p>
                <p>• Minimaalne grupi suurus: 3 inimest</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="mt-12">
          <p className="text-xl md:text-2xl font-semibold text-papagoi-yellow drop-shadow-md">
            🦜 Aitäh, et vahendate meie armastust papagoidele! 🦜
          </p>
          <p className="text-lg opacity-90 mt-2 drop-shadow-sm">
            Ootame teid pikisilmi meie värvilisse perre!
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 bg-papagoi-yellow text-deep-anthracite rounded-lg p-4 max-w-2xl mx-auto shadow-xl border border-papagoi-yellow/20">
          <p className="font-semibold">
            ⚠️ Tähtis: Külastused ainult broneeringuga! Ilma eelneva kokkuleppeta ei saa meid külastada.
          </p>
        </div>
      </div>
    </section>
  )
}
