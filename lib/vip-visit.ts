/**
 * VIP külastus — jagatud hinnaastmed, riigipühad ja ajareeglid.
 * Kasutavad broneerimisvorm, API, e-kirjad ja Meta CAPI.
 */

export const VIP_GROUP_TYPE = 'vip-kulastus'

/** Tööpäeviti kõik täistunnid 10:00–18:00 (sama võrk mis vormi timeSlots). */
export const VIP_WEEKDAY_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
] as const
/** Nädalavahetus ja riigipühad: 10:00, 11:00 või 18:00. */
export const VIP_WEEKEND_HOLIDAY_SLOTS = ['10:00', '11:00', '18:00'] as const

export const VIP_MIN_PEOPLE = 1
export const VIP_MAX_PEOPLE = 20

export const VIP_PRICE_TIERS = [
  { min: 1, max: 2, price: 50 },
  { min: 3, max: 5, price: 75 },
  { min: 6, max: 8, price: 100 },
  { min: 9, max: 10, price: 125 },
  { min: 11, max: 15, price: 175 },
  { min: 16, max: 20, price: 225 },
] as const

export function isVipGroupType(groupType?: string | null): boolean {
  if (!groupType) return false
  const n = groupType.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '')
  return (
    n === VIP_GROUP_TYPE ||
    n === 'vip' ||
    n === 'vipkulastus' ||
    n === 'vipvisit' ||
    n === 'vip-visit' ||
    n === 'vipвизит' ||
    n === 'vip-визит'
  )
}

export function groupTypeFromQuery(value?: string | string[] | null): string {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return ''
  return isVipGroupType(raw) ? VIP_GROUP_TYPE : ''
}

/** VIP külastuse koguhind inimeste arvu järgi. Null, kui arv pole 1–20. */
export function vipVisitPrice(people: number): number | null {
  if (!Number.isInteger(people) || people < VIP_MIN_PEOPLE || people > VIP_MAX_PEOPLE) {
    return null
  }
  const tier = VIP_PRICE_TIERS.find((row) => people >= row.min && people <= row.max)
  return tier ? tier.price : null
}

export function isVipVisitPropertyName(key: string): boolean {
  const n = key
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/\s+/g, '')
  if (n === 'vipkulastus' || n === 'vip(kulastus)') return true
  return n.includes('vip') && n.includes('kulastus')
}

export function extractVipFlag(properties: Record<string, any> | null | undefined): boolean {
  if (!properties) return false
  for (const key of Object.keys(properties)) {
    if (!isVipVisitPropertyName(key)) continue
    const prop = properties[key]
    if (prop?.type === 'checkbox') return Boolean(prop.checkbox)
    if (prop?.type === 'formula' && typeof prop.formula?.boolean === 'boolean') {
      return prop.formula.boolean
    }
    if (prop?.type === 'rollup') {
      if (prop.rollup?.type === 'checkbox') return Boolean(prop.rollup.checkbox)
      if (typeof prop.rollup?.boolean === 'boolean') return prop.rollup.boolean
    }
  }
  return false
}

/** Lihavõtte pühapäev (Gregoriuse arvutus). month: 1–12. */
export function easterSunday(year: number): { year: number; month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { year, month, day }
}

function ymd(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function addDays(year: number, month: number, day: number, delta: number): { year: number; month: number; day: number } {
  const dt = new Date(Date.UTC(year, month - 1, day + delta))
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() }
}

function parseYmd(input: string | Date): { year: number; month: number; day: number } | null {
  if (typeof input === 'string') {
    const m = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!m) return null
    return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }
  }
  if (!(input instanceof Date) || Number.isNaN(input.getTime())) return null
  return {
    year: input.getFullYear(),
    month: input.getMonth() + 1,
    day: input.getDate(),
  }
}

/** Eesti riigipühad (ülesandes loetletud). Suur reede = Lihavõtte pühapäev − 2. */
export function isEstonianPublicHoliday(input: string | Date): boolean {
  const parts = parseYmd(input)
  if (!parts) return false
  const { year, month, day } = parts
  const key = ymd(year, month, day)
  const easter = easterSunday(year)
  const goodFriday = addDays(easter.year, easter.month, easter.day, -2)
  const holidays = new Set([
    ymd(year, 1, 1),
    ymd(year, 2, 24),
    ymd(goodFriday.year, goodFriday.month, goodFriday.day),
    ymd(year, 5, 1),
    ymd(year, 6, 23),
    ymd(year, 6, 24),
    ymd(year, 8, 20),
    ymd(year, 12, 24),
    ymd(year, 12, 25),
    ymd(year, 12, 26),
  ])
  return holidays.has(key)
}

/** 0 = pühapäev … 6 = laupäev (UTC kalendripäev, ilma ajavööndi nihketa). */
export function weekdayUtc(input: string | Date): number | null {
  const parts = parseYmd(input)
  if (!parts) return null
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
}

export function isWeekendOrEstonianHoliday(input: string | Date): boolean {
  const wd = weekdayUtc(input)
  if (wd === null) return false
  return wd === 0 || wd === 6 || isEstonianPublicHoliday(input)
}

export function vipSlotsForDate(input: string | Date): string[] {
  if (isWeekendOrEstonianHoliday(input)) return [...VIP_WEEKEND_HOLIDAY_SLOTS]
  return [...VIP_WEEKDAY_SLOTS]
}

export function isVipTimeAllowed(date: string | Date, timeSlot: string): boolean {
  const time = timeSlot.trim()
  return vipSlotsForDate(date).includes(time)
}
