import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  findExistingByGoogleReviewId,
  gmbReviewReplyUrl,
  gmbReviewResourceUrl,
  gmbReviewsListUrl,
  googleReviewIdFromGmbReview,
  isSameGoogleReview,
  normalizeGoogleReviewId,
  normalizedReviewIdShape,
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

describe('GMB review URL-id', () => {
  const accountId = '123456'
  const locationId = '789012'
  const shortId = KADRI_16_51.reviewId
  const resourceName = `accounts/${accountId}/locations/${locationId}/reviews/${shortId}`

  it('normaliseerib resource name ja URL-kodeeritud resource name samaks lühikeseks ID-ks', () => {
    assert.equal(normalizeGoogleReviewId(resourceName), shortId)
    assert.equal(normalizeGoogleReviewId(encodeURIComponent(resourceName)), shortId)
  })

  it('resource URL ei topeltkodeeri kaldkriipse (pole %2F teel)', () => {
    const fromShort = gmbReviewResourceUrl(accountId, locationId, shortId)
    const fromResource = gmbReviewResourceUrl(accountId, locationId, resourceName)
    const fromEncoded = gmbReviewResourceUrl(accountId, locationId, encodeURIComponent(resourceName))
    const expected = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${encodeURIComponent(shortId)}`
    assert.equal(fromShort, expected)
    assert.equal(fromResource, expected)
    assert.equal(fromEncoded, expected)
    assert.equal(fromShort.includes('%2F'), false)
    assert.equal(fromEncoded.includes('%25'), false)
    assert.equal(gmbReviewReplyUrl(accountId, locationId, resourceName), `${expected}/reply`)
  })

  it('list URL jagab sama parentit ja pageSize=1 on query, mitte teel', () => {
    const url = gmbReviewsListUrl(accountId, locationId, { pageSize: 1 })
    assert.equal(
      url.startsWith(
        `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?`,
      ),
      true,
    )
    assert.match(url, /pageSize=1/)
    assert.equal(url.includes('%2F'), false)
  })

  it('ID kuju logib pikkuse ja / % tühiku, ilma ID-ta', () => {
    const shape = normalizedReviewIdShape(resourceName)
    assert.equal(shape.length, shortId.length)
    assert.equal(shape.hasSlash, false)
    assert.equal(shape.hasPercent, false)
    assert.equal(shape.hasSpace, false)
    const encodedSlash = normalizedReviewIdShape('pre%2Ffix')
    assert.equal(encodedSlash.hasSlash, true)
    assert.equal(JSON.stringify(shape).includes(shortId), false)
  })
})
