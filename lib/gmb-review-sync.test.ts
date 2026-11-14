import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GMB_STATUS } from './gmb-review-workflow'
import {
  buildNotionPropertiesFromReview,
  GMB_REVIEW_SYNC_TIMESTAMP_PROP,
  notionReviewSyncNeedsPatch,
  planReviewSyncActions,
  type GoogleReviewForSync,
} from './gmb-review-sync'
import { upsertReviewsIntoNotion } from '../scripts/sync-google-reviews-to-notion'

const REVIEW_URL = 'https://g.page/r/test/review'
const NOW_ISO = '2026-11-14T16:00:00.000Z'
const OLD_SYNC_ISO = '2026-01-01T00:00:00.000Z'
const REVIEW_ID = 'AbFvOqkjZDiaYIDpg0XwomOjBOBs5DlbTJdDyGLiOOqM1H-c6nBBFGisbVXVGZDTrWY00Lio2g9yAQ'

const review: GoogleReviewForSync = {
  reviewId: REVIEW_ID,
  reviewer: { displayName: 'Kadri Türna' },
  starRating: 'FIVE',
  comment: 'Külastasime klassiga Papagoi Keskust ning see oli imetore!',
  createTime: '2026-10-29T13:03:00.000Z',
  reviewReply: null,
}

function existingFromNext(
  next: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...next,
    [GMB_REVIEW_SYNC_TIMESTAMP_PROP]: { date: { start: OLD_SYNC_ISO } },
    ...overrides,
  }
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

describe('notionReviewSyncNeedsPatch', () => {
  it('ei loe ainult „Viimati sünkroniseeritud“ muutust PATCH-iks', () => {
    const next = buildNotionPropertiesFromReview(review, null, REVIEW_URL, NOW_ISO)
    const existing = existingFromNext(next)
    assert.equal(notionReviewSyncNeedsPatch(existing, next), false)
  })

  it('PATCH on vajalik, kui hinne muutus', () => {
    const next = buildNotionPropertiesFromReview(review, null, REVIEW_URL, NOW_ISO)
    const existing = existingFromNext(next, { Hinne: { number: 4 } })
    assert.equal(notionReviewSyncNeedsPatch(existing, next), true)
  })

  it('samaväärne kuupäev (Z vs +00:00) ei ole muutus', () => {
    const next = buildNotionPropertiesFromReview(review, null, REVIEW_URL, NOW_ISO)
    const existing = existingFromNext(next, {
      'Arvustuse kuupäev': { date: { start: '2026-10-29T13:03:00.000+00:00' } },
    })
    assert.equal(notionReviewSyncNeedsPatch(existing, next), false)
  })
})

describe('planReviewSyncActions', () => {
  it('muutmata rida jääb vahele, uus luuakse, muutunud läheb PATCH-i', () => {
    const unchanged = buildNotionPropertiesFromReview(review, null, REVIEW_URL, OLD_SYNC_ISO)
    const changedReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'changed-id',
      starRating: 'FOUR',
    }
    const changedExisting = buildNotionPropertiesFromReview(
      { ...changedReview, starRating: 'FIVE' },
      null,
      REVIEW_URL,
      OLD_SYNC_ISO,
    )
    const newReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'brand-new-id',
      reviewer: { displayName: 'Uus Külastaja' },
    }

    const byId = new Map([
      [REVIEW_ID, { id: 'page-unchanged', properties: existingFromNext(unchanged) }],
      ['changed-id', { id: 'page-changed', properties: existingFromNext(changedExisting) }],
    ])

    const plan = planReviewSyncActions(
      [newReview, review, changedReview],
      byId,
      REVIEW_URL,
      NOW_ISO,
    )

    assert.equal(plan.creates.length, 1)
    assert.equal(plan.creates[0].reviewId, 'brand-new-id')
    assert.equal(plan.patches.length, 1)
    assert.equal(plan.patches[0].reviewId, 'changed-id')
    assert.equal(plan.skippedUnchanged, 1)
    assert.equal(plan.skippedNoId, 0)
    assert.equal(plan.creates[0].properties[GMB_REVIEW_SYNC_TIMESTAMP_PROP].date.start, NOW_ISO)
  })
})

describe('upsertReviewsIntoNotion ei PATCH-i muutmata rida', { concurrency: false }, () => {
  it('sünk ei saada PATCH-i, kui väljad ei muutunud; uue rea POST jääb alles', async () => {
    const unchangedProps = buildNotionPropertiesFromReview(review, null, REVIEW_URL, OLD_SYNC_ISO)
    const newReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'brand-new-id',
      reviewer: { displayName: 'Uus Külastaja' },
    }

    const calls: Array<{ method: string; url: string }> = []
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || 'GET').toUpperCase()
      const url = String(input)
      calls.push({ method, url })
      if (method === 'POST') return jsonResponse({ id: 'created-page', properties: {} })
      if (method === 'PATCH') return jsonResponse({ id: 'patched-page' })
      throw new Error(`unexpected ${method} ${url}`)
    }) as typeof fetch

    const summary = await upsertReviewsIntoNotion([review, newReview], {
      fetchImpl,
      apiKey: 'test-notion-key',
      databaseId: 'testdb',
      reviewUrl: REVIEW_URL,
      nowIso: NOW_ISO,
      skipLiveLookup: true,
      existingPages: [
        {
          id: 'page-unchanged',
          properties: {
            ...existingFromNext(unchangedProps),
            Staatus: { select: { name: GMB_STATUS.uus } },
          },
        },
      ],
    })

    const patches = calls.filter((call) => call.method === 'PATCH')
    const posts = calls.filter((call) => call.method === 'POST')
    assert.equal(patches.length, 0, 'muutmata rida ei tohi PATCH-ida')
    assert.equal(posts.length, 1)
    assert.equal(summary.updated, 0)
    assert.equal(summary.created, 1)
    assert.equal(summary.skippedUnchanged, 1)
    assert.equal(
      calls.some((call) => call.url.includes('test-notion-key')),
      false,
    )
  })
})
