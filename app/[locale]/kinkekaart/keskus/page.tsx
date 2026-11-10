import type { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import GiftCardStaffLogin from '@/components/GiftCardStaffLogin'
import {
  GIFT_CARD_STAFF_COOKIE,
  isGiftCardStaffConfigured,
  verifyStaffCookieValue,
} from '@/lib/gift-card-staff-auth'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'GiftCardStaff' })
  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  }
}

export default async function GiftCardStaffPage({ params }: Props) {
  noStore()
  const { locale } = await params
  setRequestLocale(locale)
  const enabled = isGiftCardStaffConfigured()
  const loggedIn = enabled && verifyStaffCookieValue(cookies().get(GIFT_CARD_STAFF_COOKIE)?.value)
  return <GiftCardStaffLogin enabled={enabled} loggedIn={loggedIn} />
}
