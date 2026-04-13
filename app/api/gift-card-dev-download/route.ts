import { NextResponse } from 'next/server'
import { buildGiftCardFileResponse } from '@/lib/gift-card-build-file-response'

export const dynamic = 'force-dynamic'

/** Ainult `next dev` — PNG/PDF allalaadimine ilma x-admin-secret (brauseri lingid). */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').trim()
    const format = (searchParams.get('format') || 'png').toLowerCase()
    const fmt = format === 'pdf' ? 'pdf' : 'png'

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

    return await buildGiftCardFileResponse({
      code,
      format: fmt,
      baseUrl,
      notionApiKey: NOTION_API_KEY,
      notionDatabaseId: NOTION_GIFT_CARDS_DATABASE_ID,
      contentDisposition: 'attachment',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-dev-download] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
