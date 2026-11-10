import type { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import { cookies, headers } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import GiftCardRedeemView from '@/components/GiftCardRedeemView'
import { getGiftCardDetailsByCode } from '@/lib/notion-gift-card-lookup'
import { toGiftCardPublicView, canMarkGiftCardUsed, canUndoGiftCardUsed } from '@/lib/gift-card-status'
import { listTodaysVisitors } from '@/lib/gift-card-redeem'
import {
  GIFT_CARD_STAFF_COOKIE,
  isGiftCardStaffConfigured,
  verifyStaffCookieValue,
} from '@/lib/gift-card-staff-auth'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseCode(searchParams: Record<string, string | string[] | undefined>): string {
  const raw = searchParams.code
  if (typeof raw === 'string') return raw.trim()
  if (Array.isArray(raw) && raw[0]) return raw[0].trim()
  return ''
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'GiftCardRedeem' })
  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  }
}

export default async function GiftCardRedeemPage({ params, searchParams }: Props) {
  noStore()
  const { locale } = await params
  setRequestLocale(locale)
  const code = parseCode(await searchParams)
  const staffEnabled = isGiftCardStaffConfigured()
  const staffLoggedIn = staffEnabled && verifyStaffCookieValue(cookies().get(GIFT_CARD_STAFF_COOKIE)?.value)

  if (!code) {
    return (
      <GiftCardRedeemView
        queryCode=""
        card={null}
        staffEnabled={staffEnabled}
        staff={staffLoggedIn ? { loggedIn: true, visitors: [], canMark: false, canUndo: false, blockKind: null } : null}
      />
    )
  }

  const ip = getClientIp(headers())
  const limited = rateLimit(`gift-redeem-lookup:${ip}`, {
    windowMs: 60_000,
    max: 20,
    minIntervalMs: 400,
  })
  if (!limited.allowed) {
    return (
      <GiftCardRedeemView
        queryCode={code}
        card={null}
        rateLimited
        staffEnabled={staffEnabled}
        staff={null}
      />
    )
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
  if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
    return (
      <GiftCardRedeemView
        queryCode={code}
        card={null}
        serverError
        staffEnabled={staffEnabled}
        staff={null}
      />
    )
  }

  let details = null
  try {
    details = await getGiftCardDetailsByCode(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, code)
  } catch (error) {
    console.error('[kinkekaart/lunasta]', error)
    return (
      <GiftCardRedeemView
        queryCode={code}
        card={null}
        serverError
        staffEnabled={staffEnabled}
        staff={null}
      />
    )
  }

  const card = toGiftCardPublicView(details)
  let visitors: Awaited<ReturnType<typeof listTodaysVisitors>> = []
  if (staffLoggedIn && card?.kind === 'valid') {
    try {
      visitors = await listTodaysVisitors()
    } catch (error) {
      console.error('[kinkekaart/lunasta] today visitors', error)
    }
  }

  return (
    <GiftCardRedeemView
      queryCode={code}
      card={card}
      staffEnabled={staffEnabled}
      staff={
        staffLoggedIn
          ? {
              loggedIn: true,
              visitors,
              canMark: canMarkGiftCardUsed(details),
              canUndo: canUndoGiftCardUsed(details),
              blockKind: card?.kind && card.kind !== 'valid' ? card.kind : null,
            }
          : staffEnabled
            ? { loggedIn: false, visitors: [], canMark: false, canUndo: false, blockKind: null }
            : null
      }
    />
  )
}
