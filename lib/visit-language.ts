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

/** Vormi/API kood → Notioni Select väärtus (Est / Eng / Rus). */
export function visitMailLocaleToNotionSelectLabel(locale: VisitMailLocale): 'Est' | 'Eng' | 'Rus' {
  if (locale === 'en') return 'Eng'
  if (locale === 'ru') return 'Rus'
  return 'Est'
}

/** Kuvamiseks: järjekord Est, Eng, Rus, ülejäänud tähestikuliselt */
export function sortVisitLanguageLabels(labels: string[]): string[] {
  const order = ['Est', 'Eng', 'Rus']
  const uniq = [...new Set(labels.map((s) => s.trim()).filter(Boolean))]
  return uniq.sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    }
    return a.localeCompare(b)
  })
}

/** Loeb Külastajad kirjest keele (tulba nimi sisaldab keel / language / visitlang). */
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
