import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GMB_STATUS } from './gmb-review-workflow'
import {
  NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK,
  NOTION_VERSION_DATA_SOURCES,
  confirmedUnpostedFilter,
  gmbDebugQueriesEnabled,
  googleReviewIdEqualsFilter,
  pageMatchesPendingReply,
  parseDataSourceIdsFromDatabaseResponse,
  pendingReplyFilter,
  queryNotionReviewPages,
  recoverPendingPages,
  recoveredViaNeedsWarning,
  resolveReviewDataSourceIds,
  type NotionReviewPage,
} from './notion-reviews-query'

const SAMPLE_REVIEW_ID = 'sample-google-review-id'

function rich(text: string) {
  return { rich_text: [{ plain_text: text, text: { content: text } }] }
}

function page(partial: {
  id: string
  status?: string
  confirmed?: boolean
  posted?: boolean
  reply?: string
  reviewId?: string
}): NotionReviewPage {
  return {
    id: partial.id,
    properties: {
      Staatus: { select: { name: partial.status ?? GMB_STATUS.ready } },
      Kinnitatud: { checkbox: partial.confirmed ?? true },
      'Vastus postitatud?': { checkbox: partial.posted ?? false },
      Vastus: rich(partial.reply ?? 'Tänan — papagoid ootavad teid jälle.'),
      'Google review ID': rich(partial.reviewId ?? SAMPLE_REVIEW_ID),
    },
  }
}

describe('parseDataSourceIdsFromDatabaseResponse', () => {
  it('loeb data_sources massiivi ja eemaldab duplikaadid', () => {
    assert.deepEqual(
      parseDataSourceIdsFromDatabaseResponse({
        data_sources: [
          { id: NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK, name: 'Google arvustused' },
          { id: 'a37b127d017d429e90259d24875b7884' },
          { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
        ],
      }),
      [NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
    )
  })

  it('tühja või vale vastuse korral tühi nimekiri', () => {
    assert.deepEqual(parseDataSourceIdsFromDatabaseResponse(null), [])
    assert.deepEqual(parseDataSourceIdsFromDatabaseResponse({}), [])
  })
})

describe('filters', () => {
  it('pendingReplyFilter sisaldab viit AND-tingimust, confirmedUnpostedFilter ilma Staatuseta', () => {
    const pending = pendingReplyFilter() as { and: Array<Record<string, unknown>> }
    assert.equal(pending.and.length, 5)
    assert.deepEqual(pending.and[4], {
      property: 'Staatus',
      select: { equals: 'Valmis postitamiseks' },
    })
    const loose = confirmedUnpostedFilter() as { and: Array<Record<string, unknown>> }
    assert.equal(loose.and.length, 2)
    assert.equal(
      loose.and.some((item) => item.property === 'Staatus'),
      false,
    )
  })

  it('googleReviewIdEqualsFilter otsib antud Google review ID-d', () => {
    assert.deepEqual(googleReviewIdEqualsFilter(SAMPLE_REVIEW_ID), {
      property: 'Google review ID',
      rich_text: { equals: SAMPLE_REVIEW_ID },
    })
  })
})

describe('pageMatchesPendingReply', () => {
  it('võtab Valmis postitamiseks + kinnitatud + vastusega read', () => {
    assert.equal(pageMatchesPendingReply(page({ id: 'kirill' })), true)
  })

  it('lükkab 1–3★ värava asemel mustandi ja postitatud read tagasi (filtritasand)', () => {
    assert.equal(
      pageMatchesPendingReply(page({ id: 'draft', status: GMB_STATUS.draft })),
      false,
    )
    assert.equal(pageMatchesPendingReply(page({ id: 'posted', posted: true })), false)
    assert.equal(pageMatchesPendingReply(page({ id: 'empty', reply: '' })), false)
  })

  it('loeb ka status-tüüpi Staatus välja (mitte ainult select)', () => {
    const statusTyped: NotionReviewPage = {
      id: 'status-prop',
      properties: {
        Staatus: { status: { name: GMB_STATUS.ready } },
        Kinnitatud: { checkbox: true },
        'Vastus postitatud?': { checkbox: false },
        Vastus: rich('ok'),
        'Google review ID': rich(SAMPLE_REVIEW_ID),
      },
    }
    assert.equal(pageMatchesPendingReply(statusTyped), true)
  })
})

describe('recoverPendingPages', () => {
  const ready = page({ id: 'ready-1' })
  const draft = page({ id: 'draft-1', status: GMB_STATUS.draft })

  it('kasutab Notioni 5-filtrit, kui see tagastas ridu (viik eelistab filtrit)', () => {
    const result = recoverPendingPages({
      pending: [ready],
      withoutStatus: [ready, draft],
      allPages: [ready, draft],
    })
    assert.equal(result.recoveredVia, 'pending-filter')
    assert.deepEqual(
      result.pages.map((p) => p.id),
      ['ready-1'],
    )
  })

  it('kui 5-filter on poolik, võtab suurema JS-iga kinnitatud hulga', () => {
    const ready2 = page({ id: 'ready-2', reviewId: 'other-id' })
    const result = recoverPendingPages({
      pending: [ready],
      withoutStatus: [],
      allPages: [draft, ready, ready2],
    })
    assert.equal(result.recoveredVia, 'all-pages-js')
    assert.deepEqual(
      result.pages.map((p) => p.id),
      ['ready-1', 'ready-2'],
    )
  })

  it('kui 5-filter on tühi, võtab kinnitatud+postitamata hulgast JS-iga Valmis postitamiseks', () => {
    const result = recoverPendingPages({
      pending: [],
      withoutStatus: [ready, draft],
      allPages: [],
    })
    assert.equal(result.recoveredVia, 'without-status')
    assert.deepEqual(
      result.pages.map((p) => p.id),
      ['ready-1'],
    )
  })

  it('kui ka ilma staatuseta on tühi, filtreerib fetchAll hulga JS-is', () => {
    const result = recoverPendingPages({
      pending: [],
      withoutStatus: [],
      allPages: [draft, ready],
    })
    assert.equal(result.recoveredVia, 'all-pages-js')
    assert.equal(result.pages.length, 1)
    assert.equal(result.pages[0].id, 'ready-1')
  })

  it('recoveredVia !== pending-filter on hoiatus', () => {
    assert.equal(recoveredViaNeedsWarning('pending-filter'), false)
    assert.equal(recoveredViaNeedsWarning('without-status'), true)
    assert.equal(recoveredViaNeedsWarning('all-pages-js'), true)
  })
})

describe('gmbDebugQueriesEnabled', () => {
  it('on ainult GMB_DEBUG_QUERIES=1 korral', () => {
    assert.equal(gmbDebugQueriesEnabled({}), false)
    assert.equal(gmbDebugQueriesEnabled({ GMB_DEBUG_QUERIES: '0' }), false)
    assert.equal(gmbDebugQueriesEnabled({ GMB_DEBUG_QUERIES: '1' }), true)
  })
})

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

describe('resolveReviewDataSourceIds', () => {
  it('avastab GET /v1/databases data_sources ja lisab teadaoleva ID', async () => {
    const urls: string[] = []
    const result = await resolveReviewDataSourceIds({
      apiKey: 'secret',
      databaseId: 'c23744e824d54b4694a59d1cb118979d',
      extraIds: ['cccccccc-cccc-cccc-cccc-cccccccccccc'],
      fetchImpl: (async (input: RequestInfo | URL) => {
        urls.push(String(input))
        return jsonResponse({
          data_sources: [{ id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'muu' }],
        })
      }) as typeof fetch,
    })
    assert.match(urls[0], /\/v1\/databases\/c23744e824d54b4694a59d1cb118979d$/)
    assert.equal(result.source, 'database')
    assert.deepEqual(result.ids, [
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK,
    ])
  })
})

describe('queryNotionReviewPages', () => {
  it('päring käib POST /v1/data_sources/{id}/query päisega 2025-09-03', async () => {
    const calls: Array<{ url: string; version: string | null; body: Record<string, unknown> }> = []
    const result = await queryNotionReviewPages({
      apiKey: 'secret',
      databaseId: 'c23744e824d54b4694a59d1cb118979d',
      dataSourceIds: [NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK],
      filter: pendingReplyFilter(),
      fetchImpl: (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        const headers = new Headers(init?.headers)
        calls.push({
          url,
          version: headers.get('Notion-Version'),
          body: init?.body ? JSON.parse(String(init.body)) : {},
        })
        return jsonResponse({
          results: [{ id: '411a1c6a-247e-81c1-a27f-de98442663d7', properties: page({ id: 'x' }).properties }],
          has_more: false,
        })
      }) as typeof fetch,
    })
    assert.equal(result.queryPath, 'data_sources')
    assert.equal(result.pages.length, 1)
    assert.equal(calls.length, 1)
    assert.equal(
      calls[0].url,
      `https://api.notion.com/v1/data_sources/${NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK}/query`,
    )
    assert.equal(calls[0].version, NOTION_VERSION_DATA_SOURCES)
    assert.equal((calls[0].body.filter as { and: unknown[] }).and.length, 5)
  })

  it('kui data_sources ebaõnnestub, langeb databases/{id}/query peale', async () => {
    const urls: string[] = []
    const result = await queryNotionReviewPages({
      apiKey: 'secret',
      databaseId: 'c23744e824d54b4694a59d1cb118979d',
      dataSourceIds: [NOTION_REVIEWS_DATA_SOURCE_ID_FALLBACK],
      fetchImpl: (async (input: RequestInfo | URL) => {
        const url = String(input)
        urls.push(url)
        if (url.includes('/data_sources/')) {
          return jsonResponse({ message: 'not found' }, false, 404)
        }
        return jsonResponse({
          results: [{ id: 'legacy-page', properties: {} }],
          has_more: false,
        })
      }) as typeof fetch,
    })
    assert.equal(result.queryPath, 'databases')
    assert.equal(result.pages[0].id, 'legacy-page')
    assert.equal(urls.some((u) => u.includes('/databases/c23744e824d54b4694a59d1cb118979d/query')), true)
  })
})
