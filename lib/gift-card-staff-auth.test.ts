import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'

import {
  createStaffCookieValue,
  staffPinMatches,
  verifyStaffCookieValue,
} from './gift-card-staff-auth'

const ORIGINAL = process.env.GIFT_CARD_STAFF_PIN

describe('gift-card staff HMAC cookie', () => {
  beforeEach(() => {
    process.env.GIFT_CARD_STAFF_PIN = 'test-pin-123'
  })
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.GIFT_CARD_STAFF_PIN
    else process.env.GIFT_CARD_STAFF_PIN = ORIGINAL
  })

  it('allkirjastab ja kontrollib küpsist', () => {
    const now = Date.UTC(2026, 10, 10, 12, 0, 0)
    const value = createStaffCookieValue(now)
    assert.ok(value)
    assert.equal(verifyStaffCookieValue(value, now), true)
    assert.equal(verifyStaffCookieValue(value, now + 364 * 24 * 60 * 60 * 1000), true)
    assert.equal(verifyStaffCookieValue(value, now + 366 * 24 * 60 * 60 * 1000), false)
  })

  it('lükkab tagasi muudetud või vale PIN-iga küpsise', () => {
    const value = createStaffCookieValue()
    assert.ok(value)
    const tampered = value.slice(0, -2) + '00'
    assert.equal(verifyStaffCookieValue(tampered), false)
    process.env.GIFT_CARD_STAFF_PIN = 'other-pin'
    assert.equal(verifyStaffCookieValue(value), false)
  })

  it('PIN-i võrdlus on täpne', () => {
    assert.equal(staffPinMatches('test-pin-123'), true)
    assert.equal(staffPinMatches(' test-pin-123 '), true)
    assert.equal(staffPinMatches('wrong'), false)
  })
})
