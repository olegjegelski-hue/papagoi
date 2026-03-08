'use client'

import { Link } from '@/i18n/navigation'
import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function BookingCTA() {
  const t = useTranslations('BookingCTA')

  return (
    <section className="py-16 bg-gradient-to-br from-papagoi-green-50 to-papagoi-blue-50">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-anthracite-800 mb-6">{t('title')}</h2>
          <p className="text-lg text-deep-anthracite-600 mb-8 max-w-2xl mx-auto">{t('subtitle')}</p>
          <div className="flex justify-center items-center">
            <Link href="/broneeri" className="papagoi-cta text-white shadow-2xl">
              <Calendar className="w-5 h-5" />
              <span>{t('bookVisit')}</span>
            </Link>
          </div>
          <div className="mt-8 text-sm text-deep-anthracite-500">
            <p>{t('contactLine')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
