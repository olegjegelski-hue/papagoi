/**
 * Google API fetch ilma Next.js Data Cache'ita.
 * GMB list-GET ilma cache: 'no-store'-ita võib tagastada vana nimekirja ja peita 401.
 * Ära logi access tokenit, refresh tokenit ega client secretit.
 */

export type FetchLike = typeof fetch

export const GOOGLE_API_NO_STORE: RequestCache = 'no-store'

export const GMB_TOKEN_INVALID_LOG = 'GMB token kehtetu — vaja uut refresh tokenit'

export type GoogleApiRequestInit = RequestInit & {
  next?: { revalidate?: number }
}

/** Kutsuja cache/next ei jää kehtima — alati no-store. */
export function googleApiRequestInit(init: GoogleApiRequestInit = {}): GoogleApiRequestInit {
  const { cache: _ignoredCache, next: _ignoredNext, ...rest } = init
  return {
    ...rest,
    cache: GOOGLE_API_NO_STORE,
    next: { revalidate: 0 },
  }
}

export async function googleApiFetch(
  input: RequestInfo | URL,
  init: GoogleApiRequestInit = {},
  fetchImpl: FetchLike = fetch,
): Promise<Response> {
  return fetchImpl(input, googleApiRequestInit(init) as RequestInit)
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
