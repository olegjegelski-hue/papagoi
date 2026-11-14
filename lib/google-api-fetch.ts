/**
 * Google API fetch ilma Next.js Data Cache'ita.
 * GMB list-GET ilma cache: 'no-store'-ita võib tagastada vana nimekirja ja peita 401.
 * Ainult cache: 'no-store' — mitte koos next.revalidate'iga, sest Next.js hoiatab
 * mõlema korral ja logib täis-URL-i (võib sisaldada tokenit).
 * Ära logi access tokenit, refresh tokenit, client secretit ega neid sisaldavat URL-i.
 */

export type FetchLike = typeof fetch

export const GOOGLE_API_NO_STORE: RequestCache = 'no-store'

export const GMB_TOKEN_INVALID_LOG = 'GMB token kehtetu — vaja uut refresh tokenit'

/** 429 / 5xx: kuni 3 kordust pärast esimest ebaõnnestumist (kokku kuni 4 fetch'i). */
export const GOOGLE_API_MAX_RETRIES = 3

export const GOOGLE_API_RETRY_BASE_DELAY_MS = 1000

const GOOGLE_API_RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

export type GoogleApiRequestInit = RequestInit & {
  next?: { revalidate?: number }
}

export type GoogleApiFetchOptions = {
  sleep?: (ms: number) => Promise<void>
  log?: Pick<Console, 'log'>
}

export function isGoogleApiRetryableStatus(status: number): boolean {
  return GOOGLE_API_RETRYABLE_STATUSES.has(status)
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** Kutsuja cache/next ei jää kehtima — alati no-store, ilma revalidate'ita. */
export function googleApiRequestInit(init: GoogleApiRequestInit = {}): RequestInit {
  const { cache: _ignoredCache, next: _ignoredNext, ...rest } = init
  return {
    ...rest,
    cache: GOOGLE_API_NO_STORE,
  }
}

export async function googleApiFetch(
  input: RequestInfo | URL,
  init: GoogleApiRequestInit = {},
  fetchImpl: FetchLike = fetch,
  opts?: GoogleApiFetchOptions,
): Promise<Response> {
  const sleep = opts?.sleep ?? defaultSleep
  const log = opts?.log ?? console
  const requestInit = googleApiRequestInit(init)
  let retry = 0

  while (true) {
    const response = await fetchImpl(input, requestInit)
    if (!isGoogleApiRetryableStatus(response.status) || retry >= GOOGLE_API_MAX_RETRIES) {
      return response
    }
    retry += 1
    log.log(
      JSON.stringify({
        note: 'Google API retry',
        httpStatus: response.status,
        attempt: retry,
      }),
    )
    await sleep(GOOGLE_API_RETRY_BASE_DELAY_MS * 2 ** (retry - 1))
  }
}

export function isGmbUnauthorizedStatus(status: number): boolean {
  return status === 401
}

export function errorLooksLikeGmbUnauthorized(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /\b401\b/.test(message) || /\bUNAUTHENTICATED\b/.test(message)
}

export function logGmbTokenInvalid(log: Pick<Console, 'error'> = console): void {
  log.error(GMB_TOKEN_INVALID_LOG)
}
