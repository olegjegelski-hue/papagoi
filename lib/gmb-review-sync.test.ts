import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GMB_STATUS } from './gmb-review-workflow'
import { richTextPlainFromProp } from './gmb-review-id'
import {
  applyReviewSyncPatchLimit,
  buildNotionPropertiesFromReview,
  GMB_REVIEW_SYNC_TIMESTAMP_PROP,
  notionReviewSyncFieldDiffs,
  notionReviewSyncNeedsPatch,
  planReviewSyncActions,
  type GoogleReviewForSync,
} from './gmb-review-sync'
import { upsertReviewsIntoNotion } from '../scripts/sync-google-reviews-to-notion'

const REVIEW_URL = 'https://g.page/r/test/review'
const NOW_ISO = '2026-11-14T16:00:00.000Z'
const OLD_SYNC_ISO = '2026-01-01T00:00:00.000Z'
const REVIEW_ID = 'AbFvOqkjZDiaYIDpg0XwomOjBOBs5DlbTJdDyGLiOOqM1H-c6nBBFGisbVXVGZDTrWY00Lio2g9yAQ'

const ANNOTATIONS = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: 'default',
} as const

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

function notionTextChunks(content: string, splitAt = 2000) {
  if (!content) return []
  const chunks = []
  for (let i = 0; i < content.length; i += splitAt) {
    const part = content.slice(i, i + splitAt)
    chunks.push({
      type: 'text',
      text: { content: part, link: null },
      annotations: { ...ANNOTATIONS },
      plain_text: part,
      href: null,
    })
  }
  return chunks
}

/** Päris Notion GET-kuju (id, type, annotations, plain_text, date.end). */
function asNotionRetrievedProperties(
  writeProps: Record<string, any>,
  dateStarts: Record<string, string | null> = {},
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, prop] of Object.entries(writeProps)) {
    if (!prop || typeof prop !== 'object') continue
    if ('title' in prop) {
      const content = richTextPlainFromProp(prop)
      out[key] = { id: 'title', type: 'title', title: notionTextChunks(content) }
    } else if ('rich_text' in prop) {
      const content = richTextPlainFromProp(prop)
      out[key] = { id: key, type: 'rich_text', rich_text: notionTextChunks(content) }
    } else if ('number' in prop) {
      out[key] = { id: key, type: 'number', number: prop.number ?? null }
    } else if ('date' in prop) {
      const start = key in dateStarts ? dateStarts[key] : (prop.date?.start ?? null)
      out[key] = {
        id: key,
        type: 'date',
        date: start ? { start, end: null, time_zone: null } : null,
      }
    } else if ('url' in prop) {
      out[key] = { id: key, type: 'url', url: prop.url ?? null }
    } else if ('select' in prop) {
      const name = prop.select?.name
      out[key] = {
        id: key,
        type: 'select',
        select: name ? { id: `opt-${key}`, name, color: 'blue' } : null,
      }
    } else if ('checkbox' in prop) {
      out[key] = { id: key, type: 'checkbox', checkbox: prop.checkbox === true }
    }
  }
  return out
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

  it('päris Notioni kuju + millisekundid vs .000+00:00 ei ole muutus', () => {
    const timed: GoogleReviewForSync = {
      ...review,
      createTime: '2026-11-01T10:00:00.123Z',
    }
    const next = buildNotionPropertiesFromReview(timed, null, REVIEW_URL, NOW_ISO)
    const existing = asNotionRetrievedProperties(existingFromNext(next), {
      'Arvustuse kuupäev': '2026-11-01T10:00:00.000+00:00',
      [GMB_REVIEW_SYNC_TIMESTAMP_PROP]: '2026-01-01T00:00:00.000+00:00',
    })
    assert.equal(notionReviewSyncNeedsPatch(existing, next), false)
  })

  it('päris Notioni kuju + ainult kuupäev ei ole muutus', () => {
    const timed: GoogleReviewForSync = {
      ...review,
      createTime: '2026-11-01T10:00:00.123Z',
    }
    const next = buildNotionPropertiesFromReview(timed, null, REVIEW_URL, NOW_ISO)
    const existing = asNotionRetrievedProperties(existingFromNext(next), {
      'Arvustuse kuupäev': '2026-11-01',
    })
    assert.equal(notionReviewSyncNeedsPatch(existing, next), false)
  })

  it('pikk tekst tükkideks jagatuna ei ole muutus', () => {
    const longComment = `${'Tere papagoid! '.repeat(140)}Lõpp.`
    const longReview: GoogleReviewForSync = { ...review, comment: longComment }
    const next = buildNotionPropertiesFromReview(longReview, null, REVIEW_URL, NOW_ISO)
    const existing = asNotionRetrievedProperties(existingFromNext(next))
    const stored = existing['Arvustuse tekst'] as { rich_text: unknown[] }
    assert.ok(stored.rich_text.length >= 2, 'Notion jagab pika teksti tükkideks')
    assert.equal(notionReviewSyncNeedsPatch(existing, next), false)
  })

  it('reavahetus/tühik rich-textis ei ole muutus', () => {
    const next = buildNotionPropertiesFromReview(
      { ...review, comment: 'Esimene lõik.\nTeine lõik.' },
      null,
      REVIEW_URL,
      NOW_ISO,
    )
    const existing = asNotionRetrievedProperties(existingFromNext(next))
    const textProp = existing['Arvustuse tekst'] as {
      rich_text: Array<{ plain_text: string; text: { content: string } }>
    }
    textProp.rich_text[0].plain_text = 'Esimene lõik.\r\nTeine lõik. '
    textProp.rich_text[0].text.content = 'Esimene lõik.\r\nTeine lõik. '
    assert.equal(notionReviewSyncNeedsPatch(existing, next), false)
  })

  it('puuduv väli vs tühi väärtus ei ole muutus', () => {
    const next = buildNotionPropertiesFromReview(review, null, REVIEW_URL, NOW_ISO)
    const existing = asNotionRetrievedProperties(existingFromNext(next))
    delete existing['Google review URL']
    const nextEmptyUrl = { ...next, 'Google review URL': { url: null } }
    assert.equal(notionReviewSyncNeedsPatch(existing, nextEmptyUrl), false)
  })

  it('select id/värviga (päris Notion) ei ole muutus', () => {
    const next = buildNotionPropertiesFromReview(review, null, REVIEW_URL, NOW_ISO)
    const existing = asNotionRetrievedProperties(existingFromNext(next))
    assert.equal(notionReviewSyncNeedsPatch(existing, next), false)
  })

  it('muutunud vastus (GMB reply) on PATCH', () => {
    const next = buildNotionPropertiesFromReview(
      {
        ...review,
        reviewReply: { comment: 'Aitäh külastamast!', updateTime: '2026-11-02T09:00:00.456Z' },
      },
      null,
      REVIEW_URL,
      NOW_ISO,
    )
    const existing = asNotionRetrievedProperties(
      existingFromNext(buildNotionPropertiesFromReview(review, null, REVIEW_URL, OLD_SYNC_ISO)),
    )
    assert.equal(notionReviewSyncNeedsPatch(existing, next), true)
    const diffs = notionReviewSyncFieldDiffs(existing, next)
    assert.ok(diffs.some((d) => d.name === 'Staatus' && d.type === 'select'))
    assert.ok(diffs.some((d) => d.name === 'Vastus postitatud?' && d.type === 'checkbox'))
    assert.ok(diffs.some((d) => d.name === 'Vastuse postitamise kuupäev' && d.type === 'date'))
    assert.equal(
      diffs.some((d) => JSON.stringify(d).includes('Aitäh')),
      false,
    )
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

  it('PATCH järjekord: staatus/vastus/hinne enne nime muutust', () => {
    const nameReview: GoogleReviewForSync = { ...review, reviewId: 'name-id' }
    const ratingReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'rating-id',
      starRating: 'FOUR',
    }
    const replyReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'reply-id',
      reviewReply: { comment: 'Aitäh!', updateTime: '2026-11-02T09:00:00Z' },
    }

    const byId = new Map([
      [
        'name-id',
        {
          id: 'page-name',
          properties: existingFromNext(
            buildNotionPropertiesFromReview(
              { ...nameReview, reviewer: { displayName: 'Vana Nimi' } },
              null,
              REVIEW_URL,
              OLD_SYNC_ISO,
            ),
          ),
        },
      ],
      [
        'rating-id',
        {
          id: 'page-rating',
          properties: existingFromNext(
            buildNotionPropertiesFromReview(
              { ...ratingReview, starRating: 'FIVE' },
              null,
              REVIEW_URL,
              OLD_SYNC_ISO,
            ),
          ),
        },
      ],
      [
        'reply-id',
        {
          id: 'page-reply',
          properties: existingFromNext(
            buildNotionPropertiesFromReview(
              { ...replyReview, reviewReply: null },
              null,
              REVIEW_URL,
              OLD_SYNC_ISO,
            ),
          ),
        },
      ],
    ])

    const plan = planReviewSyncActions(
      [nameReview, ratingReview, replyReview],
      byId,
      REVIEW_URL,
      NOW_ISO,
    )

    assert.deepEqual(
      plan.patches.map((item) => item.reviewId),
      ['rating-id', 'reply-id', 'name-id'],
    )
  })
})

describe('applyReviewSyncPatchLimit', () => {
  it('piirab partii ja loendab edasilükatud PATCH-id', () => {
    const patches = [
      { reviewId: 'a' },
      { reviewId: 'b' },
      { reviewId: 'c' },
    ] as unknown as Parameters<typeof applyReviewSyncPatchLimit>[0]
    const limited = applyReviewSyncPatchLimit(patches, 2)
    assert.equal(limited.patches.length, 2)
    assert.equal(limited.deferredPatches, 1)
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

  it('päris Notioni kujuga muutmata rida ei saa PATCH-i; muutunud vastus saab', async () => {
    const unchangedProps = asNotionRetrievedProperties(
      existingFromNext(buildNotionPropertiesFromReview(review, null, REVIEW_URL, OLD_SYNC_ISO)),
      {
        'Arvustuse kuupäev': '2026-10-29T13:03:00.000+00:00',
      },
    )
    const replied: GoogleReviewForSync = {
      ...review,
      reviewId: 'reply-id',
      reviewReply: { comment: 'Aitäh külastamast!', updateTime: '2026-11-02T09:00:00.123Z' },
    }
    const repliedExisting = asNotionRetrievedProperties(
      existingFromNext(
        buildNotionPropertiesFromReview(
          { ...replied, reviewReply: null },
          null,
          REVIEW_URL,
          OLD_SYNC_ISO,
        ),
      ),
    )

    const calls: Array<{ method: string }> = []
    const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || 'GET').toUpperCase()
      calls.push({ method })
      if (method === 'POST') return jsonResponse({ id: 'created-page', properties: {} })
      if (method === 'PATCH') return jsonResponse({ id: 'patched-page' })
      throw new Error(`unexpected ${method}`)
    }) as typeof fetch

    const summary = await upsertReviewsIntoNotion([review, replied], {
      fetchImpl,
      apiKey: 'test-notion-key',
      databaseId: 'testdb',
      reviewUrl: REVIEW_URL,
      nowIso: NOW_ISO,
      skipLiveLookup: true,
      existingPages: [
        { id: 'page-unchanged', properties: unchangedProps },
        { id: 'page-reply', properties: repliedExisting },
      ],
    })

    assert.equal(calls.filter((call) => call.method === 'PATCH').length, 1)
    assert.equal(calls.filter((call) => call.method === 'POST').length, 0)
    assert.equal(summary.updated, 1)
    assert.equal(summary.skippedUnchanged, 1)
    assert.equal(summary.created, 0)
  })

  it('partii piirang: loomine enne PATCH-e, ülejäänud jäävad, Sync complete logitakse', async () => {
    const nameReview: GoogleReviewForSync = { ...review, reviewId: 'name-id' }
    const ratingReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'rating-id',
      starRating: 'FOUR',
    }
    const replyReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'reply-id',
      reviewReply: { comment: 'Aitäh!', updateTime: '2026-11-02T09:00:00Z' },
    }
    const newReview: GoogleReviewForSync = {
      ...review,
      reviewId: 'brand-new-id',
      reviewer: { displayName: 'Uus Külastaja' },
    }

    const calls: Array<{ method: string }> = []
    const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || 'GET').toUpperCase()
      calls.push({ method })
      if (method === 'POST') return jsonResponse({ id: 'created-page', properties: {} })
      if (method === 'PATCH') return jsonResponse({ id: 'patched-page' })
      throw new Error(`unexpected ${method}`)
    }) as typeof fetch

    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }

    let summary: Awaited<ReturnType<typeof upsertReviewsIntoNotion>>
    try {
      summary = await upsertReviewsIntoNotion(
        [nameReview, ratingReview, replyReview, newReview],
        {
          fetchImpl,
          apiKey: 'test-notion-key',
          databaseId: 'testdb',
          reviewUrl: REVIEW_URL,
          nowIso: NOW_ISO,
          skipLiveLookup: true,
          patchLimit: 2,
          existingPages: [
            {
              id: 'page-name',
              properties: existingFromNext(
                buildNotionPropertiesFromReview(
                  { ...nameReview, reviewer: { displayName: 'Vana Nimi' } },
                  null,
                  REVIEW_URL,
                  OLD_SYNC_ISO,
                ),
              ),
            },
            {
              id: 'page-rating',
              properties: existingFromNext(
                buildNotionPropertiesFromReview(
                  { ...ratingReview, starRating: 'FIVE' },
                  null,
                  REVIEW_URL,
                  OLD_SYNC_ISO,
                ),
              ),
            },
            {
              id: 'page-reply',
              properties: existingFromNext(
                buildNotionPropertiesFromReview(
                  { ...replyReview, reviewReply: null },
                  null,
                  REVIEW_URL,
                  OLD_SYNC_ISO,
                ),
              ),
            },
          ],
        },
      )
    } finally {
      console.log = originalLog
    }

    assert.equal(summary.created, 1)
    assert.equal(summary.updated, 2)
    assert.equal(summary.deferredPatches, 1)
    assert.equal(calls.filter((call) => call.method === 'POST').length, 1)
    assert.equal(calls.filter((call) => call.method === 'PATCH').length, 2)
    assert.equal(calls[0].method, 'POST', 'loomine käib enne PATCH-e')
    assert.ok(logs.some((line) => line.includes('"note":"reviewSyncPlan"')))
    const planLine = logs.find((line) => line.includes('"note":"reviewSyncPlan"')) || ''
    const plan = JSON.parse(planLine) as {
      creates: number
      patches: number
      skippedUnchanged: number
      skippedNoId: number
    }
    assert.equal(plan.creates, 1)
    assert.equal(plan.patches, 3)
    assert.ok(logs.some((line) => line === '1 patchi jäi järgmisele korrale'))
    assert.ok(logs.some((line) => line.startsWith('Sync complete.')))
    assert.equal(
      logs.some((line) => line.includes('Aitäh')),
      false,
      'vastuse teksti ei tohi logida',
    )
    const diffLines = logs.filter((line) => line.includes('"note":"patchFieldDiff"'))
    assert.ok(diffLines.length >= 1)
    for (const line of diffLines) {
      const parsed = JSON.parse(line) as { fields: string[] }
      assert.ok(parsed.fields.every((field) => /^.+: [a-z_]+$/.test(field)))
    }
  })
})
