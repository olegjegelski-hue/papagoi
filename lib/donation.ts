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

export const DONATION_STATUS = {
  awaitingPayment: 'Ootab makset',
  awaitingTransfer: 'Ootab ülekannet',
  paid: 'Laekunud',
  cancelled: 'Tühistatud',
} as const

export type DonationStatus = (typeof DONATION_STATUS)[keyof typeof DONATION_STATUS]

export const DONATION_PAYMENT_METHOD = {
  montonio: 'Pangalink (Montonio)',
  transfer: 'Ülekanne',
} as const

export function purposeFromNotionLabel(raw: string | null | undefined): DonationPurpose | null {
  const s = (raw ?? '').trim()
  if (s === DONATION_PURPOSE_NOTION.kingi) return 'kingi'
  if (s === DONATION_PURPOSE_NOTION.toit) return 'toit'
  if (s === DONATION_PURPOSE_NOTION.uldine) return 'uldine'
  return parseDonationPurpose(s)
}

export function donationPaymentDescription(code: string, purpose: DonationPurpose): string {
  return `Annetus ${code} – ${DONATION_PURPOSE_NOTION[purpose]}`
}

export function parseDonationCodeFromMerchantReference(ref: string): string | null {
  const m = ref.trim().match(/^(ANN-\d+)/i)
  if (!m) return null
  return `ANN-${m[1].slice(4)}`
}

export function parseDonationNumberFromCode(code: string): number | null {
  const m = code.trim().match(/^ANN-(\d+)$/i)
  if (!m) return null
  const n = Number(m[1])
  return Number.isInteger(n) ? n : null
}

export function splitPersonName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const firstName = parts[0] || fullName.trim() || '—'
  const lastName = parts.slice(1).join(' ') || firstName
  return { firstName, lastName }
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
