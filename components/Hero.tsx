'use client'

import Image from 'next/image'
import { Users, Star, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import IntentPaths from '@/components/IntentPaths'

export default function Hero() {
  const t = useTranslations('Hero')

  return (
    <section className="relative min-h-[115vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="https://cdn.abacus.ai/images/a53ad376-2734-41bc-b5f8-84dc65645611.png"
          alt={t('heroAraAlt')}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      </div>

      <div className="absolute top-20 left-10 w-20 h-20 bg-papagoi-green-300 rounded-full opacity-20 animate-bounce shadow-lg pointer-events-none"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-papagoi-blue-300 rounded-full opacity-20 animate-bounce delay-1000 shadow-lg pointer-events-none"></div>
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-papagoi-orange-300 rounded-full opacity-20 animate-bounce delay-2000 shadow-lg pointer-events-none"></div>
      <div className="absolute top-60 right-40 w-12 h-12 bg-papagoi-red-300 rounded-full opacity-20 animate-bounce delay-500 shadow-lg pointer-events-none"></div>
      <div className="absolute bottom-60 right-10 w-18 h-18 bg-papagoi-yellow-300 rounded-full opacity-20 animate-bounce delay-1500 shadow-lg pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
            <p className="text-xl md:text-2xl lg:text-3xl text-white mb-8 leading-relaxed drop-shadow-xl text-center">
              <span className="font-bold">{t('welcome')}</span> {t('intro')}
              <span className="font-bold papagoi-text-gradient">{t('introBold')}</span>
              {t('introRest')}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/30 hover:scale-105 hover:bg-white/30 transition-all duration-300">
                <Star className="w-5 h-5 text-papagoi-yellow" />
                <span className="font-medium text-white">{t('unique')}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/30 hover:scale-105 hover:bg-white/30 transition-all duration-300">
                <Users className="w-5 h-5 text-papagoi-green" />
                <span className="font-medium text-white">{t('forAll')}</span>
              </div>
            </div>
          </div>
        </div>

        <IntentPaths variant="hero" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-papagoi-beige-100 rounded-xl p-6 shadow-2xl border-l-4 border-papagoi-green hover:scale-105 transition-transform duration-300">
            <h3 className="font-bold text-lg text-papagoi-green mb-2">{t('forFamilies')}</h3>
            <p className="text-deep-anthracite-700">{t('forFamiliesDesc')}</p>
          </div>
          <div className="bg-papagoi-beige-100 rounded-xl p-6 shadow-2xl border-l-4 border-papagoi-blue hover:scale-105 transition-transform duration-300">
            <h3 className="font-bold text-lg text-papagoi-blue mb-2">{t('forSchools')}</h3>
            <p className="text-deep-anthracite-700">{t('forSchoolsDesc')}</p>
          </div>
          <div className="bg-papagoi-beige-100 rounded-xl p-6 shadow-2xl border-l-4 border-papagoi-orange hover:scale-105 transition-transform duration-300">
            <h3 className="font-bold text-lg text-papagoi-orange mb-2">{t('forBusiness')}</h3>
            <p className="text-deep-anthracite-700">{t('forBusinessDesc')}</p>
          </div>
        </div>

        <div className="mt-12 bg-white/15 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30 max-w-3xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-xl">{t('visitTitle')}</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">{t('hours')}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">⏱️</span>
                <span className="text-white font-semibold">{t('duration')}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">💰</span>
                <span className="text-white font-semibold">{t('price')}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">👥</span>
                <span className="text-white font-semibold">{t('groupSize')}</span>
              </div>
            </div>
            <div className="bg-amber-800/30 backdrop-blur-sm border border-amber-700/50 rounded-2xl p-4">
              <p className="text-white font-medium drop-shadow-xl">{t('bookingNote')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
