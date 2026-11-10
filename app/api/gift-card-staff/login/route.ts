import { NextResponse } from 'next/server'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import {
  createStaffCookieValue,
  isGiftCardStaffConfigured,
  requestIsHttps,
  staffCookieSetOptions,
  staffPinMatches,
  GIFT_CARD_STAFF_COOKIE,
} from '@/lib/gift-card-staff-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!isGiftCardStaffConfigured()) {
      return NextResponse.json({ ok: false, errorCode: 'disabled' }, { status: 404 })
    }

    const ip = getClientIp(request.headers)
    const limited = rateLimit(`gift-staff-pin:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 5,
      minIntervalMs: 2000,
    })
    if (!limited.allowed) {
      return NextResponse.json({ ok: false, errorCode: 'rateLimited' }, { status: 429 })
    }

    const body = (await request.json().catch(() => null)) as { pin?: unknown } | null
    const pin = typeof body?.pin === 'string' ? body.pin : ''
    if (!staffPinMatches(pin)) {
      return NextResponse.json({ ok: false, errorCode: 'badPin' }, { status: 401 })
    }

    const value = createStaffCookieValue()
    if (!value) {
      return NextResponse.json({ ok: false, errorCode: 'disabled' }, { status: 404 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(GIFT_CARD_STAFF_COOKIE, value, staffCookieSetOptions(requestIsHttps(request)))
    return res
  } catch (error) {
    console.error('[gift-card-staff/login]', error)
    return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
  }
}
