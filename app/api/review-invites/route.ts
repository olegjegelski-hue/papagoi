import { NextResponse } from 'next/server'
import { runReviewInvitesFromEnv } from '../../../scripts/send-review-invites'

export const dynamic = 'force-dynamic'

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
      // Testrežiim: saadab ühe näidis-arvustuskirja keskuse mailile (Notionit ei kasutata).
      const { sendReviewEmail } = await import('../../../scripts/send-review-invites')
      const to =
        process.env.CENTER_EMAIL || process.env.SMTP_USER || 'keskus@papagoi.ee'
      await sendReviewEmail(to, 'Test', new Date().toISOString().slice(0, 10))
      return NextResponse.json({
        ok: true,
        test: true,
        sentTo: to,
        message: 'Näidiskiri saadetud keskuse mailile.',
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

