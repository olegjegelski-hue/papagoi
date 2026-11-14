import { formatInTimeZone } from 'date-fns-tz'
import type { GiftCardDetails } from '@/lib/notion-gift-card-lookup'

export const TALLINN_TZ = 'Europe/Tallinn'

export type GiftCardPublicKind =
  | 'valid'
  | 'used'
  | 'expired'
  | 'pending'
  | 'cancelled'
  | 'not_found'

export type GiftCardPublicView = {
  code: string
  amountEur: number
  validUntil: string
  usedAt: string | null
  kind: GiftCardPublicKind
}

export type TodayVisitor = {
  id: string
  name: string
  time: string | null
  count: number | null
}

/** Normaliseeri kuupäev yyyy-MM-dd kujule (ISO, EE või slash). */
export function toIsoDateOnly(raw: string): string {
  const s = (raw || '').trim()
  if (!s) return ''
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const ee = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (ee) return `${ee[3]}-${ee[2].padStart(2, '0')}-${ee[1].padStart(2, '0')}`
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`
  return ''
}

export function tallinnToday(now: Date = new Date()): string {
  return formatInTimeZone(now, TALLINN_TZ, 'yyyy-MM-dd')
}

export function formatGiftCardDate(input: string): string {
  const iso = toIsoDateOnly(input)
  if (!iso) return (input || '').trim()
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function statusName(status: string | null | undefined): string {
  return (status || '').trim().toLowerCase()
}

/** Kehtiv kuni on inclusive (aegub järgmisel kalendripäeval). */
export function isGiftCardExpiredByDate(validUntil: string, now: Date = new Date()): boolean {
  const until = toIsoDateOnly(validUntil)
  if (!until) return false
  return until < tallinnToday(now)
}

export function isUsedOnTallinnDay(
  usedAt: string | null | undefined,
  now: Date = new Date()
): boolean {
  const used = usedAt ? toIsoDateOnly(usedAt) : ''
  return Boolean(used) && used === tallinnToday(now)
}

export function resolveGiftCardPublicKind(
  details: Pick<GiftCardDetails, 'status' | 'usedAt' | 'validUntil'> | null,
  now: Date = new Date()
): GiftCardPublicKind {
  if (!details) return 'not_found'

  const status = statusName(details.status)
  if (status === 'tühistatud' || status === 'tyhistatud' || status === 'cancelled') {
    return 'cancelled'
  }
  if (
    status === 'tellitud' ||
    status === 'pending' ||
    status === 'ootab makset' ||
    status === 'awaiting payment'
  ) {
    return 'pending'
  }
  if (status === 'kasutatud' || status === 'used') {
    return 'used'
  }
  if (details.usedAt) {
    return 'used'
  }
  if (status === 'aegunud' || status === 'expired' || isGiftCardExpiredByDate(details.validUntil, now)) {
    return 'expired'
  }
  return 'valid'
}

export function toGiftCardPublicView(
  details: GiftCardDetails | null,
  now: Date = new Date()
): GiftCardPublicView | null {
  if (!details) return null
  return {
    code: details.code,
    amountEur: details.amountEur,
    validUntil: details.validUntil,
    usedAt: details.usedAt,
    kind: resolveGiftCardPublicKind(details, now),
  }
}

export function canMarkGiftCardUsed(
  details: GiftCardDetails | null,
  now: Date = new Date()
): boolean {
  return resolveGiftCardPublicKind(details, now) === 'valid'
}

export function canUndoGiftCardUsed(
  details: GiftCardDetails | null,
  now: Date = new Date()
): boolean {
  if (!details) return false
  if (resolveGiftCardPublicKind(details, now) !== 'used') return false
  return isUsedOnTallinnDay(details.usedAt, now)
}
