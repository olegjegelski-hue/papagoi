/**
 * GMB v4 `comment` võib olla tõlge + originaal ühes stringis.
 * Järjekord ei ole kindel; keelekoodi API eraldi ei anna.
 */

const TRANSLATED_RE = /\(\s*Translated by Google\s*\)/i
const ORIGINAL_RE = /\(\s*Original\s*\)/i

export function extractOriginalGmbComment(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const text = String(raw).replace(/\r\n/g, '\n')
  if (!text.trim()) return null

  const translatedAt = text.search(TRANSLATED_RE)
  const originalAt = text.search(ORIGINAL_RE)

  let original: string
  if (originalAt !== -1) {
    original = text.slice(originalAt).replace(ORIGINAL_RE, '')
    const leftoverTranslation = original.search(TRANSLATED_RE)
    if (leftoverTranslation !== -1) {
      original = original.slice(0, leftoverTranslation)
    }
  } else if (translatedAt !== -1) {
    original = text.slice(0, translatedAt)
  } else {
    original = text
  }

  const trimmed = original.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Originaal ainult siis, kui GMB selle selgelt annab.
 * Tõlge-ainult stringi (Translated, ilma Originalita ja ilma tekstita enne markerit) ei kasutata.
 */
export function extractConfidentOriginalGmbComment(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null
  const text = String(raw).replace(/\r\n/g, '\n')
  if (!text.trim()) return null

  const hasOriginalMarker = ORIGINAL_RE.test(text)
  const hasTranslatedMarker = TRANSLATED_RE.test(text)

  if (hasTranslatedMarker && !hasOriginalMarker) {
    const translatedAt = text.search(TRANSLATED_RE)
    const before = text.slice(0, translatedAt).trim()
    if (!before) return null
  }

  return extractOriginalGmbComment(text)
}

type GmbReviewCommentSource = {
  comment?: string | null
  originalComment?: string | null
  originalText?: string | null
  originalReviewText?: string | null
}

/**
 * Arvustuse enda originaaltekst GMB vastusest.
 * `reviewReply` on ettevõtte vastus — seda ei kasutata.
 */
export function pickConfidentOriginalFromGmbReview(
  review: GmbReviewCommentSource,
): string | null {
  const named = [review.originalComment, review.originalText, review.originalReviewText]
  for (const candidate of named) {
    const extracted = extractConfidentOriginalGmbComment(candidate)
    if (extracted) return extracted
  }
  return extractConfidentOriginalGmbComment(review.comment)
}

export function gmbCommentLooksTranslated(raw: string | null | undefined): boolean {
  if (!raw) return false
  return TRANSLATED_RE.test(raw) || ORIGINAL_RE.test(raw)
}

/** Notion rich_text ühe tükikese ülempiir on 2000 märki. */
export function toNotionRichText(content: string): { type: 'text'; text: { content: string } }[] {
  const chunks: { type: 'text'; text: { content: string } }[] = []
  for (let i = 0; i < content.length; i += 2000) {
    chunks.push({ type: 'text', text: { content: content.slice(i, i + 2000) } })
  }
  return chunks.length > 0 ? chunks : [{ type: 'text', text: { content: '' } }]
}
