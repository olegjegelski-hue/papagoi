import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  GIFT_CARD_PAYMENT_METHOD,
  GIFT_CARD_STATUS,
  giftCardCashflowTitle,
  giftCardPaymentDescription,
  isGiftCardMerchantReference,
  parseGiftCardCodeFromMerchantReference,
} from './gift-card'

describe('gift card merchantReference', () => {
  it('tunneb PK- koodi Montonio viitest', () => {
    assert.equal(parseGiftCardCodeFromMerchantReference('PK-WN4K4VXV'), 'PK-WN4K4VXV')
    assert.equal(parseGiftCardCodeFromMerchantReference('pk-wn4k4vxv extra'), 'PK-WN4K4VXV')
    assert.equal(isGiftCardMerchantReference('PK-WN4K4VXV'), true)
    assert.equal(isGiftCardMerchantReference('ANN-12'), false)
    assert.equal(parseGiftCardCodeFromMerchantReference('ANN-12'), null)
  })
})

describe('gift card copy helpers', () => {
  it('kirjeldus ja rahavoo nimetus', () => {
    assert.equal(
      giftCardPaymentDescription('PK-WN4K4VXV'),
      'Kinkekaart PK-WN4K4VXV – Papagoi Keskus'
    )
    assert.equal(
      giftCardCashflowTitle('Mari Mets', 'PK-WN4K4VXV'),
      'Kinkekaardi müük — Mari Mets (PK-WN4K4VXV)'
    )
    assert.equal(GIFT_CARD_STATUS.awaitingPayment, 'Ootab makset')
    assert.equal(GIFT_CARD_STATUS.active, 'Aktiivne')
    assert.equal(GIFT_CARD_PAYMENT_METHOD.montonio, 'Pangalink (Montonio)')
  })
})
