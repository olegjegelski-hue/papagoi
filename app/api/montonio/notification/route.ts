import { NextRequest, NextResponse } from 'next/server'
import {
  DonationPaymentError,
  donationPaymentHttpStatus,
  processDonationMontonioPayment,
} from '@/lib/donation-payment'
import {
  GiftCardPaymentError,
  giftCardPaymentHttpStatus,
  isGiftCardMerchantReference,
  processGiftCardMontonioPayment,
} from '@/lib/gift-card-payment'
import {
  decodeMontonioOrderToken,
  extractMontonioOrderToken,
} from '@/lib/montonio-payment'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  if (typeof body.refundToken === 'string' && !body.orderToken) {
    return NextResponse.json({ ok: true, ignored: 'refund' })
  }

  const token = extractMontonioOrderToken({
    body,
    searchParams: request.nextUrl.searchParams,
  })

  if (!token) {
    return NextResponse.json({ error: 'Missing orderToken' }, { status: 400 })
  }

  let merchantReference = ''
  try {
    const decoded = decodeMontonioOrderToken(token)
    merchantReference = typeof decoded.merchantReference === 'string' ? decoded.merchantReference : ''
  } catch {
    merchantReference = ''
  }

  const isGiftCard = isGiftCardMerchantReference(merchantReference)

  try {
    if (isGiftCard) {
      const result = await processGiftCardMontonioPayment({
        token,
        requestHeaders: request.headers,
      })
      return NextResponse.json({
        success: true,
        paid: result.paid,
        paymentStatus: result.paymentStatus,
        merchantReference: result.merchantReference,
        kind: 'gift-card',
      })
    }

    const result = await processDonationMontonioPayment({
      token,
      requestHeaders: request.headers,
    })
    return NextResponse.json({
      success: true,
      paid: result.paid,
      paymentStatus: result.paymentStatus,
      merchantReference: result.merchantReference,
      kind: 'donation',
    })
  } catch (error) {
    const status = isGiftCard ? giftCardPaymentHttpStatus(error) : donationPaymentHttpStatus(error)
    const code =
      error instanceof GiftCardPaymentError || error instanceof DonationPaymentError
        ? error.code
        : 'unknown'
    if (code === 'amount_mismatch') {
      return NextResponse.json({
        success: false,
        reason: 'amount_mismatch',
      })
    }
    console.error('[montonio/notification]', isGiftCard ? 'gift-card' : 'donation', code, error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status }
    )
  }
}
