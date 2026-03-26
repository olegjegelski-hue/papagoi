import { NextResponse } from 'next/server'
import { getGiftCardDetailsByCode } from '@/lib/notion-gift-card-lookup'
import { renderGiftCardToPngPdf } from '@/lib/gift-card-render'

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

    if (!code) {
      return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papagoi.ee'
    const qrUrl = `${baseUrl}/kinkekaart/lunasta?code=${encodeURIComponent(code)}`

    const details = await getGiftCardDetailsByCode(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, code)
    if (!details) {
      return NextResponse.json({ ok: false, error: 'Gift card not found' }, { status: 404 })
    }

    const { pngBuffer, pdfBuffer } = await renderGiftCardToPngPdf({
      code: details.code,
      amountEur: details.amountEur,
      validUntil: details.validUntil,
      qrUrl,
    })

    if (format === 'pdf') {
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="kinkekaart-${details.code}.pdf"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      })
    }

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="kinkekaart-${details.code}.png"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-preview] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

