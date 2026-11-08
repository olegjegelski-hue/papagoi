import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  findExistingByGoogleReviewId,
  googleReviewIdFromGmbReview,
  isSameGoogleReview,
  normalizeGoogleReviewId,
} from './gmb-review-id'

/** Kaks päris arvustust samalt nimelt samal päeval (Google arvustused, 29.10.2026). */
const KADRI_13_03 = {
  displayName: 'Kadri Türna',
  createTime: '2026-10-29T13:03:00.000Z',
  reviewId: 'AbFvOqnTfGqG-zbokUQxuZ6YQt8dK8wQmEIbRzvo0x2q9TsB25y4elc80WjhG6G4HiR9HaQHQYVYhg',
  comment: '',
}

const KADRI_16_51 = {
  displayName: 'Kadri Türna',
  createTime: '2026-10-29T16:51:00.000Z',
  reviewId: 'AbFvOqkjZDiaYIDpg0XwomOjBOBs5DlbTJdDyGLiOOqM1H-c6nBBFGisbVXVGZDTrWY00Lio2g9yAQ',
  comment: 'Külastasime klassiga Papagoi Keskust ning see oli imetore ja meeldejääv kogemus!',
}

function dateOnlyIdentity(name: string, iso: string): string {
  return `${name.trim().toLowerCase()}|${iso.slice(0, 10)}`
}

describe('isSameGoogleReview', () => {
  it('ei liida Kadri Türna 29.10 13:03 ja 16:51 — eri Google review ID-d', () => {
    assert.equal(KADRI_13_03.displayName, KADRI_16_51.displayName)
    assert.equal(
      dateOnlyIdentity(KADRI_13_03.displayName, KADRI_13_03.createTime),
      dateOnlyIdentity(KADRI_16_51.displayName, KADRI_16_51.createTime),
      'nimi+päev kleebiks nad valesti kokku',
    )
    assert.notEqual(
      googleReviewIdFromGmbReview(KADRI_13_03),
      googleReviewIdFromGmbReview(KADRI_16_51),
    )
    assert.equal(isSameGoogleReview(KADRI_13_03, KADRI_16_51), false)
  })

  it('tunnistab sama arvustuse, kui ID klapib (ka resource name vs lühike ID)', () => {
    const resource = {
      name: `accounts/123/locations/456/reviews/${KADRI_16_51.reviewId}`,
      reviewId: null,
    }
    assert.equal(isSameGoogleReview(KADRI_16_51, resource), true)
    assert.equal(normalizeGoogleReviewId(resource.name), KADRI_16_51.reviewId)
  })
})

describe('findExistingByGoogleReviewId', () => {
  it('Kadri 16:51 lookup ei tagasta 13:03 rida, isegi kui nimi ja päev on samad', () => {
    const byId = new Map<string, { slot: string }>([
      [KADRI_13_03.reviewId, { slot: '13:03' }],
      [KADRI_16_51.reviewId, { slot: '16:51' }],
    ])
    assert.equal(findExistingByGoogleReviewId(byId, KADRI_16_51.reviewId)?.slot, '16:51')
    assert.equal(findExistingByGoogleReviewId(byId, KADRI_13_03.reviewId)?.slot, '13:03')
    assert.equal(
      findExistingByGoogleReviewId(byId, `accounts/x/locations/y/reviews/${KADRI_16_51.reviewId}`)
        ?.slot,
      '16:51',
    )
  })

  it('ei kasuta nime ega kuupäeva, kui ID puudub kaardist', () => {
    const byId = new Map<string, { slot: string }>([[KADRI_13_03.reviewId, { slot: '13:03' }]])
    assert.equal(findExistingByGoogleReviewId(byId, KADRI_16_51.reviewId), undefined)
  })
})
