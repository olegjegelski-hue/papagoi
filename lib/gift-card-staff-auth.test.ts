import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'

import {
  createStaffCookieValue,
  isGiftCardStaffConfigured,
  staffPinMatches,
  verifyStaffCookieValue,
} from './gift-card-staff-auth'

const ORIGINAL_PIN = process.env.GIFT_CARD_STAFF_PIN
const ORIGINAL_SECRET = process.env.GIFT_CARD_STAFF_SECRET

function restoreEnv() {
  if (ORIGINAL_PIN === undefined) delete process.env.GIFT_CARD_STAFF_PIN
  else process.env.GIFT_CARD_STAFF_PIN = ORIGINAL_PIN
  if (ORIGINAL_SECRET === undefined) delete process.env.GIFT_CARD_STAFF_SECRET
  else process.env.GIFT_CARD_STAFF_SECRET = ORIGINAL_SECRET
}

describe('gift-card staff HMAC cookie', () => {
  beforeEach(() => {
    process.env.GIFT_CARD_STAFF_PIN = 'test-pin-123'
    process.env.GIFT_CARD_STAFF_SECRET = 'long-hmac-secret-value'
  })
  afterEach(restoreEnv)

  it('allkirjastab ja kontrollib küpsist', () => {
    const now = Date.UTC(2026, 10, 10, 12, 0, 0)
    const value = createStaffCookieValue(now)
    assert.ok(value)
    assert.equal(value.split('.').length, 4)
    assert.equal(verifyStaffCookieValue(value, now), true)
    assert.equal(verifyStaffCookieValue(value, now + 364 * 24 * 60 * 60 * 1000), true)
    assert.equal(verifyStaffCookieValue(value, now + 366 * 24 * 60 * 60 * 1000), false)
  })

  it('lükkab tagasi muudetud küpsise, uue PIN-i ja uue HMAC-saladusega', () => {
    const value = createStaffCookieValue()
    assert.ok(value)
    const tampered = value.slice(0, -2) + '00'
    assert.equal(verifyStaffCookieValue(tampered), false)
    process.env.GIFT_CARD_STAFF_PIN = 'other-pin-99'
    assert.equal(verifyStaffCookieValue(value), false)
    process.env.GIFT_CARD_STAFF_PIN = 'test-pin-123'
    process.env.GIFT_CARD_STAFF_SECRET = 'different-hmac-secret'
    assert.equal(verifyStaffCookieValue(value), false)
  })

  it('PIN-i võrdlus on täpne', () => {
    assert.equal(staffPinMatches('test-pin-123'), true)
    assert.equal(staffPinMatches(' test-pin-123 '), true)
    assert.equal(staffPinMatches('wrong'), false)
  })

  it('GIFT_CARD_STAFF_SECRET puudumisel on keskus väljas', () => {
    delete process.env.GIFT_CARD_STAFF_SECRET
    assert.equal(isGiftCardStaffConfigured(), false)
    assert.equal(createStaffCookieValue(), null)
    assert.equal(verifyStaffCookieValue('v1.1.abc.def'), false)
  })

  it('PIN lühem kui 6 märki lülitab keskuse välja ja logib vea', () => {
    process.env.GIFT_CARD_STAFF_PIN = '12345'
    const errors: unknown[][] = []
    const orig = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    try {
      assert.equal(isGiftCardStaffConfigured(), false)
      assert.equal(createStaffCookieValue(), null)
      assert.ok(errors.some((args) => String(args[0]).includes('lühem kui 6')))
    } finally {
      console.error = orig
    }
  })
})
