import { NextResponse } from 'next/server'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/** Ajutine diagnostika: Notioni toored väljad kinkekaardi koodi kohta. */
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const limited = rateLimit(ip, { windowMs: 60_000, max: 30, minIntervalMs: 200 })
    if (!limited.allowed) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }

    const code = new URL(request.url).searchParams.get('code')?.trim() || ''
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
    }

    const notionApiKey = process.env.NOTION_API_KEY
    const databaseId = process.env.NOTION_GIFT_CARDS_DATABASE_ID
    if (!notionApiKey || !databaseId) {
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 })
    }

    const dbId = databaseId.replace(/-/g, '')
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'Kinkekaardi kood', title: { equals: code } },
        page_size: 1,
      }),
      cache: 'no-store',
    })

    const rawText = await res.text()
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, status: res.status, body: rawText.slice(0, 500) },
        { status: 502 }
      )
    }

    const data = JSON.parse(rawText)
    const page = data?.results?.[0]
    if (!page) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    const props = page.properties || {}
    const keys = Object.keys(props)

    // Impordi sama mapper, mida trükk kasutab
    const { getGiftCardDetailsByCode } = await import('@/lib/notion-gift-card-lookup')
    const details = await getGiftCardDetailsByCode(notionApiKey, databaseId, code)

    return NextResponse.json({
      ok: true,
      details,
      propKeys: keys,
      aegub: props['Aegub'] ?? null,
      ostu: props['Ostu kuupäev'] ?? null,
      vaartus: props['Väärtus'] ?? null,
      keyCodes: {
        Aegub: [...'Aegub'].map((c) => c.charCodeAt(0)),
        ostuKeyInResponse: keys
          .filter((k) => k.toLowerCase().includes('ostu'))
          .map((k) => ({ k, codes: [...k].map((c) => c.charCodeAt(0)) })),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
