import { NextResponse } from 'next/server'
import { syncGoogleReviewsToNotion } from '@/scripts/sync-google-reviews-to-notion'

// Vältime agressiivset vahemälu – seda kutsub Verceli cron
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await syncGoogleReviewsToNotion()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('GMB reviews sync failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

