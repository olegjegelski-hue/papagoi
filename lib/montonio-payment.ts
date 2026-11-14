import { validateMontonioToken } from '@/lib/montonio'

export type MontonioOrderTokenPayload = {
  uuid?: string
  accessKey?: string
  merchantReference?: string
  paymentStatus?: string
  status?: string
  grandTotal?: number | string
  amount?: number | string
  currency?: string
  paymentProviderName?: string
  paymentMethod?: string
}

export function extractMontonioOrderToken(input: {
  body?: Record<string, unknown> | null
  searchParams?: URLSearchParams | null
}): string | null {
  const body = input.body
  const fromBody = [body?.orderToken].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  )
  if (fromBody) return fromBody.trim()

  const params = input.searchParams
  const fromQuery = [params?.get('order-token'), params?.get('orderToken')].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  )
  return fromQuery ? fromQuery.trim() : null
}

export function decodeMontonioOrderToken(token: string): MontonioOrderTokenPayload {
  return validateMontonioToken(token) as MontonioOrderTokenPayload
}

export function getMontonioPaymentStatus(decoded: MontonioOrderTokenPayload): string {
  const raw = decoded.paymentStatus ?? decoded.status
  return typeof raw === 'string' ? raw.trim().toUpperCase() : ''
}

export function isPaidMontonioStatus(status: string): boolean {
  return status === 'PAID'
}

export function isCancelledMontonioStatus(status: string): boolean {
  return status === 'ABANDONED' || status === 'VOIDED'
}

export function parseMontonioAmount(decoded: MontonioOrderTokenPayload): number | undefined {
  const raw = decoded.grandTotal ?? decoded.amount
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string') {
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

export function montonioAmountsMatch(
  tokenAmount: number | undefined,
  expectedAmount: number | null | undefined
): boolean {
  if (tokenAmount == null || expectedAmount == null) return false
  return Math.abs(tokenAmount - expectedAmount) < 0.005
}

export function getMontonioBankName(decoded: MontonioOrderTokenPayload): string {
  return typeof decoded.paymentProviderName === 'string' ? decoded.paymentProviderName.trim() : ''
}

export type DonationThankYouKind = 'paid' | 'pending' | 'failed'

export function donationThankYouKind(status: string): DonationThankYouKind {
  if (isPaidMontonioStatus(status)) return 'paid'
  if (status === 'PENDING') return 'pending'
  return 'failed'
}

export function isInvalidMontonioTokenError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : ''
  return /Invalid Montonio token|accessKey ei kattu|jwt/i.test(message)
}
