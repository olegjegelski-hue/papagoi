import { NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/cron-auth'
import {
  errorLooksLikeGmbUnauthorized,
  logGmbTokenInvalid,
} from '@/lib/google-api-fetch'
import { syncGoogleReviewsToNotion } from '@/scripts/sync-google-reviews-to-notion'

// Vältime agressiivset vahemälu – seda kutsub Verceli cron
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 300

export async function GET(request: Request) {
  const unauthorized = requireCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    await syncGoogleReviewsToNotion()
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (errorLooksLikeGmbUnauthorized(error)) {
      logGmbTokenInvalid()
    }
    console.error('GMB reviews sync failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
