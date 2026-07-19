'use client'

import { Link } from '@/i18n/navigation'
import { Calendar, Gift } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { KINKEKAART_PATH } from '@/lib/site-links'

type Props = {
  /** hero = heledad kaardid tumedal taustal; plain = heleda tausta sektsioon */
  variant?: 'hero' | 'plain'
}

export default function IntentPaths({ variant = 'hero' }: Props) {
  const t = useTranslations('IntentPaths')

  const grid =
    variant === 'hero'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto'

  return (
    <div className={grid}>
      <Link
        href="/broneeri"
        className="group flex flex-col items-start rounded-2xl bg-white p-6 text-left shadow-2xl border-2 border-papagoi-green/30 hover:border-papagoi-green hover:shadow-papagoi-green/20 hover:-translate-y-0.5 transition-all duration-300"
      >
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-papagoi-green/15 text-papagoi-green group-hover:bg-papagoi-green group-hover:text-white transition-colors">
          <Calendar className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="text-xl font-bold text-deep-anthracite mb-2">{t('visitTitle')}</h3>
        <p className="text-sm text-warm-gray-600 mb-4 flex-1">{t('visitDesc')}</p>
        <span className="inline-flex items-center gap-2 font-semibold text-papagoi-green group-hover:underline">
          <Calendar className="h-4 w-4" aria-hidden />
          {t('visitCta')}
        </span>
      </Link>

      <Link
        href={KINKEKAART_PATH}
        className="group flex flex-col items-start rounded-2xl bg-white p-6 text-left shadow-2xl border-2 border-papagoi-orange/40 hover:border-papagoi-orange hover:shadow-papagoi-orange/20 hover:-translate-y-0.5 transition-all duration-300"
      >
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-papagoi-orange/15 text-papagoi-orange group-hover:bg-papagoi-orange group-hover:text-white transition-colors">
          <Gift className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="text-xl font-bold text-deep-anthracite mb-2">{t('giftTitle')}</h3>
        <p className="text-sm text-warm-gray-600 mb-4 flex-1">{t('giftDesc')}</p>
        <span className="inline-flex items-center gap-2 font-semibold text-papagoi-orange group-hover:underline">
          <Gift className="h-4 w-4" aria-hidden />
          {t('giftCta')}
        </span>
      </Link>
    </div>
  )
}
