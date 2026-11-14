import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  GIFT_CARD_STATUS,
  isGiftCardAlreadyIssued,
  nextGiftCardStatus,
} from './gift-card'

describe('nextGiftCardStatus', () => {
  it('märgib PAID → Aktiivne, kui ootab makset', () => {
    assert.equal(
      nextGiftCardStatus({
        currentStatus: GIFT_CARD_STATUS.awaitingPayment,
        paymentStatus: 'PAID',
      }),
      GIFT_CARD_STATUS.active
    )
    assert.equal(
      nextGiftCardStatus({
        currentStatus: GIFT_CARD_STATUS.active,
        paymentStatus: 'PAID',
      }),
      null
    )
  })

  it('tühistab ABANDONED/VOIDED ainult kui ootab makset', () => {
    assert.equal(
      nextGiftCardStatus({
        currentStatus: GIFT_CARD_STATUS.awaitingPayment,
        paymentStatus: 'ABANDONED',
      }),
      GIFT_CARD_STATUS.cancelled
    )
    assert.equal(
      nextGiftCardStatus({
        currentStatus: GIFT_CARD_STATUS.active,
        paymentStatus: 'VOIDED',
      }),
      null
    )
    assert.equal(
      nextGiftCardStatus({
        currentStatus: GIFT_CARD_STATUS.ordered,
        paymentStatus: 'ABANDONED',
      }),
      null
    )
    assert.equal(
      nextGiftCardStatus({
        currentStatus: GIFT_CARD_STATUS.awaitingPayment,
        paymentStatus: 'PENDING',
      }),
      null
    )
  })
})

describe('isGiftCardAlreadyIssued', () => {
  it('loeb QR URL-i idempotentsuse markeriks', () => {
    const prev = process.env.NEXT_PUBLIC_BASE_URL
    process.env.NEXT_PUBLIC_BASE_URL = 'https://papagoi.ee'
    try {
      assert.equal(
        isGiftCardAlreadyIssued({
          code: 'PK-WN4K4VXV',
          qrUrl: 'https://papagoi.ee/kinkekaart/lunasta?code=PK-WN4K4VXV',
        }),
        true
      )
      assert.equal(
        isGiftCardAlreadyIssued({
          code: 'PK-WN4K4VXV',
          qrUrl: null,
        }),
        false
      )
    } finally {
      if (prev == null) delete process.env.NEXT_PUBLIC_BASE_URL
      else process.env.NEXT_PUBLIC_BASE_URL = prev
    }
  })
})
