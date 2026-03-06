import { NextResponse } from 'next/server'
import { createGiftCardOrder } from '@/lib/notion-gift-cards'
import { sendGiftCardOrderEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, amount } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Nimi on kohustuslik' },
        { status: 400 }
      )
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { ok: false, error: 'E-post on kohustuslik' },
        { status: 400 }
      )
    }
    const amountNum = typeof amount === 'number' ? amount : parseInt(String(amount), 10)
    if (Number.isNaN(amountNum) || amountNum < 10 || amountNum % 10 !== 0) {
      return NextResponse.json(
        { ok: false, error: 'Väärtus peab olema vähemalt 10 € ja 10 € kordne' },
        { status: 400 }
      )
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID

    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      console.error('Missing NOTION_API_KEY or NOTION_GIFT_CARDS_DATABASE_ID')
      return NextResponse.json(
        { ok: false, error: 'Serveri seadistus puudub' },
        { status: 500 }
      )
    }

    const result = await createGiftCardOrder(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, {
      buyerName: name.trim(),
      buyerEmail: email.trim(),
      buyerPhone: typeof phone === 'string' ? phone.trim() : '',
      amountEur: amountNum,
    })

    await sendGiftCardOrderEmail({
      to: email.trim(),
      buyerName: name.trim(),
      amountEur: amountNum,
      code: result.code,
    })

    return NextResponse.json({ ok: true, code: result.code })
  } catch (error) {
    console.error('Gift card order error:', error)
    const message = error instanceof Error ? error.message : 'Tundmatu viga'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
