import { NextResponse } from 'next/server'
import { getGiftCardDetailsByCode } from '@/lib/notion-gift-card-lookup'
import { issueGiftCard } from '@/lib/gift-card-issue'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; force?: boolean }
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    const force = body.force === true

    if (!code) {
      return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
    }

    const expectedSecret = process.env.GIFT_CARD_ISSUE_SECRET
    const providedSecret = request.headers.get('x-admin-secret')
    if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const details = await getGiftCardDetailsByCode(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, code)
    if (!details) {
      return NextResponse.json({ ok: false, error: 'Gift card not found' }, { status: 404 })
    }

    const result = await issueGiftCard({
      notionApiKey: NOTION_API_KEY,
      details,
      force,
    })

    return NextResponse.json({
      ok: true,
      alreadyIssued: result.alreadyIssued,
      pageId: result.pageId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-issue] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
