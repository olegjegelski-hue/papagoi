export const DONATION_AMOUNT_STEP = 10
export const DONATION_AMOUNT_MIN = 10
export const DONATION_AMOUNT_MAX = 1000
export const DONATION_QUICK_AMOUNTS = [10, 20, 50, 100] as const
export const DONATION_COMMENT_MAX = 500

export const DONATION_PURPOSES = ['kingi', 'toit', 'uldine'] as const
export type DonationPurpose = (typeof DONATION_PURPOSES)[number]

export const DONATION_PURPOSE_NOTION: Record<DonationPurpose, 'Kingi külastus' | 'Loomade toit' | 'Üldine'> = {
  kingi: 'Kingi külastus',
  toit: 'Loomade toit',
  uldine: 'Üldine',
}

/** Püsivad Eesti viitenumbrid (7-3-1) sihtotstarbe kaupa — üks konto, erineb ainult viide. */
export const DONATION_REFERENCE_NUMBER: Record<DonationPurpose, string> = {
  kingi: '1012',
  toit: '1025',
  uldine: '1038',
}

/** Eesti viitenumbri kontrollnumber (kaalud 7-3-1, paremalt vasakule). */
export function estonianReferenceCheckDigit(baseDigits: string): number {
  const digits = baseDigits.replace(/\D/g, '')
  const weights = [7, 3, 1] as const
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[digits.length - 1 - i]) * weights[i % 3]
  }
  return (10 - (sum % 10)) % 10
}

export function isValidEstonianReferenceNumber(ref: string): boolean {
  const digits = ref.replace(/\D/g, '')
  if (digits.length < 2) return false
  const base = digits.slice(0, -1)
  const check = Number(digits.slice(-1))
  return estonianReferenceCheckDigit(base) === check
}

export function parseDonationPurpose(raw: unknown): DonationPurpose | null {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (s === 'kingi' || s === 'toit' || s === 'uldine') return s
  return null
}

export function parseDonationAmount(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isInteger(n)) return null
  if (n < DONATION_AMOUNT_MIN || n > DONATION_AMOUNT_MAX || n % DONATION_AMOUNT_STEP !== 0) return null
  return n
}

export function roundDonationAmount(value: number): number {
  const rounded = Math.round(value / DONATION_AMOUNT_STEP) * DONATION_AMOUNT_STEP
  return Math.min(DONATION_AMOUNT_MAX, Math.max(DONATION_AMOUNT_MIN, rounded))
}
