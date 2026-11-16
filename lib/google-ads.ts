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

export const GOOGLE_TAG_CONSENT_GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
} as const

export const GOOGLE_TAG_CONSENT_DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const

export function isValidGoogleAdsId(id: string): boolean {
  return GOOGLE_ADS_ID_PATTERN.test(id.trim())
}

function callGtagConsent(
  command: 'default' | 'update',
  flags: typeof GOOGLE_TAG_CONSENT_GRANTED | typeof GOOGLE_TAG_CONSENT_DENIED,
): void {
  if (typeof window === 'undefined') return
  try {
    window.gtag?.('consent', command, { ...flags })
  } catch {
    // ignore
  }
}

/** Consent Mode: uuesti nõustumine pärast tühistamist (next/script ei pruugi uuesti joosta). */
export function grantGoogleTagConsent(): void {
  callGtagConsent('update', GOOGLE_TAG_CONSENT_GRANTED)
}

export function revokeGoogleTagConsent(): void {
  callGtagConsent('update', GOOGLE_TAG_CONSENT_DENIED)
}

/** Inline gtag snippet. Consent Mode 'default' granted peab olema enne config'i. */
export function googleTagInlineSnippet(adsId: string): string {
  const id = adsId.trim()
  const consent = JSON.stringify(GOOGLE_TAG_CONSENT_GRANTED)
  return `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', ${consent});
            gtag('config', '${id}');
          `
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
