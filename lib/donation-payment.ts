import { DONATION_STATUS } from '@/lib/donation'
import { sendDonationPaidEmails } from '@/lib/email'
import { MontonioConfigError } from '@/lib/montonio'
import {
  decodeMontonioOrderToken,
  getMontonioBankName,
  getMontonioPaymentStatus,
  isCancelledMontonioStatus,
  isInvalidMontonioTokenError,
  isPaidMontonioStatus,
  montonioAmountsMatch,
  parseMontonioAmount,
  type MontonioOrderTokenPayload,
} from '@/lib/montonio-payment'
import {
  cancelledDonationProperties,
  findDonationByMontonio,
  getDonationByPageId,
  paidDonationProperties,
  thankYouSentProperties,
  updateDonationProperties,
  type DonationRecord,
} from '@/lib/notion-donations'
import { tallinnToday } from '@/lib/gift-card-status'

export type DonationPaymentErrorCode =
  | 'invalid_token'
  | 'missing_reference'
  | 'not_found'
  | 'uuid_mismatch'
  | 'amount_mismatch'
  | 'config'
  | 'unknown'

export class DonationPaymentError extends Error {
  code: DonationPaymentErrorCode
  constructor(code: DonationPaymentErrorCode, message: string) {
    super(message)
    this.name = 'DonationPaymentError'
    this.code = code
  }
}

export function nextDonationStatus(input: {
  currentStatus: string | null
  paymentStatus: string
}): (typeof DONATION_STATUS)['paid'] | (typeof DONATION_STATUS)['cancelled'] | null {
  const alreadyPaid = input.currentStatus === DONATION_STATUS.paid
  if (isPaidMontonioStatus(input.paymentStatus)) {
    return alreadyPaid ? null : DONATION_STATUS.paid
  }
  if (isCancelledMontonioStatus(input.paymentStatus)) {
    if (alreadyPaid) return null
    return DONATION_STATUS.cancelled
  }
  return null
}

export function shouldSendDonationThankYou(record: Pick<DonationRecord, 'thankYouSent'>): boolean {
  return !record.thankYouSent
}

export type ProcessDonationPaymentResult = {
  paid: boolean
  paymentStatus: string
  merchantReference: string
  uuid?: string
  emailsSent: boolean
}

async function sendThankYouOnce(
  notionApiKey: string,
  record: DonationRecord,
  bankName: string
): Promise<boolean> {
  const latest = await getDonationByPageId(notionApiKey, record.pageId)
  if (latest.thankYouSent) return false
  if (!latest.purpose) {
    console.error('[donation-payment] Tänukirja ei saa saata: sihtotstarve puudub', latest.code)
    return false
  }

  const marked = await updateDonationProperties(
    notionApiKey,
    latest.pageId,
    thankYouSentProperties(true)
  )
  if (!marked) {
    throw new DonationPaymentError('unknown', 'Tänukiri saadetud märkimine ebaõnnestus')
  }

  try {
    await sendDonationPaidEmails({
      to: latest.donorEmail,
      donorName: latest.donorName,
      donorEmail: latest.donorEmail,
      amountEur: latest.amountEur,
      purpose: latest.purpose,
      code: latest.code,
      comment: latest.comment,
      publishName: latest.publishName,
      locale: latest.locale,
      bankName,
    })
    return true
  } catch (error) {
    await updateDonationProperties(notionApiKey, latest.pageId, thankYouSentProperties(false))
    throw error
  }
}

export async function processDonationMontonioPayment(input: {
  token: string
  requestHeaders?: Headers
}): Promise<ProcessDonationPaymentResult> {
  const notionApiKey = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_DONATIONS_DATABASE_ID
  if (!notionApiKey || !databaseId) {
    throw new DonationPaymentError('config', 'Missing NOTION_API_KEY or NOTION_DONATIONS_DATABASE_ID')
  }

  let decoded: MontonioOrderTokenPayload
  try {
    decoded = decodeMontonioOrderToken(input.token)
  } catch (error) {
    if (error instanceof MontonioConfigError) {
      throw new DonationPaymentError('config', error.message)
    }
    throw new DonationPaymentError(
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
      '[donation-payment]',
      paymentStatus,
      merchantReference || '(ref puudub)',
      uuid || '(uuid puudub)',
      'ip=',
      forwarded.split(',')[0]?.trim() || 'unknown'
    )
  }

  if (!merchantReference && !uuid) {
    throw new DonationPaymentError('missing_reference', 'Montonio tokenis puudub merchantReference')
  }

  const record = await findDonationByMontonio(notionApiKey, databaseId, {
    uuid,
    merchantReference,
  })
  if (!record) {
    throw new DonationPaymentError(
      'not_found',
      `Annetust ei leitud: ${merchantReference || uuid || ''}`
    )
  }

  if (record.montonioUuid && uuid && record.montonioUuid !== uuid) {
    throw new DonationPaymentError('uuid_mismatch', 'Montonio UUID ei kattu annetusega')
  }

  const result: ProcessDonationPaymentResult = {
    paid: isPaidMontonioStatus(paymentStatus),
    paymentStatus,
    merchantReference: merchantReference || record.code,
    uuid,
    emailsSent: false,
  }

  if (isPaidMontonioStatus(paymentStatus)) {
    const tokenAmount = parseMontonioAmount(decoded)
    if (!montonioAmountsMatch(tokenAmount, record.amountEur)) {
      console.error(
        '[donation-payment] Summa ei kattu',
        record.code,
        'notion=',
        record.amountEur,
        'token=',
        tokenAmount
      )
      throw new DonationPaymentError('amount_mismatch', 'Montonio grandTotal ei kattu Notioni Summaga')
    }

    const next = nextDonationStatus({
      currentStatus: record.status,
      paymentStatus,
    })
    if (next === DONATION_STATUS.paid) {
      const updated = await updateDonationProperties(
        notionApiKey,
        record.pageId,
        paidDonationProperties({
          bank: getMontonioBankName(decoded),
          paidDate: tallinnToday(),
        })
      )
      if (!updated) {
        throw new DonationPaymentError('unknown', 'Annetuse Laekunud märkimine ebaõnnestus')
      }
    }

    if (shouldSendDonationThankYou(record)) {
      result.emailsSent = await sendThankYouOnce(
        notionApiKey,
        record,
        getMontonioBankName(decoded)
      )
    }
    return result
  }

  const next = nextDonationStatus({
    currentStatus: record.status,
    paymentStatus,
  })
  if (next === DONATION_STATUS.cancelled) {
    await updateDonationProperties(notionApiKey, record.pageId, cancelledDonationProperties())
  }

  return result
}

export function donationPaymentHttpStatus(error: unknown): number {
  if (error instanceof DonationPaymentError) {
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
