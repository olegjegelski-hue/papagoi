declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function track(event: string, params?: Record<string, unknown>, custom = false) {
  if (typeof window === 'undefined' || !window.fbq) return
  if (custom) {
    window.fbq('trackCustom', event, params)
  } else {
    window.fbq('track', event, params)
  }
}

/** Broneeringu vorm edukalt saadetud */
export function trackBookingSubmit(params?: { groupType?: string; groupSize?: number }) {
  track('Schedule', {
    content_name: 'Broneering',
    content_category: params?.groupType ?? 'broneering',
    num_items: params?.groupSize,
  })
}

/** Kinkekaardi tellimus edukalt saadetud */
export function trackGiftCardSubmit(params: { value: number }) {
  track('Lead', {
    content_name: 'Kinkekaart',
    content_category: 'kinkekaart',
    value: params.value,
    currency: 'EUR',
  })
}

/** Klõps petsvilla.ee lingil */
export function trackPetsVillaClick(source?: string) {
  track(
    'PetsVillaClick',
    {
      content_name: 'petsvilla.ee',
      content_category: source ?? 'outbound',
    },
    true
  )
}
