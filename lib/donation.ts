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
