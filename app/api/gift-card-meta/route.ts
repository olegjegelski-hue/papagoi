import { NextResponse } from 'next/server'
import { getGiftCardDetailsByCode } from '@/lib/notion-gift-card-lookup'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * Kerge diagnostika: kas Notionist tuleb kehtivuskuupäev.
 * Ei tagasta ostja PII-d.
 */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const limited = rateLimit(ip, { windowMs: 60_000, max: 30, minIntervalMs: 200 })
    if (!limited.allowed) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').trim()
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const details = await getGiftCardDetailsByCode(
      NOTION_API_KEY,
      NOTION_GIFT_CARDS_DATABASE_ID,
      code
    )

    if (!details) {
      return NextResponse.json({ ok: false, error: 'Gift card not found' }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      code: details.code,
      amountEur: details.amountEur,
      validUntil: details.validUntil || null,
      hasValidUntil: Boolean(details.validUntil),
      used: Boolean(details.usedAt),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-meta] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
