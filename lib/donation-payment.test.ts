import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { DONATION_STATUS } from './donation'
import { nextDonationStatus, shouldSendDonationThankYou } from './donation-payment'
import { getDonationEmailCopy } from './email-i18n'

describe('nextDonationStatus', () => {
  it('märgib PAID → Laekunud, kui veel pole laekunud', () => {
    assert.equal(
      nextDonationStatus({ currentStatus: DONATION_STATUS.awaitingPayment, paymentStatus: 'PAID' }),
      DONATION_STATUS.paid
    )
    assert.equal(
      nextDonationStatus({ currentStatus: DONATION_STATUS.paid, paymentStatus: 'PAID' }),
      null
    )
  })

  it('tühistab ABANDONED/VOIDED ainult kui pole Laekunud', () => {
    assert.equal(
      nextDonationStatus({
        currentStatus: DONATION_STATUS.awaitingPayment,
        paymentStatus: 'ABANDONED',
      }),
      DONATION_STATUS.cancelled
    )
    assert.equal(
      nextDonationStatus({ currentStatus: DONATION_STATUS.paid, paymentStatus: 'VOIDED' }),
      null
    )
    assert.equal(
      nextDonationStatus({ currentStatus: DONATION_STATUS.awaitingPayment, paymentStatus: 'PENDING' }),
      null
    )
  })
})

describe('shouldSendDonationThankYou', () => {
  it('ei saada topelt, kui tänukiri on juba märgitud', () => {
    assert.equal(shouldSendDonationThankYou({ thankYouSent: false }), true)
    assert.equal(shouldSendDonationThankYou({ thankYouSent: true }), false)
  })
})

describe('getDonationEmailCopy', () => {
  it('tänukiri ei sisalda IBAN-it ega ülekande palvet', () => {
    for (const locale of ['et', 'en', 'ru'] as const) {
      const copy = getDonationEmailCopy(locale)
      assert.equal('iban' in copy, false)
      assert.equal('ibanValue' in copy, false)
      assert.equal('transferLead' in copy, false)
      assert.equal('afterTransfer' in copy, false)
      assert.match(copy.thanks, /laekunud|received|получен/i)
      assert.ok(copy.impact.length > 20)
    }
  })
})
