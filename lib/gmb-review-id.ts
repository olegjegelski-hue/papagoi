/**
 * GMB reviewId võib olla lühike ID või resource name
 * (`accounts/.../locations/.../reviews/{id}`). Places-jäänukid on numbrilised.
 */

export function normalizeGoogleReviewId(raw: string | null | undefined): string {
  const s = String(raw || '').trim()
  if (!s) return ''
  const parts = s.split('/')
  const idx = parts.lastIndexOf('reviews')
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1].trim()
  return s
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

export function gmbReviewResourceUrl(
  accountId: string,
  locationId: string,
  reviewId: string,
): string {
  const id = normalizeGoogleReviewId(reviewId)
  return `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(locationId)}/reviews/${encodeURIComponent(id)}`
}

export function gmbReviewReplyUrl(accountId: string, locationId: string, reviewId: string): string {
  return `${gmbReviewResourceUrl(accountId, locationId, reviewId)}/reply`
}
