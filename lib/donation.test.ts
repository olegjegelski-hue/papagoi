import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DONATION_PURPOSES,
  DONATION_REFERENCE_NUMBER,
  estonianReferenceCheckDigit,
  isValidEstonianReferenceNumber,
} from './donation'

describe('DONATION_REFERENCE_NUMBER', () => {
  it('annab igale sihtotstarbele oodatud viitenumbri', () => {
    assert.equal(DONATION_REFERENCE_NUMBER.kingi, '1012')
    assert.equal(DONATION_REFERENCE_NUMBER.toit, '1025')
    assert.equal(DONATION_REFERENCE_NUMBER.uldine, '1038')
    assert.deepEqual(Object.keys(DONATION_REFERENCE_NUMBER).sort(), [...DONATION_PURPOSES].sort())
  })

  it('läbib 7-3-1 kontrolli kõigil kolmel viitenumbril', () => {
    for (const purpose of DONATION_PURPOSES) {
      const ref = DONATION_REFERENCE_NUMBER[purpose]
      assert.equal(
        isValidEstonianReferenceNumber(ref),
        true,
        `${purpose} viitenumber ${ref} ei läbi 7-3-1 kontrolli`,
      )
    }
  })

  it('lükkab tagasi vale kontrollnumbriga viite', () => {
    assert.equal(isValidEstonianReferenceNumber('1013'), false)
    assert.equal(isValidEstonianReferenceNumber('1'), false)
    assert.equal(estonianReferenceCheckDigit('101'), 2)
    assert.equal(estonianReferenceCheckDigit('102'), 5)
    assert.equal(estonianReferenceCheckDigit('103'), 8)
  })
})
