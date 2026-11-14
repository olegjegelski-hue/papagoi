import { isCancelledMontonioStatus, isPaidMontonioStatus } from '@/lib/montonio-payment'

export const GIFT_CARD_STATUS = {
  awaitingPayment: 'Ootab makset',
  ordered: 'Tellitud',
  active: 'Aktiivne',
  used: 'Kasutatud',
  cancelled: 'Tühistatud',
  expired: 'Aegunud',
} as const

export type GiftCardStatus = (typeof GIFT_CARD_STATUS)[keyof typeof GIFT_CARD_STATUS]

export const GIFT_CARD_PAYMENT_METHOD = {
  montonio: 'Pangalink (Montonio)',
  transfer: 'Ülekanne',
} as const

export function giftCardPaymentDescription(code: string): string {
  return `Kinkekaart ${code} – Papagoi Keskus`
}

/** Montonio merchantReference = kinkekaardi kood (PK-…). */
export function parseGiftCardCodeFromMerchantReference(ref: string): string | null {
  const m = ref.trim().match(/^(PK-[A-Z0-9]+)/i)
  if (!m) return null
  return m[1].toUpperCase()
}

export function isGiftCardMerchantReference(ref: string): boolean {
  return parseGiftCardCodeFromMerchantReference(ref) != null
}

export function giftCardCashflowTitle(buyerName: string, code: string): string {
  const name = buyerName.trim() || '—'
  return `Kinkekaardi müük — ${name} (${code})`
}

export function giftCardRedeemUrl(code: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee').replace(/\/$/, '')
  return `${baseUrl}/kinkekaart/lunasta?code=${encodeURIComponent(code)}`
}

export function isGiftCardAlreadyIssued(details: { code: string; qrUrl: string | null }): boolean {
  const qrUrl = giftCardRedeemUrl(details.code)
  return Boolean(details.qrUrl && details.qrUrl === qrUrl)
}

export function isGiftCardAwaitingPayment(status: string | null | undefined): boolean {
  return (status || '').trim() === GIFT_CARD_STATUS.awaitingPayment
}

export function nextGiftCardStatus(input: {
  currentStatus: string | null
  paymentStatus: string
}): (typeof GIFT_CARD_STATUS)['active'] | (typeof GIFT_CARD_STATUS)['cancelled'] | null {
  const current = (input.currentStatus || '').trim()
  const awaiting = current === GIFT_CARD_STATUS.awaitingPayment
  const alreadyActive =
    current === GIFT_CARD_STATUS.active || current === GIFT_CARD_STATUS.used

  if (isPaidMontonioStatus(input.paymentStatus)) {
    if (alreadyActive) return null
    return awaiting ? GIFT_CARD_STATUS.active : null
  }
  if (isCancelledMontonioStatus(input.paymentStatus)) {
    if (!awaiting) return null
    return GIFT_CARD_STATUS.cancelled
  }
  return null
}
