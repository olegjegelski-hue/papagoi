import { NextRequest, NextResponse } from 'next/server'
import { createGiftCardOrder } from '@/lib/notion-gift-cards'
import { markGiftCardCancelled, saveGiftCardMontonioUuid } from '@/lib/notion-gift-card-lookup'
import { cleanText } from '@/lib/sanitize'
import { parseVisitMailLocale } from '@/lib/visit-language'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { splitPersonName } from '@/lib/donation'
import {
  createMontonioOrder,
  hasMontonioConfig,
  isSafeMontonioPaymentUrl,
  MontonioConfigError,
} from '@/lib/montonio'
import { giftCardPaymentDescription } from '@/lib/gift-card'
import { getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'
const MAX_AMOUNT = 1000

async function createGiftCardMontonioOrder(input: {
  code: string
  amountEur: number
  locale: 'et' | 'en' | 'ru'
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
}) {
  const site = getSiteUrl()
  const { firstName, lastName } = splitPersonName(input.buyerName)
  const description = giftCardPaymentDescription(input.code)
  const billingAddress: {
    firstName: string
    lastName: string
    email: string
    country: 'EE'
    phoneNumber?: string
  } = {
    firstName,
    lastName,
    email: input.buyerEmail,
    country: 'EE',
  }
  if (input.buyerPhone) {
    billingAddress.phoneNumber = input.buyerPhone
  }

  return createMontonioOrder({
    merchantReference: input.code,
    returnUrl: `${site}/${input.locale}/kinkekaart/aitah`,
    notificationUrl: `${site}/api/montonio/notification`,
    currency: 'EUR',
    grandTotal: input.amountEur,
    locale: input.locale,
    billingAddress,
    lineItems: [
      {
        name: description,
        quantity: 1,
        finalPrice: input.amountEur,
      },
    ],
    payment: {
      method: 'paymentInitiation',
      methodDisplay: 'Pangalink',
      amount: input.amountEur,
      currency: 'EUR',
      methodOptions: {
        preferredCountry: 'EE',
        preferredLocale: input.locale,
        paymentDescription: description,
      },
    },
  })
}

export async function POST(request: NextRequest) {
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

    const ip = getClientIp(request.headers)
    const rl = rateLimit(`gift-card-order:${ip}`, { windowMs: 10 * 60 * 1000, max: 10, minIntervalMs: 5 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, errorCode: 'rateLimited' }, { status: 429 })
    }

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

    if (!hasMontonioConfig()) {
      console.error('Missing MONTONIO_ACCESS_KEY or MONTONIO_SECRET_KEY')
      return NextResponse.json({ ok: false, errorCode: 'serverConfig' }, { status: 500 })
    }

    const result = await createGiftCardOrder(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, {
      buyerName: cleanedName,
      buyerEmail: cleanedEmail,
      buyerPhone: cleanedPhone,
      amountEur: amountNum,
    })

    console.log(
      '[gift-card-order] Notion leht loodud:',
      result.pageId,
      'kood:',
      result.code,
      'DB:',
      NOTION_GIFT_CARDS_DATABASE_ID.replace(/-/g, '').slice(-8)
    )

    let paymentUrl: string
    let uuid: string
    try {
      const created = await createGiftCardMontonioOrder({
        code: result.code,
        amountEur: amountNum,
        locale,
        buyerName: cleanedName,
        buyerEmail: cleanedEmail,
        buyerPhone: cleanedPhone || undefined,
      })
      paymentUrl = created.paymentUrl
      uuid = created.uuid
    } catch (montonioError) {
      console.error('[gift-card-order] Montonio tellimus ebaõnnestus:', montonioError)
      await markGiftCardCancelled(NOTION_API_KEY, result.pageId)
      if (montonioError instanceof MontonioConfigError) {
        return NextResponse.json({ ok: false, errorCode: 'serverConfig' }, { status: 500 })
      }
      return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
    }

    const saved = await saveGiftCardMontonioUuid(NOTION_API_KEY, result.pageId, uuid)
    if (!saved) {
      console.error('[gift-card-order] Montonio UUID salvestamine ebaõnnestus', result.code, result.pageId)
    }

    if (!isSafeMontonioPaymentUrl(paymentUrl)) {
      console.error('[gift-card-order] Montonio tagastas mitteturvalise paymentUrl')
      await markGiftCardCancelled(NOTION_API_KEY, result.pageId)
      return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      code: result.code,
      pageId: result.pageId,
      paymentUrl,
    })
  } catch (error) {
    console.error('Gift card order error:', error)
    return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
  }
}
