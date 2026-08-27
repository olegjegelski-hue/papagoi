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

const FIELD_PREVIEW_LEN = 180

export type GmbCommentFieldSnapshot = {
  present: boolean
  hasTranslatedByGoogle: boolean
  hasOriginalMarker: boolean
  start: string
  parser:
    | 'ok'
    | 'empty'
    | 'translated-only-no-text-before-marker'
    | 'extracted-still-has-markers'
    | 'original-marker-yielded-empty'
    | 'parser-null'
}

export type GmbOriginalPickDiagnosis = {
  picked: string | null
  /** null = parser julges originaali valida */
  reason: string | null
  fields: {
    comment: GmbCommentFieldSnapshot
    originalText: GmbCommentFieldSnapshot
    originalComment: GmbCommentFieldSnapshot
    originalReviewText: GmbCommentFieldSnapshot
  }
}

function previewText(raw: string | null | undefined, max = FIELD_PREVIEW_LEN): string {
  if (raw == null) return ''
  return String(raw).replace(/\r\n/g, '\n').replace(/\n/g, ' ').trim().slice(0, max)
}

function snapshotCommentField(raw: string | null | undefined): GmbCommentFieldSnapshot {
  const text = raw == null ? '' : String(raw).replace(/\r\n/g, '\n')
  const present = Boolean(text.trim())
  const hasTranslatedByGoogle = TRANSLATED_RE.test(text)
  const hasOriginalMarker = ORIGINAL_RE.test(text)
  const start = previewText(text)

  if (!present) {
    return { present, hasTranslatedByGoogle, hasOriginalMarker, start, parser: 'empty' }
  }
  if (hasTranslatedByGoogle && !hasOriginalMarker) {
    const translatedAt = text.search(TRANSLATED_RE)
    const before = text.slice(0, translatedAt).trim()
    if (!before) {
      return {
        present,
        hasTranslatedByGoogle,
        hasOriginalMarker,
        start,
        parser: 'translated-only-no-text-before-marker',
      }
    }
  }
  const extracted = extractConfidentOriginalGmbComment(text)
  if (!extracted) {
    const parser = hasOriginalMarker ? 'original-marker-yielded-empty' : 'parser-null'
    return { present, hasTranslatedByGoogle, hasOriginalMarker, start, parser }
  }
  if (gmbCommentLooksTranslated(extracted)) {
    return {
      present,
      hasTranslatedByGoogle,
      hasOriginalMarker,
      start,
      parser: 'extracted-still-has-markers',
    }
  }
  return { present, hasTranslatedByGoogle, hasOriginalMarker, start, parser: 'ok' }
}

function overallUncertainReason(fields: GmbOriginalPickDiagnosis['fields']): string {
  const order = ['originalComment', 'originalText', 'originalReviewText', 'comment'] as const
  const present = order.filter((name) => fields[name].present)
  if (present.length === 0) return 'empty-gmb-text'

  const translatedOnly = present.filter(
    (name) => fields[name].parser === 'translated-only-no-text-before-marker',
  )
  if (translatedOnly.length === present.length) {
    return `${translatedOnly[0]}-translated-only-no-text-before-marker`
  }

  const leftover = present.filter((name) => fields[name].parser === 'extracted-still-has-markers')
  if (leftover.length === present.length) {
    return 'extracted-original-still-has-markers'
  }

  const emptyAfterOriginal = order.find((name) => fields[name].parser === 'original-marker-yielded-empty')
  if (emptyAfterOriginal) {
    return `${emptyAfterOriginal}-original-marker-yielded-empty`
  }

  return 'parser-returned-null'
}

/** Dry-run diagnoos: miks originaali ei valitud, ilma secretiteta. */
export function diagnoseGmbOriginalPick(review: GmbReviewCommentSource): GmbOriginalPickDiagnosis {
  const fields = {
    comment: snapshotCommentField(review.comment),
    originalText: snapshotCommentField(review.originalText),
    originalComment: snapshotCommentField(review.originalComment),
    originalReviewText: snapshotCommentField(review.originalReviewText),
  }
  const picked = pickConfidentOriginalFromGmbReview(review)
  if (!picked) {
    return { picked: null, reason: overallUncertainReason(fields), fields }
  }
  if (gmbCommentLooksTranslated(picked)) {
    return { picked, reason: 'extracted-original-still-has-markers', fields }
  }
  return { picked, reason: null, fields }
}

/** Notion rich_text ühe tükikese ülempiir on 2000 märki. */
export function toNotionRichText(content: string): { type: 'text'; text: { content: string } }[] {
  const chunks: { type: 'text'; text: { content: string } }[] = []
  for (let i = 0; i < content.length; i += 2000) {
    chunks.push({ type: 'text', text: { content: content.slice(i, i + 2000) } })
  }
  return chunks.length > 0 ? chunks : [{ type: 'text', text: { content: '' } }]
}
