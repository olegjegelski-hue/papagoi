import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PIXEL_ID = process.env.META_PIXEL_ID!
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN!
const TEST_CODE = process.env.META_TEST_EVENT_CODE
const API_VERSION = 'v21.0'

const sha256 = (v?: string) =>
  v ? crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : undefined

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()

    // GDPR: only forward events when the client asserts marketing consent
    if (b.marketingConsent !== true) {
      return NextResponse.json({ skipped: true, reason: 'no_marketing_consent' })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const ua = req.headers.get('user-agent') ?? undefined

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: b.eventName ?? 'Schedule',
          event_time: Math.floor(Date.now() / 1000),
          event_id: b.eventId,
          event_source_url: b.eventSourceUrl,
          action_source: 'website',
          user_data: {
            em: b.email ? [sha256(b.email)] : undefined,
            ph: b.phone ? [sha256(b.phone.replace(/\D/g, ''))] : undefined,
            client_ip_address: ip,
            client_user_agent: ua,
            fbp: b.fbp,
            fbc: b.fbc,
          },
          custom_data: b.value ? { value: b.value, currency: b.currency ?? 'EUR' } : undefined,
        },
      ],
    }
    if (TEST_CODE) payload.test_event_code = TEST_CODE

    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    )
    const json = await res.json()
    return NextResponse.json(json, { status: res.ok ? 200 : 400 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
