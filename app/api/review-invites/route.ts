import { NextResponse } from 'next/server'
import { runReviewInvitesFromEnv } from '../../../scripts/send-review-invites'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const expected = process.env.REVIEW_CRON_SECRET || process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')

  if (expected) {
    const headerOk = authHeader === `Bearer ${expected}`
    const tokenOk = token === expected
    if (!headerOk && !tokenOk) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  try {
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

