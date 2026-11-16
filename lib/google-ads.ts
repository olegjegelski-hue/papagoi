'use client'

import { hasMarketingConsent } from '@/lib/cookie-consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Google Ads konto silt, nt AW-1016905977 */
export const GOOGLE_ADS_ID_PATTERN = /^AW-\d+$/
/** Konversioonisilt, nt AW-1016905977/AbCdEfGhIjk */
export const GOOGLE_ADS_SEND_TO_PATTERN = /^AW-\d+\/[\w-]+$/

export function isValidGoogleAdsId(id: string): boolean {
  return GOOGLE_ADS_ID_PATTERN.test(id.trim())
}

export function googleAdsBookingSendTo(): string | undefined {
  const value = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO?.trim()
  if (!value || !GOOGLE_ADS_SEND_TO_PATTERN.test(value)) return undefined
  return value
}

/**
 * Broneeringu õnnestumise Google'i sündmused.
 * Ei saada nime, e-posti ega telefoni.
 */
export function trackGoogleAdsBooking(): void {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return
  const gtag = window.gtag
  if (typeof gtag !== 'function') return

  gtag('event', 'booking_completed')

  const sendTo = googleAdsBookingSendTo()
  if (sendTo) {
    gtag('event', 'conversion', { send_to: sendTo })
  }
}
