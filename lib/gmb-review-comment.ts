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
