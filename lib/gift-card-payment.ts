import { sendGiftCardSoldAdminEmail } from '@/lib/email'
import {
  GIFT_CARD_STATUS,
  isGiftCardAlreadyIssued,
  isGiftCardMerchantReference,
  nextGiftCardStatus,
  parseGiftCardCodeFromMerchantReference,
} from '@/lib/gift-card'
import { issueGiftCard } from '@/lib/gift-card-issue'
import { tallinnToday } from '@/lib/gift-card-status'
import { MontonioConfigError } from '@/lib/montonio'
import {
  decodeMontonioOrderToken,
  getMontonioBankName,
  getMontonioPaymentStatus,
  isInvalidMontonioTokenError,
  isPaidMontonioStatus,
  montonioAmountsMatch,
  parseMontonioAmount,
  type MontonioOrderTokenPayload,
} from '@/lib/montonio-payment'
import { createGiftCardCashflowEntry } from '@/lib/notion-cashflow'
import {
  cancelledGiftCardProperties,
  findGiftCardByMontonio,
  getGiftCardByPageId,
  paidGiftCardProperties,
  updateGiftCardProperties,
  type GiftCardDetails,
} from '@/lib/notion-gift-card-lookup'

export type GiftCardPaymentErrorCode =
  | 'invalid_token'
  | 'missing_reference'
  | 'not_found'
  | 'uuid_mismatch'
  | 'amount_mismatch'
  | 'config'
  | 'unknown'

export class GiftCardPaymentError extends Error {
  code: GiftCardPaymentErrorCode
  constructor(code: GiftCardPaymentErrorCode, message: string) {
    super(message)
    this.name = 'GiftCardPaymentError'
    this.code = code
  }
}

function fallbackValidUntilFromPurchase(purchaseIso: string): string {
  const m = purchaseIso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  return `${Number(m[1]) + 1}-${m[2]}-${m[3]}`
}

export type ProcessGiftCardPaymentResult = {
  paid: boolean
  paymentStatus: string
  merchantReference: string
  uuid?: string
  issued: boolean
  alreadyIssued: boolean
  cashflowOk: boolean
}

export { isGiftCardMerchantReference, parseGiftCardCodeFromMerchantReference }

export async function processGiftCardMontonioPayment(input: {
  token: string
  requestHeaders?: Headers
}): Promise<ProcessGiftCardPaymentResult> {
  const notionApiKey = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_GIFT_CARDS_DATABASE_ID
  if (!notionApiKey || !databaseId) {
    throw new GiftCardPaymentError('config', 'Missing NOTION_API_KEY or NOTION_GIFT_CARDS_DATABASE_ID')
  }

  let decoded: MontonioOrderTokenPayload
  try {
    decoded = decodeMontonioOrderToken(input.token)
  } catch (error) {
    if (error instanceof MontonioConfigError) {
      throw new GiftCardPaymentError('config', error.message)
    }
    throw new GiftCardPaymentError(
      'invalid_token',
      error instanceof Error ? error.message : 'Invalid Montonio token'
    )
  }

  const paymentStatus = getMontonioPaymentStatus(decoded)
  const merchantReference = typeof decoded.merchantReference === 'string' ? decoded.merchantReference : ''
  const uuid = typeof decoded.uuid === 'string' ? decoded.uuid : undefined

  if (input.requestHeaders) {
    const forwarded = input.requestHeaders.get('x-forwarded-for') || input.requestHeaders.get('x-real-ip') || ''
    console.log(
      '[gift-card-payment]',
      paymentStatus,
      merchantReference || '(ref puudub)',
      uuid || '(uuid puudub)',
      'ip=',
      forwarded.split(',')[0]?.trim() || 'unknown'
    )
  }

  if (!merchantReference && !uuid) {
    throw new GiftCardPaymentError('missing_reference', 'Montonio tokenis puudub merchantReference')
  }

  const record = await findGiftCardByMontonio(notionApiKey, databaseId, {
    uuid,
    merchantReference: parseGiftCardCodeFromMerchantReference(merchantReference) || merchantReference,
  })
  if (!record) {
    throw new GiftCardPaymentError(
      'not_found',
      `Kinkekaarti ei leitud: ${merchantReference || uuid || ''}`
    )
  }

  if (record.montonioUuid && uuid && record.montonioUuid !== uuid) {
    throw new GiftCardPaymentError('uuid_mismatch', 'Montonio UUID ei kattu kinkekaardiga')
  }

  const result: ProcessGiftCardPaymentResult = {
    paid: isPaidMontonioStatus(paymentStatus),
    paymentStatus,
    merchantReference: merchantReference || record.code,
    uuid,
    issued: false,
    alreadyIssued: isGiftCardAlreadyIssued(record),
    cashflowOk: Boolean(record.cashflowPageId),
  }

  if (isPaidMontonioStatus(paymentStatus)) {
    const tokenAmount = parseMontonioAmount(decoded)
    if (!montonioAmountsMatch(tokenAmount, record.amountEur)) {
      console.error(
        '[gift-card-payment] Summa ei kattu',
        record.code,
        'notion=',
        record.amountEur,
        'token=',
        tokenAmount
      )
      throw new GiftCardPaymentError('amount_mismatch', 'Montonio grandTotal ei kattu Notioni Väärtusega')
    }

    const paidDate = tallinnToday()
    const bankName = getMontonioBankName(decoded)
    const next = nextGiftCardStatus({
      currentStatus: record.status,
      paymentStatus,
    })
    if (next === GIFT_CARD_STATUS.active) {
      const updated = await updateGiftCardProperties(
        notionApiKey,
        record.pageId,
        paidGiftCardProperties({
          bank: bankName,
          paidDate,
        })
      )
      if (!updated) {
        throw new GiftCardPaymentError('unknown', 'Kinkekaardi Aktiivne märkimine ebaõnnestus')
      }
    }

    let latest: GiftCardDetails = await getGiftCardByPageId(notionApiKey, record.pageId)
    if (!latest.validUntil) {
      latest = { ...latest, validUntil: fallbackValidUntilFromPurchase(paidDate) }
    }

    if (!latest.cashflowPageId) {
      try {
        const cashflow = await createGiftCardCashflowEntry(notionApiKey, {
          giftCardPageId: latest.pageId,
          buyerName: latest.buyerName || '',
          code: latest.code,
          amountEur: latest.amountEur,
          paidDate,
        })
        result.cashflowOk = cashflow.ok
        if (!cashflow.ok) {
          console.error('[gift-card-payment] Rahavoo kanne ebaõnnestus', latest.code, cashflow.reason)
        }
      } catch (error) {
        result.cashflowOk = false
        console.error('[gift-card-payment] Rahavoo kanne ebaõnnestus', latest.code, error)
      }
    } else {
      result.cashflowOk = true
    }

    const alreadyIssued = isGiftCardAlreadyIssued(latest)
    result.alreadyIssued = alreadyIssued
    if (!alreadyIssued) {
      const issued = await issueGiftCard({
        notionApiKey,
        details: latest,
        force: false,
      })
      result.issued = !issued.alreadyIssued
      result.alreadyIssued = issued.alreadyIssued
      if (result.issued) {
        try {
          await sendGiftCardSoldAdminEmail({
            code: latest.code,
            amountEur: latest.amountEur,
            buyerName: latest.buyerName,
            buyerEmail: latest.buyerEmail,
            bankName,
            cashflowFailed: !result.cashflowOk,
          })
        } catch (error) {
          console.error('[gift-card-payment] Adminikiri ebaõnnestus', latest.code, error)
        }
      }
    }

    return result
  }

  const next = nextGiftCardStatus({
    currentStatus: record.status,
    paymentStatus,
  })
  if (next === GIFT_CARD_STATUS.cancelled) {
    await updateGiftCardProperties(notionApiKey, record.pageId, cancelledGiftCardProperties())
  }

  return result
}

export function giftCardPaymentHttpStatus(error: unknown): number {
  if (error instanceof GiftCardPaymentError) {
    if (error.code === 'invalid_token' || error.code === 'uuid_mismatch' || error.code === 'missing_reference') {
      return 400
    }
    if (error.code === 'amount_mismatch') {
      return 200
    }
  }
  if (isInvalidMontonioTokenError(error)) return 400
  return 500
}
