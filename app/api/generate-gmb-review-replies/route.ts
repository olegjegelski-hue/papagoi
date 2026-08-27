import { NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/cron-auth'
import { generateGmbReviewReplies } from '@/scripts/generate-google-review-replies'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const unauthorized = requireCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    const url = new URL(request.url)
    const dryRun = url.searchParams.get('dryRun') === '1' || url.searchParams.get('dry') === '1'
    const force = url.searchParams.get('force') === '1'
    const summary = await generateGmbReviewReplies({ dryRun, force })
    return NextResponse.json({ ok: true, ...summary })
  } catch (error) {
    console.error('GMB review reply generate failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
