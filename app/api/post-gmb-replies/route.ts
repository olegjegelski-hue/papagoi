import { NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/cron-auth'
import { postRepliesToGoogle } from '@/scripts/post-google-review-replies'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const unauthorized = requireCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    await postRepliesToGoogle()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('GMB replies posting failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
