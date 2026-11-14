import { NextRequest, NextResponse } from 'next/server'
import {
  DonationPaymentError,
  donationPaymentHttpStatus,
  processDonationMontonioPayment,
} from '@/lib/donation-payment'
import { extractMontonioOrderToken } from '@/lib/montonio-payment'

export const dynamic = 'force-dynamic'

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

  try {
    const result = await processDonationMontonioPayment({
      token,
      requestHeaders: request.headers,
    })
    return NextResponse.json({
      success: true,
      paid: result.paid,
      paymentStatus: result.paymentStatus,
      merchantReference: result.merchantReference,
    })
  } catch (error) {
    const status = donationPaymentHttpStatus(error)
    const code = error instanceof DonationPaymentError ? error.code : 'unknown'
    if (code === 'amount_mismatch') {
      return NextResponse.json({
        success: false,
        reason: 'amount_mismatch',
      })
    }
    console.error('[montonio/notification]', code, error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status }
    )
  }
}
