import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  GMB_ACCESS_TOKEN_REFRESH_SKEW_SECONDS,
  getGmbAccessToken,
  logGmbAccessTokenInfo,
  probeGmbReviewGet,
  resetGmbAccessTokenCache,
  shouldReuseCachedGmbAccessToken,
  type GmbAccessTokenCache,
} from './gmb-access-token'

const ACCESS_TOKEN = 'ya29.test-access-token-value-do-not-log'
const REFRESH_TOKEN = '1//test-refresh-token-value-do-not-log'
const CLIENT_SECRET = 'test-client-secret-value-do-not-log'
const CLIENT_ID = 'test-client-id.apps.googleusercontent.com'

const SECRET_ENV = {
  GOOGLE_MY_BUSINESS_CLIENT_ID: CLIENT_ID,
  GOOGLE_MY_BUSINESS_CLIENT_SECRET: CLIENT_SECRET,
  GOOGLE_MY_BUSINESS_REFRESH_TOKEN: REFRESH_TOKEN,
  GMB_AUTH_DEBUG: '1',
}

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
  const secrets = [ACCESS_TOKEN, REFRESH_TOKEN, CLIENT_SECRET, ACCESS_TOKEN.slice(0, 12)]
  for (const secret of secrets) {
    assert.equal(blob.includes(secret), false, `log leaked secret fragment`)
  }
  assert.equal(blob.includes('"access_token"'), false)
  assert.equal(blob.includes('refresh_token'), false)
  assert.equal(blob.includes('client_secret'), false)
}

describe('shouldReuseCachedGmbAccessToken', () => {
  it('kehtiva vahemälu korral true, kui järelejäänud aeg on üle 5 minuti', () => {
    const now = 1_700_000_000_000
    const cache: GmbAccessTokenCache = {
      accessToken: ACCESS_TOKEN,
      issuedAtMs: now,
      expiresAtMs: now + 3600 * 1000,
    }
    assert.equal(shouldReuseCachedGmbAccessToken(cache, now), true)
    assert.equal(shouldReuseCachedGmbAccessToken(cache, now + 1000), true)
  })

  it('aegunud või peaaegu aegunud vahemälu korral false', () => {
    const now = 1_700_000_000_000
    const cache: GmbAccessTokenCache = {
      accessToken: ACCESS_TOKEN,
      issuedAtMs: now - 3600 * 1000,
      expiresAtMs: now + GMB_ACCESS_TOKEN_REFRESH_SKEW_SECONDS * 1000,
    }
    assert.equal(shouldReuseCachedGmbAccessToken(cache, now), false)
    assert.equal(shouldReuseCachedGmbAccessToken(null, now), false)
    assert.equal(
      shouldReuseCachedGmbAccessToken(
        { accessToken: ACCESS_TOKEN, issuedAtMs: now - 4000 * 1000, expiresAtMs: now - 1000 },
        now,
      ),
      false,
    )
  })
})

describe('getGmbAccessToken TTL', { concurrency: false }, () => {
  it('kehtiva vahemälu korral ei küsi uut tokenit', async () => {
    let tokenCalls = 0
    const cache: { current: GmbAccessTokenCache } = { current: null }
    const issuedAt = 1_700_000_000_000
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/token') && !url.includes('tokeninfo')) {
        tokenCalls++
        return jsonResponse({ access_token: ACCESS_TOKEN, expires_in: 3600 })
      }
      throw new Error(`unexpected fetch ${url}`)
    }) as typeof fetch

    const first = await getGmbAccessToken({
      fetchImpl,
      nowMs: issuedAt,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
      cache,
    })
    const second = await getGmbAccessToken({
      fetchImpl,
      nowMs: issuedAt + 30 * 1000,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
      cache,
    })
    assert.equal(first, ACCESS_TOKEN)
    assert.equal(second, ACCESS_TOKEN)
    assert.equal(tokenCalls, 1)
  })

  it('aegunud vahemälu korral küsib uue tokeni', async () => {
    let tokenCalls = 0
    const cache: { current: GmbAccessTokenCache } = { current: null }
    const issuedAt = 1_700_000_000_000
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/token') && !url.includes('tokeninfo')) {
        tokenCalls++
        return jsonResponse({
          access_token: ACCESS_TOKEN,
          expires_in: tokenCalls === 1 ? 3600 : 3599,
        })
      }
      throw new Error(`unexpected fetch ${url}`)
    }) as typeof fetch

    await getGmbAccessToken({
      fetchImpl,
      nowMs: issuedAt,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
      cache,
    })
    await getGmbAccessToken({
      fetchImpl,
      nowMs: issuedAt + (3600 - GMB_ACCESS_TOKEN_REFRESH_SKEW_SECONDS) * 1000,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
      cache,
    })
    assert.equal(tokenCalls, 2)
  })

  it('debug logib vahemälu vs oauth ja vanuse, ilma tokenita', async () => {
    const { lines, log } = collectLog()
    const cache: { current: GmbAccessTokenCache } = { current: null }
    const issuedAt = 1_700_000_000_000
    const fetchImpl = (async () =>
      jsonResponse({ access_token: ACCESS_TOKEN, expires_in: 3600 })) as typeof fetch

    await getGmbAccessToken({
      fetchImpl,
      nowMs: issuedAt,
      env: SECRET_ENV,
      log,
      cache,
    })
    await getGmbAccessToken({
      fetchImpl,
      nowMs: issuedAt + 81_000,
      env: SECRET_ENV,
      log,
      cache,
    })

    const parsed = lines.map((line) => JSON.parse(line) as Record<string, unknown>)
    assert.equal(parsed[0].source, 'oauth')
    assert.equal(parsed[0].ageSeconds, 0)
    assert.equal(parsed[1].source, 'cache')
    assert.equal(parsed[1].ageSeconds, 81)
    assertLogsDoNotLeakSecrets(lines)
  })
})

describe('GMB_AUTH_DEBUG tokeninfo ja GET', { concurrency: false }, () => {
  it('tokeninfo logib ainult scope, expires_in, aud, azp', async () => {
    const { lines, log } = collectLog()
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input)
      assert.equal(url.includes(ACCESS_TOKEN), true)
      return jsonResponse({
        scope: 'https://www.googleapis.com/auth/business.manage',
        expires_in: '3500',
        aud: CLIENT_ID,
        azp: CLIENT_ID,
        access_token: ACCESS_TOKEN,
        extra_secret: REFRESH_TOKEN,
      })
    }) as typeof fetch

    await logGmbAccessTokenInfo(ACCESS_TOKEN, {
      fetchImpl,
      env: SECRET_ENV,
      log,
    })

    assert.equal(lines.length, 1)
    const payload = JSON.parse(lines[0]) as Record<string, unknown>
    assert.equal(payload.note, 'GMB tokeninfo')
    assert.equal(payload.httpStatus, 200)
    assert.equal(payload.scope, 'https://www.googleapis.com/auth/business.manage')
    assert.equal(payload.expires_in, '3500')
    assert.equal(payload.aud, CLIENT_ID)
    assert.equal(payload.azp, CLIENT_ID)
    assert.equal('access_token' in payload, false)
    assert.equal('extra_secret' in payload, false)
    assertLogsDoNotLeakSecrets(lines)
  })

  it('ilma GMB_AUTH_DEBUG=1 ei tee tokeninfo ega GET päringut', async () => {
    let calls = 0
    const fetchImpl = (async () => {
      calls++
      return jsonResponse({})
    }) as typeof fetch
    await logGmbAccessTokenInfo(ACCESS_TOKEN, {
      fetchImpl,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
    })
    const status = await probeGmbReviewGet({
      accountId: 'acc',
      locationId: 'loc',
      reviewId: 'rev-1',
      accessToken: ACCESS_TOKEN,
      fetchImpl,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
    })
    assert.equal(calls, 0)
    assert.equal(status, null)
  })

  it('GET enne PUT-i logib ainult staatuse, mitte tokenit ega keha', async () => {
    const { lines, log } = collectLog()
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      assert.equal(url.includes('/reply'), false)
      assert.match(url, /\/reviews\/rev-1$/)
      const auth = new Headers(init?.headers).get('Authorization')
      assert.equal(auth, `Bearer ${ACCESS_TOKEN}`)
      return jsonResponse({ comment: 'secret-review-body', name: 'accounts/x' }, true, 200)
    }) as typeof fetch

    const status = await probeGmbReviewGet({
      accountId: 'acc',
      locationId: 'loc',
      reviewId: 'rev-1',
      accessToken: ACCESS_TOKEN,
      fetchImpl,
      env: SECRET_ENV,
      log,
    })
    assert.equal(status, 200)
    const payload = JSON.parse(lines[0]) as Record<string, unknown>
    assert.equal(payload.note, 'GMB auth debug GET before PUT')
    assert.equal(payload.httpStatus, 200)
    assert.equal('comment' in payload, false)
    assertLogsDoNotLeakSecrets(lines)
    assert.equal(lines[0].includes('secret-review-body'), false)
  })
})

describe('resetGmbAccessTokenCache', { concurrency: false }, () => {
  it('tühjendab mooduli vahemälu', async () => {
    resetGmbAccessTokenCache()
    let tokenCalls = 0
    const fetchImpl = (async () => {
      tokenCalls++
      return jsonResponse({ access_token: ACCESS_TOKEN, expires_in: 3600 })
    }) as typeof fetch
    await getGmbAccessToken({
      fetchImpl,
      nowMs: 1,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
    })
    resetGmbAccessTokenCache()
    await getGmbAccessToken({
      fetchImpl,
      nowMs: 2,
      env: { ...SECRET_ENV, GMB_AUTH_DEBUG: undefined },
    })
    assert.equal(tokenCalls, 2)
  })
})
