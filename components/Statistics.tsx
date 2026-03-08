'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useTranslations } from 'next-intl'

const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(end)
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  useEffect(() => {
    if (inView) {
      setCount(0)
      let startTime: number
      let animationId: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) animationId = requestAnimationFrame(animate)
      }
      animationId = requestAnimationFrame(animate)
      return () => { if (animationId) cancelAnimationFrame(animationId) }
    }
  }, [inView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function Statistics() {
  const t = useTranslations('Statistics')

  return (
    <section className="pt-4 pb-16 bg-gradient-to-br from-papagoi-green-50 to-papagoi-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-papagoi-beige-100 shadow-lg border border-papagoi-beige-200 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-papagoi-green mb-2 group-hover:scale-110 transition-transform duration-300">
              <noscript>50</noscript>
              <CountUp end={50} />+
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">{t('parrots')}</div>
            <div className="text-xs md:text-sm text-gray-500">{t('parrotsSub')}</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-papagoi-beige-100 shadow-lg border border-papagoi-beige-200 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-papagoi-blue mb-2 group-hover:scale-110 transition-transform duration-300">
              <noscript>40</noscript>
              <CountUp end={40} />
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">{t('freeFlight')}</div>
            <div className="text-xs md:text-sm text-gray-500">{t('freeFlightSub')}</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-papagoi-beige-100 shadow-lg border border-papagoi-beige-200 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-papagoi-orange mb-2 group-hover:scale-110 transition-transform duration-300">
              <noscript>11</noscript>
              <CountUp end={11} />
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">{t('years')}</div>
            <div className="text-xs md:text-sm text-gray-500">{t('yearsSub')}</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-papagoi-beige-100 shadow-lg border border-papagoi-beige-200 hover:shadow-xl transition-all duration-300 group">
            <div className="text-4xl md:text-5xl font-bold text-papagoi-red mb-2 group-hover:scale-110 transition-transform duration-300">
              <noscript>5600</noscript>
              <CountUp end={5600} />
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-700 mb-1">{t('followers')}</div>
            <div className="text-xs md:text-sm text-gray-500">{t('followersSub')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
