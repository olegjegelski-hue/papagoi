import { NextResponse } from 'next/server'
import {
  GIFT_CARD_STAFF_COOKIE,
  requestIsHttps,
  staffCookieClearOptions,
} from '@/lib/gift-card-staff-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(GIFT_CARD_STAFF_COOKIE, '', staffCookieClearOptions(requestIsHttps(request)))
  return res
}
