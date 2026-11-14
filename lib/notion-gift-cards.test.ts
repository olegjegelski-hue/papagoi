import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { notionOptionalContactProperty } from './notion-gift-cards'

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
