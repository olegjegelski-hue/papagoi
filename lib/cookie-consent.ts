/** Shared cookie / marketing consent (GDPR). Stored in localStorage. */

export const COOKIE_CONSENT_KEY = 'papagoi-cookie-consent'
export const COOKIE_CONSENT_CHANGE_EVENT = 'papagoi-cookie-consent-change'
export const COOKIE_SETTINGS_OPEN_EVENT = 'papagoi-cookie-settings-open'

export type CookieConsent = {
  necessary: true
  marketing: boolean
}

export function readConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!raw) return null

  // Legacy: banner used to store plain "accepted"
  if (raw === 'accepted' || raw === 'marketing') {
    return { necessary: true, marketing: true }
  }
  if (raw === 'necessary' || raw === 'denied') {
    return { necessary: true, marketing: false }
  }

  try {
    const parsed = JSON.parse(raw) as { marketing?: boolean }
    if (typeof parsed?.marketing === 'boolean') {
      return { necessary: true, marketing: parsed.marketing }
    }
  } catch {
    // ignore invalid storage
  }
  return null
}

export function hasMarketingConsent(): boolean {
  return readConsent()?.marketing === true
}

export function writeConsent(marketing: boolean): CookieConsent {
  const value: CookieConsent = { necessary: true, marketing }
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: value }))
  return value
}

export function onConsentChange(callback: (consent: CookieConsent) => void): () => void {
  const handler = (event: Event) => {
    callback((event as CustomEvent<CookieConsent>).detail)
  }
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, handler)
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, handler)
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_OPEN_EVENT))
}

export function onCookieSettingsOpen(callback: () => void): () => void {
  window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, callback)
  return () => window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, callback)
}
