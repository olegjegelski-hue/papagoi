import { NextResponse } from 'next/server'
import { runReviewInvitesFromEnv } from '../../../scripts/send-review-invites'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const expected = process.env.REVIEW_CRON_SECRET

  if (expected && token !== expected) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Optional dry-run flag via query (?dry=1)
    if (url.searchParams.get('dry') === '1') {
      process.env.REVIEW_DRY_RUN = '1'
    }

    await runReviewInvitesFromEnv()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('review-invites API error:', error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}

