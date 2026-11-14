/**
 * GMB reviewId võib olla lühike ID või resource name
 * (`accounts/.../locations/.../reviews/{id}`). Places-jäänukid on numbrilised.
 */

export const GMB_API_V4_BASE = 'https://mybusiness.googleapis.com/v4'

function decodeOnceIfEncodedResource(raw: string): string {
  if (!raw.includes('%')) return raw
  try {
    const decoded = decodeURIComponent(raw)
    if (decoded !== raw && decoded.includes('/')) return decoded.trim()
  } catch {
    // vigane percent-encoding — jäta toorelt
  }
  return raw
}

export function normalizeGoogleReviewId(raw: string | null | undefined): string {
  const s = decodeOnceIfEncodedResource(String(raw || '').trim())
  if (!s) return ''
  const parts = s.split('/')
  const idx = parts.lastIndexOf('reviews')
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1].trim()
  return s
}

/** Logimiseks: ID kuju ilma ID-d ennast näitamata. */
export function normalizedReviewIdShape(raw: string | null | undefined): {
  length: number
  hasSlash: boolean
  hasPercent: boolean
  hasSpace: boolean
} {
  const id = normalizeGoogleReviewId(raw)
  return {
    length: id.length,
    hasSlash: id.includes('/'),
    hasPercent: id.includes('%'),
    hasSpace: /\s/.test(id),
  }
}

export function googleReviewIdFromGmbReview(review: {
  reviewId?: string | null
  name?: string | null
}): string {
  return normalizeGoogleReviewId(review.reviewId || review.name || '')
}

function chunkPlain(item: unknown): string {
  if (!item || typeof item !== 'object') return ''
  const t = item as { plain_text?: unknown; text?: { content?: unknown } }
  if (typeof t.plain_text === 'string' && t.plain_text) return t.plain_text
  if (typeof t.text?.content === 'string') return t.text.content
  return ''
}

/** Kõik rich_text / title tükid, mitte ainult [0]. */
export function richTextPlainFromProp(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const rec = prop as { rich_text?: unknown; title?: unknown }
  const chunks = Array.isArray(rec.rich_text)
    ? rec.rich_text
    : Array.isArray(rec.title)
      ? rec.title
      : []
  return chunks.map(chunkPlain).join('')
}

export function googleReviewIdFromNotionProperty(prop: unknown): string {
  return normalizeGoogleReviewId(richTextPlainFromProp(prop))
}

/**
 * Dedupe ainult normaliseeritud Google review ID järgi.
 * Nimi+kuupäev ei ole identiteet: sama inimene võib jätta mitu arvustust
 * ühel päeval (Kadri Türna 29.10.2026 13:03 ja 16:51).
 */
export function isSameGoogleReview(
  a: { reviewId?: string | null; name?: string | null },
  b: { reviewId?: string | null; name?: string | null },
): boolean {
  const idA = googleReviewIdFromGmbReview(a)
  const idB = googleReviewIdFromGmbReview(b)
  if (!idA || !idB) return false
  return idA === idB
}

export function findExistingByGoogleReviewId<T>(
  byId: Map<string, T>,
  reviewId: string | null | undefined,
): T | undefined {
  const id = normalizeGoogleReviewId(reviewId)
  if (!id) return undefined
  return byId.get(id)
}

/** Sama parent, mida töötav list-GET kasutab (account/location ilma encodeURIComponentita). */
export function gmbLocationReviewsParent(accountId: string, locationId: string): string {
  return `accounts/${String(accountId || '').trim()}/locations/${String(locationId || '').trim()}`
}

export function gmbReviewsListUrl(
  accountId: string,
  locationId: string,
  query?: { pageSize?: number; pageToken?: string; orderBy?: string },
): string {
  const url = new URL(`${GMB_API_V4_BASE}/${gmbLocationReviewsParent(accountId, locationId)}/reviews`)
  if (query?.pageSize != null) url.searchParams.set('pageSize', String(query.pageSize))
  if (query?.orderBy) url.searchParams.set('orderBy', query.orderBy)
  if (query?.pageToken) url.searchParams.set('pageToken', query.pageToken)
  return url.toString()
}

export function gmbReviewResourceUrl(
  accountId: string,
  locationId: string,
  reviewId: string,
): string {
  const id = normalizeGoogleReviewId(reviewId)
  return `${GMB_API_V4_BASE}/${gmbLocationReviewsParent(accountId, locationId)}/reviews/${encodeURIComponent(id)}`
}

export function gmbReviewReplyUrl(accountId: string, locationId: string, reviewId: string): string {
  return `${gmbReviewResourceUrl(accountId, locationId, reviewId)}/reply`
}
