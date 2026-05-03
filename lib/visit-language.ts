/** Keeled broneeringu- ja kinnitusmeilides (sama mis vormil et/en/ru). */

export type VisitMailLocale = 'et' | 'en' | 'ru'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

/** Notioni „Est“ / „Eng“ / „Rus“ või API kood → meili keel */
export function parseVisitMailLocale(raw: string | null | undefined): VisitMailLocale {
  const s = (raw ?? '').trim()
  const lower = s.toLowerCase()
  if (lower === 'en' || lower === 'eng' || s === 'Eng') return 'en'
  if (lower === 'ru' || lower === 'rus' || s === 'Rus') return 'ru'
  if (lower === 'et' || lower === 'est' || s === 'Est') return 'et'
  return 'et'
}

/** Loeb Külastajad lehelt välja (nimi sisaldab keel / language / visitlang). */
export function extractVisitLanguageFromNotionVisitorProps(
  properties: Record<string, unknown>
): string | null {
  const keys = Object.keys(properties)
  const cand = keys.find((k) => {
    const n = normalizeKey(k)
    const p = properties[k] as { type?: string }
    if (p?.type !== 'select' && p?.type !== 'rich_text') return false
    return n.includes('keel') || n.includes('language') || n.includes('visitlang')
  })
  if (!cand) return null
  const prop = properties[cand] as {
    type?: string
    select?: { name?: string | null }
    rich_text?: { plain_text?: string }[]
  }
  if (prop.type === 'select') return prop.select?.name ?? null
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? null
  return null
}
