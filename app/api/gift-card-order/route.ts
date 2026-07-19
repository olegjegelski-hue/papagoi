import { NextResponse } from 'next/server'
import { createGiftCardOrder } from '@/lib/notion-gift-cards'
import { sendGiftCardOrderEmail } from '@/lib/email'
import { cleanText } from '@/lib/sanitize'
import { parseVisitMailLocale } from '@/lib/visit-language'

export const dynamic = 'force-dynamic'
const MAX_AMOUNT = 1000

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, amount, confirm, botField, locale: localeRaw } = body
    const locale = parseVisitMailLocale(typeof localeRaw === 'string' ? localeRaw : 'et')

    const cleanedName = cleanText(name, { max: 120 })
    const cleanedEmail = cleanText(email, { max: 254 })
    const cleanedPhone = cleanText(phone || '', { max: 40 })

    if (!cleanedName) {
      return NextResponse.json({ ok: false, errorCode: 'nameRequired' }, { status: 400 })
    }
    if (!cleanedEmail) {
      return NextResponse.json({ ok: false, errorCode: 'emailRequired' }, { status: 400 })
    }

    // Honeypot: kui see väli on täidetud, eeldame, et tegemist on robotiga.
    if (typeof botField === 'string' && botField.trim() !== '') {
      console.log('[gift-card-order] Honeypot täidetud, päring vahele jäetud')
      return NextResponse.json({ ok: true })
    }

    if (confirm !== true) {
      return NextResponse.json({ ok: false, errorCode: 'confirmRequired' }, { status: 400 })
    }

    // Emaili formaadi kontroll
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanedEmail)) {
      return NextResponse.json({ ok: false, errorCode: 'emailInvalid' }, { status: 400 })
    }

    const amountNum = typeof amount === 'number' ? amount : parseInt(String(amount), 10)
    if (Number.isNaN(amountNum) || amountNum < 10 || amountNum % 10 !== 0 || amountNum > MAX_AMOUNT) {
      return NextResponse.json({ ok: false, errorCode: 'amountInvalid' }, { status: 400 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID

    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      console.error('Missing NOTION_API_KEY or NOTION_GIFT_CARDS_DATABASE_ID')
      return NextResponse.json({ ok: false, errorCode: 'serverConfig' }, { status: 500 })
    }

    const result = await createGiftCardOrder(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, {
      buyerName: cleanedName,
      buyerEmail: cleanedEmail,
      buyerPhone: cleanedPhone,
      amountEur: amountNum,
    })

    console.log('[gift-card-order] Notion leht loodud:', result.pageId, 'kood:', result.code, 'DB:', NOTION_GIFT_CARDS_DATABASE_ID.replace(/-/g, '').slice(-8))

    await sendGiftCardOrderEmail({
      to: cleanedEmail,
      buyerName: cleanedName,
      amountEur: amountNum,
      code: result.code,
      locale,
    })

    return NextResponse.json({ ok: true, code: result.code, pageId: result.pageId })
  } catch (error) {
    console.error('Gift card order error:', error)
    return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
  }
}
