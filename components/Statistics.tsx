
'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView) {
      let startTime: number
      let animationId: number

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          animationId = requestAnimationFrame(animate)
        }
      }

      animationId = requestAnimationFrame(animate)
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    }
  }, [inView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function Statistics() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Meie saavutused arvudes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Üle 11 aasta kogemust papagoidega töötamisel ja tuhandetest rõõmsatest külastustest
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Papagoid */}
          <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
              <CountUp end={50} />+
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">
              Papagoid
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              meie peres
            </div>
          </div>

          {/* Puurivabalt */}
          <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
              <CountUp end={40} />
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">
              Puurivabalt
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              vabalt lendavad
            </div>
          </div>

          {/* Kogemus */}
          <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
              <CountUp end={11} />
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">
              Aastat
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              kogemust
            </div>
          </div>

          {/* Facebook järgijad */}
          <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2 group-hover:scale-110 transition-transform duration-300">
              <CountUp end={5600} />
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">
              Järgijat
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              Facebookis
            </div>
          </div>
        </div>

        {/* Täiendav info */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-8 py-4 rounded-full border border-white/30">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span>E-P 12-18</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              <span>Ainulaadne kogemus</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
