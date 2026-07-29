import { NextResponse } from 'next/server'
import { getGiftCardDetailsByCode } from '@/lib/notion-gift-card-lookup'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * Kerge diagnostika: kas Notionist tuleb kehtivuskuupäev.
 * Ei tagasta ostja PII-d.
 */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const limited = rateLimit(ip, { windowMs: 60_000, max: 30, minIntervalMs: 200 })
    if (!limited.allowed) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').trim()
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const details = await getGiftCardDetailsByCode(
      NOTION_API_KEY,
      NOTION_GIFT_CARDS_DATABASE_ID,
      code
    )

    if (!details) {
      return NextResponse.json({ ok: false, error: 'Gift card not found' }, { status: 404 })
    }

    // Toores diagnostika (ilma ostja PII-ta): miks validUntil võib productionis tühi olla
    let debug: Record<string, unknown> | undefined
    if (searchParams.get('debug') === '1') {
      try {
        const dbId = NOTION_GIFT_CARDS_DATABASE_ID.replace(/-/g, '')
        const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: { property: 'Kinkekaardi kood', title: { equals: code } },
            page_size: 1,
          }),
          cache: 'no-store',
        })
        const data = await res.json()
        const page = data?.results?.[0]
        const props = page?.properties || {}
        debug = {
          notionStatus: res.status,
          pageId: page?.id ?? null,
          dbSuffix: dbId.slice(-8),
          keySuffix: NOTION_API_KEY.slice(-4),
          propKeys: Object.keys(props),
          aegub: props['Aegub']?.formula ?? props['Aegub'] ?? null,
          ostu: props['Ostu kuupäev']?.date ?? null,
          kasutatud: props['Kasutatud kuupäev']?.date ?? null,
          mappedValidUntil: details.validUntil || null,
          mappedUsedAt: details.usedAt || null,
        }
      } catch (e) {
        debug = { error: e instanceof Error ? e.message : 'debug failed' }
      }
    }

    return NextResponse.json({
      ok: true,
      code: details.code,
      amountEur: details.amountEur,
      validUntil: details.validUntil || null,
      hasValidUntil: Boolean(details.validUntil),
      used: Boolean(details.usedAt),
      ...(debug ? { debug } : {}),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[gift-card-meta] error:', error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
