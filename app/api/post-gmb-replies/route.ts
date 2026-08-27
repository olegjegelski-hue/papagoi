import { NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/cron-auth'
import { postRepliesToGoogle } from '@/scripts/post-google-review-replies'

/**
 * Postitab Google’isse ainult Kinnitatud + Staatus „Valmis postitamiseks“.
 * Värsked (≤7 p) enne; vanad kuni oldLimit. Kogusumma ≤ totalLimit (default 30, max 50).
 * Query: ?totalLimit= &oldLimit= (üle max ei lähe).
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function parsePositiveIntParam(url: URL, names: string[]): number | undefined {
  for (const name of names) {
    const raw = url.searchParams.get(name)
    if (!raw) continue
    const n = Number.parseInt(raw, 10)
    if (Number.isFinite(n) && n > 0) return n
  }
  return undefined
}

export async function GET(request: Request) {
  const unauthorized = requireCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    const url = new URL(request.url)
    const summary = await postRepliesToGoogle({
      totalLimit: parsePositiveIntParam(url, ['totalLimit', 'total']),
      oldLimit: parsePositiveIntParam(url, ['oldLimit', 'old']),
    })
    return NextResponse.json({ ok: true, ...summary })
  } catch (error) {
    console.error('GMB replies posting failed', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
