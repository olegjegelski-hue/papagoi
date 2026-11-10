import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import {
  GIFT_CARD_STAFF_COOKIE,
  isGiftCardStaffConfigured,
  verifyStaffCookieValue,
} from '@/lib/gift-card-staff-auth'
import { markGiftCardUsed, undoGiftCardUsed } from '@/lib/gift-card-redeem'

export const dynamic = 'force-dynamic'

function staffAuthorized(): boolean {
  if (!isGiftCardStaffConfigured()) return false
  const token = cookies().get(GIFT_CARD_STAFF_COOKIE)?.value
  return verifyStaffCookieValue(token)
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const limited = rateLimit(`gift-redeem-write:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 20,
      minIntervalMs: 1000,
    })
    if (!limited.allowed) {
      return NextResponse.json({ ok: false, errorCode: 'rateLimited' }, { status: 429 })
    }

    if (!staffAuthorized()) {
      return NextResponse.json({ ok: false, errorCode: 'unauthorized' }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as {
      action?: unknown
      code?: unknown
      visitorId?: unknown
      confirm?: unknown
    } | null

    const code = typeof body?.code === 'string' ? body.code.trim() : ''
    if (!code) {
      return NextResponse.json({ ok: false, errorCode: 'missingCode' }, { status: 400 })
    }
    if (body?.confirm !== true) {
      return NextResponse.json({ ok: false, errorCode: 'confirmRequired' }, { status: 400 })
    }

    const action = body?.action === 'undo' ? 'undo' : 'mark'

    if (action === 'undo') {
      const result = await undoGiftCardUsed({ code })
      if (!result.ok) {
        const status = result.errorCode === 'notFound' ? 404 : 409
        return NextResponse.json(result, { status })
      }
      return NextResponse.json(result)
    }

    const visitorRaw = typeof body?.visitorId === 'string' ? body.visitorId.trim() : ''
    const visitorId = visitorRaw && visitorRaw !== 'none' ? visitorRaw : null
    const result = await markGiftCardUsed({ code, visitorId })
    if (!result.ok) {
      const status =
        result.errorCode === 'notFound' ? 404 : result.errorCode === 'visitorInvalid' ? 400 : 409
      return NextResponse.json(result, { status })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('[gift-card-redeem]', error)
    return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
  }
}
