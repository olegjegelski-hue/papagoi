import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { fetchAllGoogleReviewsFromGMB } from '../scripts/sync-google-reviews-to-notion'
import {
  errorLooksLikeGmbUnauthorized,
  GMB_TOKEN_INVALID_LOG,
  GOOGLE_API_NO_STORE,
  googleApiFetch,
  googleApiRequestInit,
  isGmbUnauthorizedStatus,
  logGmbTokenInvalid,
} from './google-api-fetch'

const ACCESS_TOKEN = 'ya29.test-access-token-value-do-not-log'
const REFRESH_TOKEN = '1//test-refresh-token-value-do-not-log'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

function collectLog() {
  const lines: string[] = []
  const push = (message?: unknown) => {
    lines.push(typeof message === 'string' ? message : JSON.stringify(message))
  }
  return {
    lines,
    log: {
      log: push,
      warn: push,
      error: push,
    },
  }
}

function assertLogsDoNotLeakSecrets(lines: string[]) {
  const blob = lines.join('\n')
  assert.equal(blob.includes(ACCESS_TOKEN), false)
  assert.equal(blob.includes(REFRESH_TOKEN), false)
  assert.equal(blob.includes(ACCESS_TOKEN.slice(0, 4)), false)
}

describe('googleApiRequestInit', () => {
  it('lisab alati cache: no-store ja next.revalidate 0', () => {
    const init = googleApiRequestInit({
      method: 'GET',
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    })
    assert.equal(init.cache, GOOGLE_API_NO_STORE)
    assert.equal(init.cache, 'no-store')
    assert.equal(init.next?.revalidate, 0)
    assert.equal(init.method, 'GET')
    assert.equal(new Headers(init.headers).get('Authorization'), `Bearer ${ACCESS_TOKEN}`)
  })

  it('kirjutab kutsuja cache ja revalidate üle', () => {
    const init = googleApiRequestInit({
      cache: 'force-cache',
      next: { revalidate: 3600 },
      method: 'POST',
      body: 'grant_type=refresh_token',
    })
    assert.equal(init.cache, 'no-store')
    assert.equal(init.next?.revalidate, 0)
    assert.equal(init.method, 'POST')
    assert.equal(init.body, 'grant_type=refresh_token')
  })
})

describe('googleApiFetch', () => {
  it('annab fetchImpl-ile alati cache: no-store, ka kui kutsuja palus vahemälu', async () => {
    let seen: RequestInit | undefined
    const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      seen = init
      return jsonResponse({ ok: true })
    }) as typeof fetch

    await googleApiFetch(
      'https://mybusiness.googleapis.com/v4/accounts/a/locations/l/reviews',
      {
        cache: 'force-cache',
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        method: 'GET',
      },
      fetchImpl,
    )

    assert.equal(seen?.cache, 'no-store')
    assert.equal((seen as { next?: { revalidate?: number } })?.next?.revalidate, 0)
    assert.equal(new Headers(seen?.headers).get('Authorization'), `Bearer ${ACCESS_TOKEN}`)
    assert.equal(seen?.method, 'GET')
  })
})

describe('GMB 401', () => {
  it('tunneb 401 ja UNAUTHENTICATED ära, logib ilma tokenita', () => {
    assert.equal(isGmbUnauthorizedStatus(401), true)
    assert.equal(isGmbUnauthorizedStatus(403), false)
    assert.equal(
      errorLooksLikeGmbUnauthorized(
        new Error('Failed to fetch Google reviews from GMB API: 401 - { "error": "UNAUTHENTICATED" }'),
      ),
      true,
    )
    assert.equal(errorLooksLikeGmbUnauthorized(new Error('Failed 500')), false)

    const { lines, log } = collectLog()
    logGmbTokenInvalid(log)
    assert.equal(lines.length, 1)
    assert.equal(lines[0], GMB_TOKEN_INVALID_LOG)
    assert.equal(lines[0].includes('GMB token kehtetu — vaja uut refresh tokenit'), true)
    assertLogsDoNotLeakSecrets(lines)
  })
})

describe('fetchAllGoogleReviewsFromGMB 401', { concurrency: false }, () => {
  it('viskab vea esimesel 401 lehel, logib kehtetu tokeni ja ei tagasta vana nimekirja', async () => {
    const { lines, log } = collectLog()
    let listCalls = 0
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      listCalls++
      assert.equal(init?.cache, 'no-store')
      const url = String(input)
      assert.match(url, /mybusiness\.googleapis\.com/)
      return jsonResponse({ error: { status: 'UNAUTHENTICATED' } }, false, 401)
    }) as typeof fetch

    await assert.rejects(
      () =>
        fetchAllGoogleReviewsFromGMB({
          fetchImpl,
          accessToken: ACCESS_TOKEN,
          accountId: 'acc',
          locationId: 'loc',
          log,
          skipAuthProbe: true,
        }),
      (error: unknown) => {
        assert.equal(error instanceof Error, true)
        const message = error instanceof Error ? error.message : ''
        assert.match(message, /Failed to fetch Google reviews from GMB API: 401/)
        return true
      },
    )

    assert.equal(listCalls, 1)
    const blob = lines.join('\n')
    assert.equal(blob.includes(GMB_TOKEN_INVALID_LOG), true)
    assert.equal(blob.includes('Fetched '), false)
    assert.equal(
      lines.some((line) => {
        try {
          const parsed = JSON.parse(line) as { note?: string; httpStatus?: number }
          return parsed.note === 'GMB reviews list page' && parsed.httpStatus === 401
        } catch {
          return false
        }
      }),
      true,
    )
    assertLogsDoNotLeakSecrets(lines)
  })

  it('õnnestunud lehel logib httpStatus ja elapsedMs; 401 teisel lehel katkestab', async () => {
    const { lines, log } = collectLog()
    let listCalls = 0
    const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      listCalls++
      assert.equal(init?.cache, 'no-store')
      if (listCalls === 1) {
        return jsonResponse({
          reviews: [{ reviewId: 'rev-page-1', comment: 'do-not-log-review' }],
          nextPageToken: 'next-page-token',
        })
      }
      return jsonResponse({ error: { status: 'UNAUTHENTICATED' } }, false, 401)
    }) as typeof fetch

    await assert.rejects(
      () =>
        fetchAllGoogleReviewsFromGMB({
          fetchImpl,
          accessToken: ACCESS_TOKEN,
          accountId: 'acc',
          locationId: 'loc',
          log,
          skipAuthProbe: true,
        }),
      /GMB API: 401/,
    )

    assert.equal(listCalls, 2)
    const blob = lines.join('\n')
    assert.equal(blob.includes(GMB_TOKEN_INVALID_LOG), true)
    assert.equal(blob.includes('Fetched 793'), false)
    assert.equal(blob.includes('do-not-log-review'), false)
    assert.equal(blob.includes('next-page-token'), false)
    const pageLogs = lines
      .map((line) => {
        try {
          return JSON.parse(line) as Record<string, unknown>
        } catch {
          return null
        }
      })
      .filter((row): row is Record<string, unknown> => row != null && row.note === 'GMB reviews list page')
    assert.equal(pageLogs.length, 2)
    assert.equal(pageLogs[0].httpStatus, 200)
    assert.equal(pageLogs[0].page, 1)
    assert.equal(pageLogs[1].httpStatus, 401)
    assert.equal(pageLogs[1].page, 2)
    assertLogsDoNotLeakSecrets(lines)
  })

  it('eduka nimekirja lõpus logib elapsedMs ja ei peida lehe staatust', async () => {
    const { lines, log } = collectLog()
    const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(init?.cache, 'no-store')
      return jsonResponse({
        reviews: [{ reviewId: 'rev-ok' }],
      })
    }) as typeof fetch

    const reviews = await fetchAllGoogleReviewsFromGMB({
      fetchImpl,
      accessToken: ACCESS_TOKEN,
      accountId: 'acc',
      locationId: 'loc',
      log,
      skipAuthProbe: true,
    })
    assert.equal(reviews.length, 1)
    const done = lines
      .map((line) => {
        try {
          return JSON.parse(line) as Record<string, unknown>
        } catch {
          return null
        }
      })
      .find((row) => row?.note === 'GMB reviews list done')
    assert.equal(done?.pages, 1)
    assert.equal(done?.reviews, 1)
    assert.equal(typeof done?.elapsedMs, 'number')
    assert.equal((done?.elapsedMs as number) >= 0, true)
    assertLogsDoNotLeakSecrets(lines)
  })
})
