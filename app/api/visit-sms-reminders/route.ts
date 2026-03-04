import { NextResponse } from 'next/server'
import { runVisitSmsRemindersFromEnv } from '../../../scripts/send-visit-sms-reminders'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  const smsSecret = process.env.VISIT_SMS_CRON_SECRET || cronSecret

  if (cronSecret || smsSecret) {
    const headerOk = cronSecret ? authHeader === `Bearer ${cronSecret}` : false
    const tokenOk = token === smsSecret
    if (!headerOk && !tokenOk) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  try {
    // Optional dry-run flag via query (?dry=1)
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

