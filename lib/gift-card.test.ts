import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildGiftCardIssuedEmail } from './email'
import { formatMailDate, getGiftCardIssuedEmailCopy } from './email-i18n'
import {
  GIFT_CARD_PAYMENT_METHOD,
  GIFT_CARD_STATUS,
  giftCardCashflowTitle,
  giftCardPaymentDescription,
  giftCardRedeemPath,
  giftCardRedeemUrl,
  isGiftCardAlreadyIssued,
  isGiftCardMerchantReference,
  legacyGiftCardRedeemUrl,
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

describe('giftCardRedeemUrl', () => {
  it('QR URL on eesti keeles /et/', () => {
    const prev = process.env.NEXT_PUBLIC_BASE_URL
    process.env.NEXT_PUBLIC_BASE_URL = 'https://papagoi.ee'
    try {
      assert.equal(
        giftCardRedeemUrl('PK-WN4K4VXV'),
        'https://papagoi.ee/et/kinkekaart/lunasta?code=PK-WN4K4VXV'
      )
      assert.equal(
        giftCardRedeemUrl('PK-WN4K4VXV', 'et'),
        'https://papagoi.ee/et/kinkekaart/lunasta?code=PK-WN4K4VXV'
      )
      assert.equal(
        giftCardRedeemUrl('PK-WN4K4VXV', 'en'),
        'https://papagoi.ee/en/kinkekaart/lunasta?code=PK-WN4K4VXV'
      )
      assert.equal(
        giftCardRedeemUrl('PK-WN4K4VXV', 'ru'),
        'https://papagoi.ee/ru/kinkekaart/lunasta?code=PK-WN4K4VXV'
      )
      assert.equal(giftCardRedeemPath('PK-WN4K4VXV'), '/kinkekaart/lunasta?code=PK-WN4K4VXV')
      assert.equal(giftCardRedeemPath(), '/kinkekaart/lunasta')
      assert.equal(
        legacyGiftCardRedeemUrl('PK-WN4K4VXV'),
        'https://papagoi.ee/kinkekaart/lunasta?code=PK-WN4K4VXV'
      )
    } finally {
      if (prev == null) delete process.env.NEXT_PUBLIC_BASE_URL
      else process.env.NEXT_PUBLIC_BASE_URL = prev
    }
  })
})

describe('isGiftCardAlreadyIssued', () => {
  it('tunneb ära vana ja uue QR URL kuju', () => {
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
          qrUrl: 'https://papagoi.ee/et/kinkekaart/lunasta?code=PK-WN4K4VXV',
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
      assert.equal(
        isGiftCardAlreadyIssued({
          code: 'PK-WN4K4VXV',
          qrUrl: 'https://papagoi.ee/en/kinkekaart/lunasta?code=PK-WN4K4VXV',
        }),
        false
      )
    } finally {
      if (prev == null) delete process.env.NEXT_PUBLIC_BASE_URL
      else process.env.NEXT_PUBLIC_BASE_URL = prev
    }
  })
})

describe('getGiftCardIssuedEmailCopy', () => {
  it('copy on olemas kõigis kolmes keeles sama võtmete komplektiga', () => {
    const et = getGiftCardIssuedEmailCopy('et')
    const en = getGiftCardIssuedEmailCopy('en')
    const ru = getGiftCardIssuedEmailCopy('ru')
    const keys = Object.keys(et).sort()
    assert.deepEqual(Object.keys(en).sort(), keys)
    assert.deepEqual(Object.keys(ru).sort(), keys)
    assert.equal(et.title, 'Kinkekaart on valmis')
    assert.equal(et.subject(10), 'Papagoi Keskuse kinkekaart (10 €) – valmis')
    assert.match(et.attachmentsHtml, /PNG/)
    assert.match(en.attachmentsHtml, /PNG/)
    assert.match(ru.attachmentsHtml, /PNG/)
  })
})

describe('buildGiftCardIssuedEmail', () => {
  it('lunastuslink kirjas on kirja keeles', () => {
    const prev = process.env.NEXT_PUBLIC_BASE_URL
    process.env.NEXT_PUBLIC_BASE_URL = 'https://papagoi.ee'
    try {
      const et = buildGiftCardIssuedEmail({
        buyerName: 'Mari Mets',
        amountEur: 10,
        code: 'PK-WN4K4VXV',
        validUntil: '2027-12-31',
        locale: 'et',
      })
      const en = buildGiftCardIssuedEmail({
        buyerName: 'Mari Mets',
        amountEur: 10,
        code: 'PK-WN4K4VXV',
        validUntil: '2027-12-31',
        locale: 'en',
      })
      const ru = buildGiftCardIssuedEmail({
        buyerName: 'Mari Mets',
        amountEur: 10,
        code: 'PK-WN4K4VXV',
        validUntil: '2027-12-31',
        locale: 'ru',
      })
      assert.equal(et.redeemUrl, 'https://papagoi.ee/et/kinkekaart/lunasta?code=PK-WN4K4VXV')
      assert.equal(en.redeemUrl, 'https://papagoi.ee/en/kinkekaart/lunasta?code=PK-WN4K4VXV')
      assert.equal(ru.redeemUrl, 'https://papagoi.ee/ru/kinkekaart/lunasta?code=PK-WN4K4VXV')
      assert.match(et.html, /https:\/\/papagoi\.ee\/et\/kinkekaart\/lunasta\?code=PK-WN4K4VXV/)
      assert.match(en.html, /https:\/\/papagoi\.ee\/en\/kinkekaart\/lunasta\?code=PK-WN4K4VXV/)
      assert.match(ru.html, /https:\/\/papagoi\.ee\/ru\/kinkekaart\/lunasta\?code=PK-WN4K4VXV/)
      assert.match(et.text, /Lunastamise link: https:\/\/papagoi\.ee\/et\/kinkekaart\/lunasta\?code=PK-WN4K4VXV/)
      assert.match(en.text, /Redemption link: https:\/\/papagoi\.ee\/en\/kinkekaart\/lunasta\?code=PK-WN4K4VXV/)
      assert.match(ru.text, /Ссылка для погашения: https:\/\/papagoi\.ee\/ru\/kinkekaart\/lunasta\?code=PK-WN4K4VXV/)
      assert.match(et.html, /Kinkekaart on valmis/)
      assert.match(en.html, /Your gift card is ready/)
      assert.match(ru.html, /Подарочная карта готова/)
      assert.equal(formatMailDate('2027-12-31', 'et'), '31. detsember 2027')
      assert.match(et.text, /31\. detsember 2027/)
      assert.match(en.text, /31 December 2027/)
    } finally {
      if (prev == null) delete process.env.NEXT_PUBLIC_BASE_URL
      else process.env.NEXT_PUBLIC_BASE_URL = prev
    }
  })
})
