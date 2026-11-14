/**
 * GMB OAuth access token: TTL-iga vahemälu + valikuline auth-debug (ilma saladusteta).
 * Ära logi access tokenit, refresh tokenit ega client secretit — ka mitte kärbitult.
 */

import {
  gmbReviewResourceUrl,
  gmbReviewsListUrl,
  googleReviewIdFromGmbReview,
  normalizedReviewIdShape,
} from '@/lib/gmb-review-id'
import { googleApiFetch, type FetchLike } from '@/lib/google-api-fetch'

type Logger = Pick<Console, 'log' | 'warn' | 'error'>

type EnvLike = Record<string, string | undefined>

export type GmbAccessTokenCache = {
  accessToken: string
  issuedAtMs: number
  expiresAtMs: number
} | null

type CacheBox = { current: GmbAccessTokenCache }

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_TOKENINFO_ENDPOINT = 'https://oauth2.googleapis.com/tokeninfo'

/** Küsi uus token, kui kehtivusest on jäänud alla 5 minuti. */
export const GMB_ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 5 * 60

const DEFAULT_EXPIRES_IN_SECONDS = 3600

const moduleCache: CacheBox = { current: null }

export function resetGmbAccessTokenCache() {
  moduleCache.current = null
}

export function isGmbAuthDebugEnabled(env: EnvLike = process.env): boolean {
  return env.GMB_AUTH_DEBUG === '1'
}

export function shouldReuseCachedGmbAccessToken(
  cache: GmbAccessTokenCache,
  nowMs: number,
): boolean {
  if (!cache) return false
  const remainingSeconds = Math.floor((cache.expiresAtMs - nowMs) / 1000)
  return remainingSeconds > GMB_ACCESS_TOKEN_REFRESH_SKEW_SECONDS
}

function requireEnv(env: EnvLike, name: string): string {
  const value = env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function ageSeconds(issuedAtMs: number, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - issuedAtMs) / 1000))
}

function logAuthDebug(log: Logger, payload: Record<string, unknown>) {
  log.log(JSON.stringify(payload))
}

export async function getGmbAccessToken(opts?: {
  fetchImpl?: FetchLike
  nowMs?: number
  env?: EnvLike
  log?: Logger
  cache?: CacheBox
}): Promise<string> {
  const env = opts?.env ?? process.env
  const nowMs = opts?.nowMs ?? Date.now()
  const log = opts?.log ?? console
  const fetchImpl = opts?.fetchImpl ?? fetch
  const cache = opts?.cache ?? moduleCache
  const debug = isGmbAuthDebugEnabled(env)

  if (shouldReuseCachedGmbAccessToken(cache.current, nowMs)) {
    const cached = cache.current as NonNullable<GmbAccessTokenCache>
    if (debug) {
      logAuthDebug(log, {
        note: 'GMB access token',
        source: 'cache',
        ageSeconds: ageSeconds(cached.issuedAtMs, nowMs),
      })
    }
    return cached.accessToken
  }

  const clientId = requireEnv(env, 'GOOGLE_MY_BUSINESS_CLIENT_ID')
  const clientSecret = requireEnv(env, 'GOOGLE_MY_BUSINESS_CLIENT_SECRET')
  const refreshToken = requireEnv(env, 'GOOGLE_MY_BUSINESS_REFRESH_TOKEN')

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await googleApiFetch(
    GOOGLE_TOKEN_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    },
    fetchImpl,
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to get access token from Google: ${response.status} - ${text}`)
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) {
    throw new Error('No access_token in Google OAuth response')
  }

  const expiresIn =
    typeof data.expires_in === 'number' && Number.isFinite(data.expires_in) && data.expires_in > 0
      ? data.expires_in
      : DEFAULT_EXPIRES_IN_SECONDS

  cache.current = {
    accessToken: data.access_token,
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + expiresIn * 1000,
  }

  if (debug) {
    logAuthDebug(log, {
      note: 'GMB access token',
      source: 'oauth',
      ageSeconds: 0,
    })
  }

  return cache.current.accessToken
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` }
}

/** Tokeninfo: logib ainult scope / expires_in / aud / azp. Tokenit ei logita. */
export async function logGmbAccessTokenInfo(
  accessToken: string,
  opts?: {
    fetchImpl?: FetchLike
    env?: EnvLike
    log?: Logger
  },
): Promise<void> {
  const env = opts?.env ?? process.env
  if (!isGmbAuthDebugEnabled(env)) return

  const log = opts?.log ?? console
  const fetchImpl = opts?.fetchImpl ?? fetch
  const url = `${GOOGLE_TOKENINFO_ENDPOINT}?access_token=${encodeURIComponent(accessToken)}`

  try {
    const response = await googleApiFetch(url, {}, fetchImpl)
    let scope: string | null = null
    let expiresIn: number | string | null = null
    let aud: string | null = null
    let azp: string | null = null
    try {
      const data = (await response.json()) as {
        scope?: unknown
        expires_in?: unknown
        aud?: unknown
        azp?: unknown
      }
      scope = typeof data.scope === 'string' ? data.scope : null
      if (typeof data.expires_in === 'number' || typeof data.expires_in === 'string') {
        expiresIn = data.expires_in
      }
      aud = typeof data.aud === 'string' ? data.aud : null
      azp = typeof data.azp === 'string' ? data.azp : null
    } catch {
      // keha ei ole JSON — staatus ikka logida
    }
    logAuthDebug(log, {
      note: 'GMB tokeninfo',
      httpStatus: response.status,
      scope,
      expires_in: expiresIn,
      aud,
      azp,
    })
  } catch {
    log.warn(JSON.stringify({ note: 'GMB tokeninfo failed' }))
  }
}

export async function probeGmbReviewsList(input: {
  accountId: string
  locationId: string
  accessToken: string
  fetchImpl?: FetchLike
  env?: EnvLike
  log?: Logger
}): Promise<{ httpStatus: number | null; firstReviewId: string | null }> {
  const env = input.env ?? process.env
  if (!isGmbAuthDebugEnabled(env)) return { httpStatus: null, firstReviewId: null }

  const log = input.log ?? console
  const fetchImpl = input.fetchImpl ?? fetch
  const url = gmbReviewsListUrl(input.accountId, input.locationId, { pageSize: 1 })

  try {
    const response = await googleApiFetch(
      url,
      { headers: authHeaders(input.accessToken) },
      fetchImpl,
    )
    let firstReviewId: string | null = null
    try {
      const data = (await response.json()) as {
        reviews?: Array<{ reviewId?: string | null; name?: string | null }>
      }
      const first = Array.isArray(data.reviews) ? data.reviews[0] : null
      firstReviewId = first ? googleReviewIdFromGmbReview(first) || null : null
    } catch {
      // keha pole JSON — staatus ikka logida
    }
    logAuthDebug(log, {
      note: 'GMB auth compare list',
      httpStatus: response.status,
    })
    return { httpStatus: response.status, firstReviewId }
  } catch {
    log.warn(JSON.stringify({ note: 'GMB auth compare list failed' }))
    return { httpStatus: null, firstReviewId: null }
  }
}

/** Üksik GET; logib HTTP staatuse ja ID kuju (pikkus, / % tühik), mitte ID-d ennast. */
export async function probeGmbReviewGet(input: {
  accountId: string
  locationId: string
  reviewId: string
  accessToken: string
  fetchImpl?: FetchLike
  env?: EnvLike
  log?: Logger
}): Promise<number | null> {
  const env = input.env ?? process.env
  if (!isGmbAuthDebugEnabled(env)) return null

  const log = input.log ?? console
  const fetchImpl = input.fetchImpl ?? fetch
  const url = gmbReviewResourceUrl(input.accountId, input.locationId, input.reviewId)
  const shape = normalizedReviewIdShape(input.reviewId)

  try {
    const response = await googleApiFetch(
      url,
      {
        headers: authHeaders(input.accessToken),
      },
      fetchImpl,
    )
    try {
      await response.text()
    } catch {
      // keha pole vaja — tokenit/sisu ei logita
    }
    logAuthDebug(log, {
      note: 'GMB auth compare GET',
      httpStatus: response.status,
      reviewIdLength: shape.length,
      hasSlash: shape.hasSlash,
      hasPercent: shape.hasPercent,
      hasSpace: shape.hasSpace,
    })
    return response.status
  } catch {
    log.warn(JSON.stringify({ note: 'GMB auth compare GET failed' }))
    return null
  }
}

/**
 * Sünk ja postitamine kasutavad sama mõõtmist kohe pärast getGmbAccessToken().
 * Logib tokeni pikkuse (mitte sisu), tokeninfo, list GET ja ühe arvustuse GET.
 */
export async function logGmbAuthCompareProbe(input: {
  accessToken: string
  accountId: string
  locationId: string
  /** Postitamises esimene postitatav ID; sünkis jäta tühjaks — võetakse listist. */
  reviewId?: string | null
  fetchImpl?: FetchLike
  env?: EnvLike
  log?: Logger
}): Promise<void> {
  const env = input.env ?? process.env
  if (!isGmbAuthDebugEnabled(env)) return

  const log = input.log ?? console
  const fetchImpl = input.fetchImpl ?? fetch
  const opts = { fetchImpl, env, log }

  logAuthDebug(log, {
    note: 'GMB auth compare token',
    accessTokenLength: input.accessToken.length,
  })

  await logGmbAccessTokenInfo(input.accessToken, opts)

  const list = await probeGmbReviewsList({
    accountId: input.accountId,
    locationId: input.locationId,
    accessToken: input.accessToken,
    ...opts,
  })

  const reviewId = (input.reviewId && input.reviewId.trim()) || list.firstReviewId
  if (!reviewId) {
    logAuthDebug(log, { note: 'GMB auth compare GET skipped', reason: 'no-review-id' })
    return
  }

  await probeGmbReviewGet({
    accountId: input.accountId,
    locationId: input.locationId,
    reviewId,
    accessToken: input.accessToken,
    ...opts,
  })
}
