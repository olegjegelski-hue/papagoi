import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { giftCardKeelSelect, notionOptionalContactProperty } from './notion-gift-cards'
import { resolveGiftCardLocale } from './notion-gift-card-lookup'

describe('notionOptionalContactProperty', () => {
  it('jätab tühja telefoni välja (phone_number ja rich_text)', () => {
    assert.equal(notionOptionalContactProperty('phone_number', 'phone_number', ''), null)
    assert.equal(notionOptionalContactProperty('phone_number', 'phone_number', '   '), null)
    assert.equal(notionOptionalContactProperty('phone_number', 'phone_number', null), null)
    assert.equal(notionOptionalContactProperty('phone_number', 'rich_text', ''), null)
  })

  it('saadab telefoni, kui väärtus on olemas', () => {
    assert.deepEqual(notionOptionalContactProperty('phone_number', 'phone_number', '+372 512 7938'), {
      phone_number: '+372 512 7938',
    })
    assert.deepEqual(notionOptionalContactProperty('phone_number', 'rich_text', '  +3725127938  '), {
      rich_text: [{ type: 'text', text: { content: '+3725127938' } }],
    })
  })

  it('jätab tühja e-posti välja; täidetud e-posti saadab', () => {
    assert.equal(notionOptionalContactProperty('email', 'email', ''), null)
    assert.equal(notionOptionalContactProperty('email', 'email', '  '), null)
    assert.deepEqual(notionOptionalContactProperty('email', 'email', 'keskus@papagoi.ee'), {
      email: 'keskus@papagoi.ee',
    })
  })
})

describe('giftCardKeelSelect', () => {
  it('kirjutab Keel Est/Eng/Rus vormi locale järgi', () => {
    assert.deepEqual(giftCardKeelSelect('et'), { select: { name: 'Est' } })
    assert.deepEqual(giftCardKeelSelect('en'), { select: { name: 'Eng' } })
    assert.deepEqual(giftCardKeelSelect('ru'), { select: { name: 'Rus' } })
  })
})

describe('resolveGiftCardLocale', () => {
  it('tühi Keel → et; Est/Eng/Rus → et/en/ru', () => {
    assert.equal(resolveGiftCardLocale({}), 'et')
    assert.equal(resolveGiftCardLocale({ Keel: { type: 'select', select: { name: null } } }), 'et')
    assert.equal(resolveGiftCardLocale({ Keel: { type: 'select', select: { name: '' } } }), 'et')
    assert.equal(resolveGiftCardLocale({ Keel: { type: 'select', select: { name: 'Est' } } }), 'et')
    assert.equal(resolveGiftCardLocale({ Keel: { type: 'select', select: { name: 'Eng' } } }), 'en')
    assert.equal(resolveGiftCardLocale({ Keel: { type: 'select', select: { name: 'Rus' } } }), 'ru')
  })
})
