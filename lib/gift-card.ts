import { isCancelledMontonioStatus, isPaidMontonioStatus } from '@/lib/montonio-payment'
import type { VisitMailLocale } from '@/lib/visit-language'

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

function giftCardSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee').replace(/\/$/, '')
}

/** Suhteline tee i18n-navigatsioonile (next-intl lisab keele ise). */
export function giftCardRedeemPath(code?: string): string {
  const path = '/kinkekaart/lunasta'
  return code ? `${path}?code=${encodeURIComponent(code)}` : path
}

/**
 * Lunastus-URL. QR-kood ja Notioni „QR URL“ kasutavad alati `et`
 * (kaart jääb eesti keelde). Kiri ostjale kasutab ostja keelt.
 */
export function giftCardRedeemUrl(
  code: string,
  locale: VisitMailLocale = 'et',
  baseUrl: string = giftCardSiteBaseUrl()
): string {
  return `${baseUrl.replace(/\/$/, '')}/${locale}${giftCardRedeemPath(code)}`
}

/** Vanade kaartide QR URL ilma keeleprefiksita (enne i18n-i). */
export function legacyGiftCardRedeemUrl(
  code: string,
  baseUrl: string = giftCardSiteBaseUrl()
): string {
  return `${baseUrl.replace(/\/$/, '')}${giftCardRedeemPath(code)}`
}

export function isGiftCardAlreadyIssued(details: { code: string; qrUrl: string | null }): boolean {
  if (!details.qrUrl) return false
  return (
    details.qrUrl === giftCardRedeemUrl(details.code, 'et') ||
    details.qrUrl === legacyGiftCardRedeemUrl(details.code)
  )
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
