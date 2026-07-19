import { NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/cron-auth'
import { runVisitSmsRemindersFromEnv } from '../../../scripts/send-visit-sms-reminders'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const unauthorized = requireCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    const url = new URL(request.url)
    // Optional dry-run flag via query (?dry=1) — only for authenticated callers
    const dry = url.searchParams.get('dry')
    if (dry === '1') {
      process.env.VISIT_SMS_DRY_RUN = '1'
    } else if (dry === '0') {
      process.env.VISIT_SMS_DRY_RUN = '0'
    } else if (process.env.VISIT_SMS_DRY_RUN) {
      delete process.env.VISIT_SMS_DRY_RUN
    }

    await runVisitSmsRemindersFromEnv()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('visit-sms-reminders API error:', error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
