import { NextResponse } from 'next/server'
import { buildGiftCardFileResponse } from '@/lib/gift-card-build-file-response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const expectedSecret = process.env.GIFT_CARD_ISSUE_SECRET
    const providedSecret = request.headers.get('x-admin-secret')
    if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').trim()
    const format = (searchParams.get('format') || 'png').toLowerCase()
    const fmt = format === 'pdf' ? 'pdf' : 'png'

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee'

    return await buildGiftCardFileResponse({
      code,
      format: fmt,
      baseUrl,
      notionApiKey: NOTION_API_KEY,
      notionDatabaseId: NOTION_GIFT_CARDS_DATABASE_ID,
      contentDisposition: 'inline',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-preview] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
