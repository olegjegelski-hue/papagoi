'use client'

import { hasMarketingConsent } from '@/lib/cookie-consent'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function getCookie(name: string) {
  return document.cookie.split('; ').find((r) => r.startsWith(name + '='))?.split('=')[1]
}

function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  if (!digits) return undefined
  if (digits.startsWith('372')) return digits
  return `372${digits}`
}

export async function trackBooking(opts: { email?: string; phone?: string; value: number }) {
  try {
    if (!hasMarketingConsent()) return

    const eventId = crypto.randomUUID()

    // Browser Pixel — same eventID for deduplication
    window.fbq?.('track', 'Schedule', { value: opts.value, currency: 'EUR' }, { eventID: eventId })

    // Server CAPI — same eventId + consent flag
    await fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'Schedule',
        eventId,
        eventSourceUrl: window.location.href,
        email: opts.email,
        phone: normalizePhone(opts.phone),
        value: opts.value,
        currency: 'EUR',
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc'),
        marketingConsent: true,
      }),
    })
  } catch {
    // Never block the booking flow if tracking fails
  }
}
