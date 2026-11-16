import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'

import { COOKIE_CONSENT_KEY, writeConsent } from './cookie-consent'
import {
  GOOGLE_TAG_CONSENT_DENIED,
  GOOGLE_TAG_CONSENT_GRANTED,
  googleAdsBookingSendTo,
  googleTagInlineSnippet,
  grantGoogleTagConsent,
  isValidGoogleAdsId,
  revokeGoogleTagConsent,
  trackGoogleAdsBooking,
} from './google-ads'

type GtagCall = unknown[]

function memoryStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size
    },
  }
}

describe('isValidGoogleAdsId', () => {
  it('lubab AW- ja numbrid', () => {
    assert.equal(isValidGoogleAdsId('AW-1016905977'), true)
    assert.equal(isValidGoogleAdsId(' AW-1016905977 '), true)
  })

  it('lükkab tagasi tühja, GA4 ja vaba teksti', () => {
    assert.equal(isValidGoogleAdsId(''), false)
    assert.equal(isValidGoogleAdsId('G-XXXX'), false)
    assert.equal(isValidGoogleAdsId("AW-1';alert(1)//"), false)
  })
})

describe('googleAdsBookingSendTo', () => {
  const prev = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO

  afterEach(() => {
    if (prev == null) delete process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO
    else process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO = prev
  })

  it('tagastab undefined kui muutujat pole', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO
    assert.equal(googleAdsBookingSendTo(), undefined)
  })

  it('tagastab undefined tühja ja vale kuju korral', () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO = '   '
    assert.equal(googleAdsBookingSendTo(), undefined)
    process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO = 'AW-1016905977'
    assert.equal(googleAdsBookingSendTo(), undefined)
  })

  it('tagastab AW-…/silt väärtuse', () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO = 'AW-1016905977/AbCdEfGhIjk'
    assert.equal(googleAdsBookingSendTo(), 'AW-1016905977/AbCdEfGhIjk')
  })
})

describe('trackGoogleAdsBooking', () => {
  const prevSendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO
  const gtagCalls: GtagCall[] = []
  const storage = memoryStorage()

  beforeEach(() => {
    gtagCalls.length = 0
    storage.clear()
    delete process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO

    const gtag = (...args: unknown[]) => {
      gtagCalls.push(args)
    }

    const win = {
      gtag,
      localStorage: storage,
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }
    Object.defineProperty(globalThis, 'window', { value: win, configurable: true, writable: true })
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    if (prevSendTo == null) delete process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO
    else process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO = prevSendTo
    storage.removeItem(COOKIE_CONSENT_KEY)
  })

  it('ei saada sündmust ilma turundusnõusolekuta', () => {
    writeConsent(false)
    trackGoogleAdsBooking()
    assert.deepEqual(gtagCalls, [])
  })

  it('saadab booking_completed ilma isikuandmeteta', () => {
    writeConsent(true)
    trackGoogleAdsBooking()
    assert.equal(gtagCalls.length, 1)
    assert.deepEqual(gtagCalls[0], ['event', 'booking_completed'])
    const serialized = JSON.stringify(gtagCalls)
    assert.equal(serialized.includes('@'), false)
    assert.equal(serialized.toLowerCase().includes('email'), false)
    assert.equal(serialized.toLowerCase().includes('phone'), false)
  })

  it('saadab ka conversion, kui send_to on olemas', () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_SEND_TO = 'AW-1016905977/AbCdEfGhIjk'
    writeConsent(true)
    trackGoogleAdsBooking()
    assert.deepEqual(gtagCalls, [
      ['event', 'booking_completed'],
      ['event', 'conversion', { send_to: 'AW-1016905977/AbCdEfGhIjk' }],
    ])
  })
})

describe('Consent Mode', () => {
  it("paneb 'default' granted enne gtag config'i", () => {
    const snippet = googleTagInlineSnippet('AW-1016905977')
    const defaultIdx = snippet.indexOf("gtag('consent', 'default'")
    const configIdx = snippet.indexOf("gtag('config', 'AW-1016905977')")
    assert.ok(defaultIdx >= 0, 'consent default puudub')
    assert.ok(configIdx > defaultIdx, 'consent default peab olema enne config')
    assert.equal(snippet.includes('"ad_storage":"granted"'), true)
    assert.equal(snippet.includes('"ad_user_data":"granted"'), true)
    assert.equal(snippet.includes('"ad_personalization":"granted"'), true)
    assert.equal(snippet.includes('"analytics_storage":"granted"'), true)
  })

  it("saadab 'update' granted uuesti nõustumisel", () => {
    const gtagCalls: GtagCall[] = []
    Object.defineProperty(globalThis, 'window', {
      value: { gtag: (...args: unknown[]) => gtagCalls.push(args) },
      configurable: true,
      writable: true,
    })
    revokeGoogleTagConsent()
    grantGoogleTagConsent()
    assert.deepEqual(gtagCalls, [
      ['consent', 'update', { ...GOOGLE_TAG_CONSENT_DENIED }],
      ['consent', 'update', { ...GOOGLE_TAG_CONSENT_GRANTED }],
    ])
  })
})
