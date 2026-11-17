import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'

import { COOKIE_CONSENT_KEY, writeConsent } from './cookie-consent'
import {
  GOOGLE_TAG_CONSENT_DENIED,
  GOOGLE_TAG_CONSENT_GRANTED,
  googleAdsBookingSendTo,
  googleTagInlineSnippet,
  googleTagLoaderId,
  grantGoogleTagConsent,
  isValidGaMeasurementId,
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

describe('isValidGaMeasurementId', () => {
  it('lubab G- ja suurtähed/numbrid', () => {
    assert.equal(isValidGaMeasurementId('G-56FSCMW5CE'), true)
    assert.equal(isValidGaMeasurementId(' G-ABCDEF123 '), true)
  })

  it('lükkab tagasi tühja, Ads ID ja süstimiskatse', () => {
    assert.equal(isValidGaMeasurementId(''), false)
    assert.equal(isValidGaMeasurementId('AW-1016905977'), false)
    assert.equal(isValidGaMeasurementId('g-56FSCMW5CE'), false)
    assert.equal(isValidGaMeasurementId('G-abc'), false)
    assert.equal(isValidGaMeasurementId("G-XXXX';alert(1)//"), false)
    assert.equal(isValidGaMeasurementId('G-AB<script>'), false)
    assert.equal(isValidGaMeasurementId('G-AB CD'), false)
  })
})

describe('googleTagLoaderId', () => {
  it('eelistab kehtivat GA4 ID-d Adsi ees', () => {
    assert.equal(googleTagLoaderId('AW-1016905977', 'G-56FSCMW5CE'), 'G-56FSCMW5CE')
  })

  it('tagastab Adsi ID, kui GA4 puudub', () => {
    assert.equal(googleTagLoaderId('AW-1016905977'), 'AW-1016905977')
    assert.equal(googleTagLoaderId('AW-1016905977', ''), 'AW-1016905977')
  })

  it('tagastab GA4 ID, kui Ads puudub', () => {
    assert.equal(googleTagLoaderId(undefined, 'G-56FSCMW5CE'), 'G-56FSCMW5CE')
    assert.equal(googleTagLoaderId('', 'G-56FSCMW5CE'), 'G-56FSCMW5CE')
  })

  it('ignoreerib kehtetut GA4 ID-d', () => {
    assert.equal(googleTagLoaderId('AW-1016905977', "G-XX';alert(1)//"), 'AW-1016905977')
    assert.equal(googleTagLoaderId(undefined, "G-XX';alert(1)//"), undefined)
    assert.equal(googleTagLoaderId(), undefined)
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

  it('lisab ainult Adsi config, kui GA4 puudub', () => {
    const snippet = googleTagInlineSnippet('AW-1016905977')
    assert.equal(snippet.includes("gtag('config', 'AW-1016905977')"), true)
    assert.equal(snippet.includes("gtag('config', 'G-"), false)
  })

  it('lisab ainult GA4 config, kui Ads puudub', () => {
    const snippet = googleTagInlineSnippet(undefined, 'G-56FSCMW5CE')
    const defaultIdx = snippet.indexOf("gtag('consent', 'default'")
    const gaIdx = snippet.indexOf("gtag('config', 'G-56FSCMW5CE')")
    assert.ok(defaultIdx >= 0, 'consent default puudub')
    assert.ok(gaIdx > defaultIdx, 'consent default peab olema enne GA config')
    assert.equal(snippet.includes("gtag('config', 'AW-"), false)
  })

  it('lisab mõlemad config-id, Ads ja GA4', () => {
    const snippet = googleTagInlineSnippet('AW-1016905977', 'G-56FSCMW5CE')
    const defaultIdx = snippet.indexOf("gtag('consent', 'default'")
    const adsIdx = snippet.indexOf("gtag('config', 'AW-1016905977')")
    const gaIdx = snippet.indexOf("gtag('config', 'G-56FSCMW5CE')")
    assert.ok(defaultIdx >= 0)
    assert.ok(adsIdx > defaultIdx)
    assert.ok(gaIdx > defaultIdx)
  })

  it('ei lisa GA config kehtetu ID korral (süstimiskaitse)', () => {
    const injected = "G-XXXX';alert(1)//"
    const snippet = googleTagInlineSnippet('AW-1016905977', injected)
    assert.equal(snippet.includes("gtag('config', 'AW-1016905977')"), true)
    assert.equal(snippet.includes(injected), false)
    assert.equal(snippet.includes('alert(1)'), false)
    assert.equal(snippet.includes("gtag('config', 'G-XXXX"), false)
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
