'use client'

import { Link } from '@/i18n/navigation'
import { Gift } from 'lucide-react'
import { KINKEKAART_PATH } from '@/lib/site-links'
import { useTranslations } from 'next-intl'

type GiftCardCTAVariant = 'default' | 'service'

export default function GiftCardCTA({ variant = 'default' }: { variant?: GiftCardCTAVariant }) {
  const t = useTranslations('GiftCardCTA')

  if (variant === 'service') {
    return (
      <div className="bg-papagoi-beige-50 rounded-2xl shadow-xl overflow-hidden mb-12 border border-papagoi-beige-200">
        <div className="bg-gradient-to-r from-papagoi-orange to-papagoi-red p-8 text-white text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Gift className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        <div className="p-8 text-center">
          <Link
            href={KINKEKAART_PATH}
            className="papagoi-cta inline-flex items-center justify-center gap-2 bg-papagoi-orange hover:bg-papagoi-orange/90 text-white"
          >
            <Gift className="w-5 h-5" aria-hidden />
            <span>{t('buyGiftCard')}</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="py-12 mt-12 bg-papagoi-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-gradient-to-r from-papagoi-orange to-papagoi-red rounded-3xl p-8 md:p-12 text-white">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <Gift className="h-7 w-7" aria-hidden />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('titleShort')}</h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">{t('subtitle')}</p>
            <Link href={KINKEKAART_PATH} className="papagoi-cta-white inline-flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              <span>{t('buyGiftCard')}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
