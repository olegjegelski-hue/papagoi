import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { GiftCardDetails } from './notion-gift-card-lookup'
import {
  canMarkGiftCardUsed,
  canUndoGiftCardUsed,
  formatGiftCardDate,
  isGiftCardExpiredByDate,
  resolveGiftCardPublicKind,
  toGiftCardPublicView,
  toIsoDateOnly,
} from './gift-card-status'

function card(partial: Partial<GiftCardDetails>): GiftCardDetails {
  return {
    pageId: 'page',
    code: 'TEST-LUNASTUS',
    amountEur: 10,
    validUntil: '2027-12-31',
    buyerName: 'SECRET NAME',
    buyerEmail: 'secret@example.com',
    usedAt: null,
    qrUrl: null,
    status: 'Aktiivne',
    montonioUuid: null,
    cashflowPageId: null,
    ...partial,
  }
}

const noonTallinn = new Date('2026-11-10T10:00:00.000Z')

describe('toIsoDateOnly / formatGiftCardDate', () => {
  it('normaliseerib ISO, EE ja slash kuupäevad', () => {
    assert.equal(toIsoDateOnly('2027-01-15'), '2027-01-15')
    assert.equal(toIsoDateOnly('15.01.2027'), '2027-01-15')
    assert.equal(toIsoDateOnly('15/01/2027'), '2027-01-15')
    assert.equal(formatGiftCardDate('2027-01-15'), '15.01.2027')
  })
})

describe('resolveGiftCardPublicKind', () => {
  it('kehtiv: Aktiivne, aegumata, kasutamata', () => {
    assert.equal(resolveGiftCardPublicKind(card({}), noonTallinn), 'valid')
  })

  it('kasutatud staatuse või kuupäeva järgi', () => {
    assert.equal(
      resolveGiftCardPublicKind(card({ status: 'Kasutatud', usedAt: '2026-11-10' }), noonTallinn),
      'used'
    )
    assert.equal(
      resolveGiftCardPublicKind(card({ status: 'Aktiivne', usedAt: '2026-11-09' }), noonTallinn),
      'used'
    )
  })

  it('aegunud staatuse või kuupäeva järgi (kehtib kuni on inclusive)', () => {
    assert.equal(
      resolveGiftCardPublicKind(card({ status: 'Aegunud', validUntil: '2026-11-10' }), noonTallinn),
      'expired'
    )
    assert.equal(isGiftCardExpiredByDate('2026-11-10', noonTallinn), false)
    assert.equal(isGiftCardExpiredByDate('2026-11-09', noonTallinn), true)
    assert.equal(
      resolveGiftCardPublicKind(card({ status: 'Aktiivne', validUntil: '2026-11-09' }), noonTallinn),
      'expired'
    )
  })

  it('ootab makset / tühistatud / ei leitud', () => {
    assert.equal(resolveGiftCardPublicKind(card({ status: 'Tellitud' }), noonTallinn), 'pending')
    assert.equal(resolveGiftCardPublicKind(card({ status: 'Ootab makset' }), noonTallinn), 'pending')
    assert.equal(resolveGiftCardPublicKind(card({ status: 'Tühistatud' }), noonTallinn), 'cancelled')
    assert.equal(resolveGiftCardPublicKind(null, noonTallinn), 'not_found')
  })
})

describe('mark / undo flags', () => {
  it('märkida saab ainult kehtivat kaarti', () => {
    assert.equal(canMarkGiftCardUsed(card({}), noonTallinn), true)
    assert.equal(canMarkGiftCardUsed(card({ status: 'Tellitud' }), noonTallinn), false)
    assert.equal(canMarkGiftCardUsed(card({ status: 'Kasutatud', usedAt: '2026-11-10' }), noonTallinn), false)
  })

  it('tagasivõtt ainult samal Tallinna päeval', () => {
    assert.equal(
      canUndoGiftCardUsed(card({ status: 'Kasutatud', usedAt: '2026-11-10' }), noonTallinn),
      true
    )
    assert.equal(
      canUndoGiftCardUsed(card({ status: 'Kasutatud', usedAt: '2026-11-09' }), noonTallinn),
      false
    )
  })
})

describe('toGiftCardPublicView', () => {
  it('ei leki ostja nime ega e-posti', () => {
    const view = toGiftCardPublicView(card({}), noonTallinn)
    assert.ok(view)
    assert.equal(view.code, 'TEST-LUNASTUS')
    assert.equal(view.kind, 'valid')
    assert.equal('buyerName' in view, false)
    assert.equal('buyerEmail' in view, false)
    assert.equal(JSON.stringify(view).includes('SECRET'), false)
    assert.equal(JSON.stringify(view).includes('secret@'), false)
  })
})
