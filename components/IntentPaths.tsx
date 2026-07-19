'use client'

import { Link } from '@/i18n/navigation'
import { Calendar, Gift } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { KINKEKAART_PATH } from '@/lib/site-links'

type Props = {
  /** hero = pealehe CTA-paar; plain = heleda tausta sektsioon */
  variant?: 'hero' | 'plain'
}

/**
 * Kaks peamist tegevust (broneeri / kinkekaart).
 * Hero: suured gradient-CTA-d klaasitaustal — mitte beige info-kastid nagu Peredele jms.
 */
export default function IntentPaths({ variant = 'hero' }: Props) {
  const t = useTranslations('IntentPaths')

  if (variant === 'plain') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto">
        <Link href="/broneeri" className="papagoi-cta flex-1">
          <Calendar className="h-5 w-5" aria-hidden />
          <span>{t('visitCta')}</span>
        </Link>
        <Link
          href={KINKEKAART_PATH}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br from-papagoi-orange to-papagoi-red hover:shadow-papagoi-orange/40"
        >
          <Gift className="h-5 w-5" aria-hidden />
          <span>{t('giftCta')}</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto mb-14">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch">
        <Link
          href="/broneeri"
          className="group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-full px-8 py-5 text-center text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(67,160,71,0.45)] bg-gradient-to-br from-[#43A047] to-[#039BE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="inline-flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight">
            <Calendar className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
            {t('visitTitle')}
          </span>
          <span className="text-sm font-medium text-white/90 max-w-[16rem] leading-snug">
            {t('visitDesc')}
          </span>
        </Link>

        <Link
          href={KINKEKAART_PATH}
          className="group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-full px-8 py-5 text-center text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(255,152,0,0.45)] bg-gradient-to-br from-papagoi-orange to-papagoi-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="inline-flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight">
            <Gift className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
            {t('giftTitle')}
          </span>
          <span className="text-sm font-medium text-white/90 max-w-[16rem] leading-snug">
            {t('giftDesc')}
          </span>
        </Link>
      </div>
    </div>
  )
}
