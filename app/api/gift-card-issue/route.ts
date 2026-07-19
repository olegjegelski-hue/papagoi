import { NextResponse } from 'next/server'
import { getGiftCardDetailsByCode, setGiftCardQrUrl } from '@/lib/notion-gift-card-lookup'
import { renderGiftCardToPngPdf } from '@/lib/gift-card-render'
import { sendGiftCardIssuedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee'
    const qrUrl = `${baseUrl}/kinkekaart/lunasta?code=${encodeURIComponent(code)}`

    const details = await getGiftCardDetailsByCode(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, code)
    if (!details) {
      return NextResponse.json({ ok: false, error: 'Gift card not found' }, { status: 404 })
    }

    if (!details.buyerEmail) {
      return NextResponse.json({ ok: false, error: 'Gift card has no buyer email in Notion' }, { status: 400 })
    }

    // Kui QR URL on juba seadistatud, loeme seda “väljastatuks” (idempotency marker).
    if (!force && details.qrUrl && details.qrUrl === qrUrl) {
      return NextResponse.json({ ok: true, alreadyIssued: true, pageId: details.pageId })
    }

    const { pngBuffer, pdfBuffer } = await renderGiftCardToPngPdf({
      code: details.code,
      amountEur: details.amountEur,
      validUntil: details.validUntil,
      qrUrl,
    })

    await sendGiftCardIssuedEmail({
      to: details.buyerEmail || '',
      buyerName: details.buyerName,
      amountEur: details.amountEur,
      code: details.code,
      validUntil: details.validUntil,
      pngBuffer,
      pdfBuffer,
      qrUrl,
    })

    // Märgime Notionis, et kaardi väljastus on tehtud (ja QR-i väärtus on valmis).
    await setGiftCardQrUrl(NOTION_API_KEY, details.pageId, qrUrl)

    return NextResponse.json({ ok: true, pageId: details.pageId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-issue] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

