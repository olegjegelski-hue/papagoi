import { NextResponse } from 'next/server'

/**
 * Vercel Cron saadab automaatselt `Authorization: Bearer ${CRON_SECRET}`
 * kui CRON_SECRET on projekti env-is seatud.
 * @see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export function requireCronAuth(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    console.error('[cron-auth] CRON_SECRET is not configured')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return null
}
