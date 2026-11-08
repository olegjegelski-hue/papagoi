import { NextResponse } from 'next/server'
import { sendReviewInviteEmail } from '@/lib/email'
import { shouldShowReviewDonationLine } from '@/lib/email-i18n'
import { parseVisitMailLocale } from '@/lib/visit-language'
import { runReviewInvitesFromEnv } from '../../../scripts/send-review-invites'

export const dynamic = 'force-dynamic'

const TEST_REVIEW_TO = 'keskus@papagoi.ee'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  const reviewSecret = process.env.REVIEW_CRON_SECRET || cronSecret

  if (cronSecret || reviewSecret) {
    const headerOk = cronSecret ? authHeader === `Bearer ${cronSecret}` : false
    const tokenOk = token === reviewSecret
    if (!headerOk && !tokenOk) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  try {
    const isTest = url.searchParams.get('test') === '1'

    if (isTest) {
      // Testrežiim: saadab ühe näidis-arvustuskirja ainult keskus@papagoi.ee (Notionit ei kasutata).
      const locale = parseVisitMailLocale(
        url.searchParams.get('locale') || url.searchParams.get('lang')
      )
      const groupType =
        url.searchParams.get('groupType') || url.searchParams.get('group') || undefined
      const built = await sendReviewInviteEmail({
        to: TEST_REVIEW_TO,
        name: 'Test',
        visitDateIso: new Date().toISOString().slice(0, 10),
        locale,
        groupType,
      })
      return NextResponse.json({
        ok: true,
        test: true,
        sentTo: TEST_REVIEW_TO,
        locale: built.locale,
        groupType: groupType || null,
        donationLine: shouldShowReviewDonationLine(groupType),
        message: 'Naidiskiri saadetud keskus@papagoi.ee.',
      })
    }

    // Optional dry-run flag via query (?dry=1)
    const dry = url.searchParams.get('dry')
    if (dry === '1') {
      process.env.REVIEW_DRY_RUN = '1'
    } else if (dry === '0') {
      process.env.REVIEW_DRY_RUN = '0'
    } else if (process.env.REVIEW_DRY_RUN) {
      delete process.env.REVIEW_DRY_RUN
    }

    await runReviewInvitesFromEnv()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('review-invites API error:', error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
