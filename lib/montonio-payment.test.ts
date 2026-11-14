import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import jwt from 'jsonwebtoken'

import {
  donationThankYouKind,
  extractMontonioOrderToken,
  getMontonioBankName,
  getMontonioPaymentStatus,
  isCancelledMontonioStatus,
  isPaidMontonioStatus,
  montonioAmountsMatch,
  parseMontonioAmount,
} from './montonio-payment'
import { hasMontonioConfig, validateMontonioToken } from './montonio'

describe('extractMontonioOrderToken', () => {
  it('loeb orderToken kehalt, mitte snake_case väljalt', () => {
    assert.equal(
      extractMontonioOrderToken({ body: { orderToken: 'abc', order_token: 'nope' } }),
      'abc'
    )
    assert.equal(extractMontonioOrderToken({ body: { payment_token: 'nope' } }), null)
  })

  it('loeb returnUrl query’st order-token', () => {
    const params = new URLSearchParams('order-token=jwt-here')
    assert.equal(extractMontonioOrderToken({ searchParams: params }), 'jwt-here')
  })
})

describe('Montonio staatus ja summa', () => {
  it('tunnistab ainult PAID makstuks', () => {
    assert.equal(isPaidMontonioStatus('PAID'), true)
    assert.equal(isPaidMontonioStatus('FINALIZED'), false)
    assert.equal(isPaidMontonioStatus('PENDING'), false)
    assert.equal(isCancelledMontonioStatus('ABANDONED'), true)
    assert.equal(isCancelledMontonioStatus('VOIDED'), true)
  })

  it('eelistab camelCase paymentStatus välja', () => {
    assert.equal(getMontonioPaymentStatus({ paymentStatus: 'PAID', status: 'nope' }), 'PAID')
    assert.equal(parseMontonioAmount({ grandTotal: 20 }), 20)
    assert.equal(parseMontonioAmount({ grandTotal: '10.00' }), 10)
    assert.equal(montonioAmountsMatch(10, 10), true)
    assert.equal(montonioAmountsMatch(10.001, 10), true)
    assert.equal(montonioAmountsMatch(20, 10), false)
    assert.equal(getMontonioBankName({ paymentProviderName: 'SEB Estonia' }), 'SEB Estonia')
  })

  it('määrab aitäh-lehe oleku', () => {
    assert.equal(donationThankYouKind('PAID'), 'paid')
    assert.equal(donationThankYouKind('PENDING'), 'pending')
    assert.equal(donationThankYouKind('ABANDONED'), 'failed')
    assert.equal(donationThankYouKind(''), 'failed')
  })
})

describe('validateMontonioToken', () => {
  it('kontrollib HS256 allkirja ja accessKey-d', () => {
    const prevAccess = process.env.MONTONIO_ACCESS_KEY
    const prevSecret = process.env.MONTONIO_SECRET_KEY
    const prevEnv = process.env.MONTONIO_ENVIRONMENT
    process.env.MONTONIO_ACCESS_KEY = 'test-access'
    process.env.MONTONIO_SECRET_KEY = 'test-secret'
    process.env.MONTONIO_ENVIRONMENT = 'sandbox'
    try {
      assert.equal(hasMontonioConfig(), true)

      const token = jwt.sign(
        { accessKey: 'test-access', merchantReference: 'ANN-1', paymentStatus: 'PAID' },
        'test-secret',
        { algorithm: 'HS256' }
      )
      const decoded = validateMontonioToken(token)
      assert.equal(decoded.merchantReference, 'ANN-1')

      const wrongKey = jwt.sign({ accessKey: 'other', paymentStatus: 'PAID' }, 'test-secret', {
        algorithm: 'HS256',
      })
      assert.throws(() => validateMontonioToken(wrongKey), /accessKey ei kattu/)

      const forged = jwt.sign({ accessKey: 'test-access' }, 'other-secret', { algorithm: 'HS256' })
      assert.throws(() => validateMontonioToken(forged))
    } finally {
      process.env.MONTONIO_ACCESS_KEY = prevAccess
      process.env.MONTONIO_SECRET_KEY = prevSecret
      process.env.MONTONIO_ENVIRONMENT = prevEnv
    }
  })
})
