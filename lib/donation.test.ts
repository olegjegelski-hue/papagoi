import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DONATION_PURPOSES,
  DONATION_PURPOSE_NOTION,
  DONATION_REFERENCE_NUMBER,
  donationPaymentDescription,
  estonianReferenceCheckDigit,
  isValidEstonianReferenceNumber,
  parseDonationCodeFromMerchantReference,
  parseDonationNumberFromCode,
  purposeFromNotionLabel,
  splitPersonName,
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

describe('donation helpers', () => {
  it('teisendab Notioni sihtotstarve sildi tagasi koodiks', () => {
    assert.equal(purposeFromNotionLabel('Kingi külastus'), 'kingi')
    assert.equal(purposeFromNotionLabel('Loomade toit'), 'toit')
    assert.equal(purposeFromNotionLabel('Üldine'), 'uldine')
    assert.equal(purposeFromNotionLabel('tundmatu'), null)
  })

  it('koostab lühikese pangaselgituse', () => {
    assert.equal(
      donationPaymentDescription('ANN-12', 'kingi'),
      `Annetus ANN-12 – ${DONATION_PURPOSE_NOTION.kingi}`
    )
  })

  it('loeb ANN-koodi merchantReference’ist, ka sufiksiga', () => {
    assert.equal(parseDonationCodeFromMerchantReference('ANN-12'), 'ANN-12')
    assert.equal(parseDonationCodeFromMerchantReference('ann-12-173157'), 'ANN-12')
    assert.equal(parseDonationCodeFromMerchantReference('HAY-1'), null)
    assert.equal(parseDonationNumberFromCode('ANN-12'), 12)
  })

  it('tükeldab nime ees- ja perenimeks', () => {
    assert.deepEqual(splitPersonName('Mari Mets'), { firstName: 'Mari', lastName: 'Mets' })
    assert.deepEqual(splitPersonName('Mari'), { firstName: 'Mari', lastName: 'Mari' })
  })
})
