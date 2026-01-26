
import Hero from '@/components/Hero'
import WhyVisit from '@/components/WhyVisit'
import Statistics from '@/components/Statistics'
import BookingCTA from '@/components/BookingCTA'
import Link from 'next/link'
import { Clock, Euro, PartyPopper, Feather, Users, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Hero />
      <WhyVisit />
      <Statistics />
      
      {/* Kiire ülevaade teenustest */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              <span className="papagoi-text-gradient">Meie teenused</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Valige teile sobiv külastusviis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Külastus */}
            <Link href="/teenused" className="group">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Külastus keskuses</h3>
                <div className="flex items-center space-x-4 text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">1h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Euro className="w-4 h-4" />
                    <span className="text-sm">10€</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">Juhendatud programm papagoidega</p>
                <p className="text-gray-500 text-xs">ℹ️ Min 3 inimest</p>
              </div>
            </Link>

            {/* Sünnipäev */}
            <Link href="/teenused" className="group">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 hover:shadow-xl h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                    <PartyPopper className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Sünnipäev keskuses</h3>
                <div className="flex items-center space-x-4 text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">2.5h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Euro className="w-4 h-4" />
                    <span className="text-sm">350€</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Meeldejääv pidu papagoidega</p>
              </div>
            </Link>

            {/* Üritus väljas */}
            <Link href="/teenused" className="group">
              <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-6 border-2 border-teal-200 hover:border-teal-400 transition-all duration-300 hover:shadow-xl h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                    <Feather className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Üritus väljas</h3>
                <div className="flex items-center space-x-4 text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">1h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Euro className="w-4 h-4" />
                    <span className="text-sm">250€</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Papagoid tulevad teie juurde</p>
              </div>
            </Link>
          </div>

          <div className="text-center">
            <Link 
              href="/teenused"
              className="inline-flex items-center space-x-2 text-papagoi-green font-semibold hover:text-papagoi-blue transition-colors"
            >
              <span>Vaata kõiki teenuseid</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
