import { NextRequest, NextResponse } from 'next/server'
import {
  createDonation,
  markDonationCancelled,
  saveDonationMontonioUuid,
} from '@/lib/notion-donations'
import { cleanText } from '@/lib/sanitize'
import { parseVisitMailLocale } from '@/lib/visit-language'
import { isAllowedOrigin } from '@/lib/origin'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import {
  DONATION_COMMENT_MAX,
  DONATION_REFERENCE_NUMBER,
  donationPaymentDescription,
  parseDonationAmount,
  parseDonationPurpose,
  splitPersonName,
} from '@/lib/donation'
import {
  createMontonioOrder,
  hasMontonioConfig,
  isSafeMontonioPaymentUrl,
  MontonioConfigError,
} from '@/lib/montonio'
import { getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function createDonationMontonioOrder(input: {
  code: string
  amountEur: number
  purpose: 'kingi' | 'toit' | 'uldine'
  locale: 'et' | 'en' | 'ru'
  donorName: string
  donorEmail: string
  includeReference: boolean
}) {
  const site = getSiteUrl()
  const { firstName, lastName } = splitPersonName(input.donorName)
  const description = donationPaymentDescription(input.code, input.purpose)
  const methodOptions: {
    preferredCountry: 'EE'
    preferredLocale: 'et' | 'en' | 'ru'
    paymentDescription: string
    paymentReference?: string
  } = {
    preferredCountry: 'EE',
    preferredLocale: input.locale,
    paymentDescription: description,
  }
  if (input.includeReference) {
    methodOptions.paymentReference = DONATION_REFERENCE_NUMBER[input.purpose]
  }

  return createMontonioOrder({
    merchantReference: input.code,
    returnUrl: `${site}/${input.locale}/toetused/aitah`,
    notificationUrl: `${site}/api/montonio/notification`,
    currency: 'EUR',
    grandTotal: input.amountEur,
    locale: input.locale,
    billingAddress: {
      firstName,
      lastName,
      email: input.donorEmail,
      country: 'EE',
    },
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
      methodOptions,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ ok: false, errorCode: 'forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      amount,
      purpose: purposeRaw,
      comment: commentRaw,
      publishName,
      confirm,
      botField,
      locale: localeRaw,
    } = body
    const locale = parseVisitMailLocale(typeof localeRaw === 'string' ? localeRaw : 'et')

    const cleanedName = cleanText(name, { max: 120 })
    const cleanedEmail = cleanText(email, { max: 254 })
    const cleanedComment = cleanText(commentRaw || '', { max: DONATION_COMMENT_MAX, preserveNewlines: true })

    if (!cleanedName) {
      return NextResponse.json({ ok: false, errorCode: 'nameRequired' }, { status: 400 })
    }
    if (!cleanedEmail) {
      return NextResponse.json({ ok: false, errorCode: 'emailRequired' }, { status: 400 })
    }

    if (typeof botField === 'string' && botField.trim() !== '') {
      console.log('[donation] Honeypot täidetud, päring vahele jäetud')
      return NextResponse.json({ ok: true })
    }

    if (confirm !== true) {
      return NextResponse.json({ ok: false, errorCode: 'confirmRequired' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanedEmail)) {
      return NextResponse.json({ ok: false, errorCode: 'emailInvalid' }, { status: 400 })
    }

    const purpose = parseDonationPurpose(purposeRaw)
    if (!purpose) {
      return NextResponse.json({ ok: false, errorCode: 'purposeRequired' }, { status: 400 })
    }

    const amountNum = parseDonationAmount(amount)
    if (amountNum == null) {
      return NextResponse.json({ ok: false, errorCode: 'amountInvalid' }, { status: 400 })
    }

    const ip = getClientIp(request.headers)
    const rl = rateLimit(`donation:${ip}`, { windowMs: 10 * 60 * 1000, max: 10, minIntervalMs: 5 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, errorCode: 'rateLimited' }, { status: 429 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_DONATIONS_DATABASE_ID = process.env.NOTION_DONATIONS_DATABASE_ID

    if (!NOTION_API_KEY || !NOTION_DONATIONS_DATABASE_ID) {
      console.error('Missing NOTION_API_KEY or NOTION_DONATIONS_DATABASE_ID')
      return NextResponse.json({ ok: false, errorCode: 'serverConfig' }, { status: 500 })
    }

    if (!hasMontonioConfig()) {
      console.error('Missing MONTONIO_ACCESS_KEY or MONTONIO_SECRET_KEY')
      return NextResponse.json({ ok: false, errorCode: 'serverConfig' }, { status: 500 })
    }

    const result = await createDonation(NOTION_API_KEY, NOTION_DONATIONS_DATABASE_ID, {
      donorName: cleanedName,
      donorEmail: cleanedEmail,
      amountEur: amountNum,
      purpose,
      publishName: publishName === true,
      comment: cleanedComment,
      locale,
    })

    console.log(
      '[donation] Notion leht loodud:',
      result.pageId,
      'kood:',
      result.code,
      'DB:',
      NOTION_DONATIONS_DATABASE_ID.replace(/-/g, '').slice(-8)
    )

    let paymentUrl: string
    let uuid: string
    try {
      try {
        const created = await createDonationMontonioOrder({
          code: result.code,
          amountEur: amountNum,
          purpose,
          locale,
          donorName: cleanedName,
          donorEmail: cleanedEmail,
          includeReference: true,
        })
        paymentUrl = created.paymentUrl
        uuid = created.uuid
      } catch (firstError) {
        const message = firstError instanceof Error ? firstError.message : ''
        if (/paymentReference|reference number|viitenumber/i.test(message)) {
          console.warn('[donation] Montonio lükkas paymentReference tagasi, proovin ilma')
          const created = await createDonationMontonioOrder({
            code: result.code,
            amountEur: amountNum,
            purpose,
            locale,
            donorName: cleanedName,
            donorEmail: cleanedEmail,
            includeReference: false,
          })
          paymentUrl = created.paymentUrl
          uuid = created.uuid
        } else {
          throw firstError
        }
      }
    } catch (montonioError) {
      console.error('[donation] Montonio tellimus ebaõnnestus:', montonioError)
      await markDonationCancelled(NOTION_API_KEY, result.pageId)
      if (montonioError instanceof MontonioConfigError) {
        return NextResponse.json({ ok: false, errorCode: 'serverConfig' }, { status: 500 })
      }
      return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
    }

    const saved = await saveDonationMontonioUuid(NOTION_API_KEY, result.pageId, uuid)
    if (!saved) {
      console.error('[donation] Montonio UUID salvestamine ebaõnnestus', result.code, result.pageId)
    }

    if (!isSafeMontonioPaymentUrl(paymentUrl)) {
      console.error('[donation] Montonio tagastas mitteturvalise paymentUrl')
      await markDonationCancelled(NOTION_API_KEY, result.pageId)
      return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      code: result.code,
      pageId: result.pageId,
      paymentUrl,
    })
  } catch (error) {
    console.error('Donation error:', error)
    return NextResponse.json({ ok: false, errorCode: 'unknown' }, { status: 500 })
  }
}
