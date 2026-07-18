import { NextResponse } from 'next/server'
import { buildGiftCardFileResponse } from '@/lib/gift-card-build-file-response'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Avalik: PDF/PNG kinkekaardi koodiga (ilma admin secretita). Nõuab ?code= */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const limited = rateLimit(ip, { windowMs: 60_000, max: 20, minIntervalMs: 500 })
    if (!limited.allowed) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').trim()
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
    }

    const format = (searchParams.get('format') || 'pdf').toLowerCase()
    const fmt = format === 'png' ? 'png' : 'pdf'
    const disposition =
      searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment'

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papagoi.ee').replace(/\/$/, '')

    return await buildGiftCardFileResponse({
      code,
      format: fmt,
      baseUrl,
      notionApiKey: NOTION_API_KEY,
      notionDatabaseId: NOTION_GIFT_CARDS_DATABASE_ID,
      contentDisposition: disposition,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-print] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
