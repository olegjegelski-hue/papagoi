import { NextRequest, NextResponse } from 'next/server'
import { formatInTimeZone } from 'date-fns-tz'
import { sendConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'keskus@papagoi.ee'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

function extractText(property: any): string | null {
  if (!property) return null
  if (property.type === 'rich_text') return property.rich_text?.[0]?.plain_text || null
  if (property.type === 'title') return property.title?.[0]?.plain_text || null
  if (property.type === 'email') return property.email || null
  if (property.type === 'select') return property.select?.name || null
  if (property.type === 'status') return property.status?.name || null
  return null
}

function extractDate(property: any): string | null {
  if (!property?.date?.start) return null
  return property.date.start
}

async function fetchNotion(url: string, options: RequestInit) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

function extractFromPayload(body: any): { visitorId: string | null; sig: string | null } {
  let visitorId: string | null = null
  let sig: string | null = null

  const get = (obj: any, ...paths: string[]) => {
    for (const path of paths) {
      const parts = path.split('.')
      let v: any = obj
      for (const p of parts) {
        v = v?.[p]
      }
      if (v != null && typeof v === 'string') return v
    }
    return null
  }

  const PAGE_ID_REGEX = /^[a-f0-9]{32}$/i
  const extractPageId = (v: string | null) => (v && PAGE_ID_REGEX.test(v.replace(/-/g, '')) ? v.replace(/-/g, '') : null)

  visitorId =
    extractPageId(get(body, 'data.id', 'data.page_id', 'entity.id', 'page_id')) ||
    extractPageId(body?.data?.properties?.VisitorId?.formula?.string) ||
    extractPageId(body?.data?.properties?.Viiteband?.formula?.string) ||
    extractPageId(body?.data?.properties?.Viiteband?.rich_text?.[0]?.plain_text) ||
    extractPageId(body?.data?.properties?.VisitorId?.rich_text?.[0]?.plain_text) ||
    extractPageId(get(body, 'data.properties.VisitorId.formula.string', 'data.properties.Viiteband.formula.string')) ||
    extractPageId(get(body, 'VisitorId', 'visitorId', 'Visitorid', 'Viiteband', 'id', 'record.id')) ||
    extractPageId(body?.record?.properties?.VisitorId?.rich_text?.[0]?.plain_text) ||
    extractPageId(body?.record?.properties?.VisitorId?.title?.[0]?.plain_text) ||
    null

  if (!visitorId && body?.data?.properties) {
    for (const [, prop] of Object.entries(body.data.properties) as [string, any][]) {
      const val = prop?.formula?.string ?? prop?.rich_text?.[0]?.plain_text ?? prop?.title?.[0]?.plain_text
      visitorId = extractPageId(val)
      if (visitorId) break
    }
  }

  sig =
    body?.data?.properties?.Signature?.rich_text?.[0]?.plain_text ||
    get(body, 'Signature', 'sig', 'record.Signature') ||
    body?.record?.properties?.Signature?.rich_text?.[0]?.plain_text ||
    body?.record?.properties?.Signature?.title?.[0]?.plain_text ||
    body?.record?.properties?.signature?.rich_text?.[0]?.plain_text ||
    null

  if (!sig && body?.data?.properties) {
    for (const [key, prop] of Object.entries(body.data.properties) as [string, any][]) {
      if (/signature/i.test(key)) {
        sig = prop?.rich_text?.[0]?.plain_text ?? prop?.title?.[0]?.plain_text ?? null
        if (sig) break
      }
    }
  }

  return { visitorId, sig }
}

export async function GET() {
  console.log('[visitor-confirm-webhook] GET ping at', new Date().toISOString())
  return NextResponse.json({
    ok: true,
    message: 'Webhook endpoint active. Use POST with Notion payload.',
  })
}

export async function POST(request: NextRequest) {
  console.log('[visitor-confirm-webhook] Request received at', new Date().toISOString())
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_WEBHOOK) {
      console.log('[visitor-confirm-webhook] Raw payload:', JSON.stringify(body, null, 2))
    }

    const { visitorId, sig } = extractFromPayload(body)
    const debug = process.env.NODE_ENV === 'development' || !!process.env.DEBUG_WEBHOOK

    if (!visitorId) {
      console.log('[visitor-confirm-webhook] Rejected: Missing visitorId')
      const err: Record<string, unknown> = { ok: false, error: 'Missing visitorId' }
      if (debug) err.debug = { receivedKeys: Object.keys(body), extracted: { visitorId, sig } }
      return NextResponse.json(err, { status: 400 })
    }

    const webhookSecret = process.env.NOTION_WEBHOOK_SECRET
    const hasValidSig = sig && sig.length >= 32
    const hasValidSecret =
      webhookSecret &&
      (request.headers.get('X-Webhook-Secret') === webhookSecret ||
        request.headers.get('x-notion-signature') === webhookSecret)

    if (!hasValidSig && !hasValidSecret) {
      console.log('[visitor-confirm-webhook] Rejected: Missing or invalid signature')
      const err: Record<string, unknown> = {
        ok: false,
        error: 'Missing or invalid sig. Provide Signature in payload or X-Webhook-Secret header.',
      }
      if (debug) err.debug = { extracted: { visitorId, sig: sig ? '[present]' : null } }
      return NextResponse.json(err, { status: 403 })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_VISITORS_DATABASE_ID =
      process.env.NOTION_VISITORS_DATABASE_ID || '21744b6080df4f26b265aec71051bed7'

    if (!NOTION_API_KEY || !NOTION_VISITORS_DATABASE_ID) {
      return NextResponse.json({ ok: false, error: 'Server configuration missing' }, { status: 500 })
    }

    const pageId = visitorId.replace(/-/g, '')
    const pageRes = await fetchNotion(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    })

    if (!pageRes.ok) {
      const errText = await pageRes.text()
      console.error('[visitor-confirm-webhook] Notion fetch error:', pageRes.status, errText)
      return NextResponse.json({ ok: false, error: 'Visitor not found' }, { status: 404 })
    }

    const visitorPage = await pageRes.json()
    const props = visitorPage.properties || {}

    const signaturePropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (n === 'signature' || n.includes('signature')) && props[k]?.type === 'rich_text'
    })
    const storedSig = signaturePropName ? extractText(props[signaturePropName]) : null

    if (hasValidSig && (!storedSig || storedSig !== sig)) {
      return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 403 })
    }
    if (!hasValidSecret && !storedSig) {
      return NextResponse.json(
        { ok: false, error: 'Visitor has no Signature. Cannot confirm.' },
        { status: 409 }
      )
    }

    const confirmedPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (
        props[k]?.type === 'checkbox' &&
        (n === 'kinnitatud' || n.includes('kinnitatud') || n === 'kinnitus' || n.includes('kinnitus'))
      )
    })
    if (!confirmedPropName) {
      const propList = Object.entries(props)
        .filter(([, v]) => (v as { type?: string })?.type === 'checkbox')
        .map(([k]) => k)
      const err: Record<string, unknown> = {
        ok: false,
        error: 'Kinnitatud field missing',
        ...(process.env.DEBUG_WEBHOOK && { debug: { checkboxProps: propList } }),
      }
      return NextResponse.json(err, { status: 500 })
    }

    const confirmationSentAtPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (
        (n === 'confirmationsentat' ||
          n.includes('confirmationsentat') ||
          n === 'confirmationsent' ||
          n.includes('confirmationsent') ||
          n.includes('confirmation_sent')) &&
        props[k]?.type === 'date'
      )
    })
    const confirmationStatusPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (
        (n === 'confirmationstatus' || n.includes('confirmationstatus') || n.includes('confirmation_status')) &&
        (props[k]?.type === 'select' || props[k]?.type === 'status')
      )
    })
    const confirmationStatusType =
      confirmationStatusPropName && props[confirmationStatusPropName]?.type
    const confirmationErrorPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (
        (n === 'confirmationerror' || n.includes('confirmationerror') || n.includes('confirmation_error')) &&
        (props[k]?.type === 'rich_text' || props[k]?.type === 'title')
      )
    })

    console.log('[visitor-confirm-webhook] Props found:', {
      confirmationSentAtPropName: confirmationSentAtPropName ?? '(not found)',
      confirmationStatusPropName: confirmationStatusPropName ?? '(not found)',
      confirmationErrorPropName: confirmationErrorPropName ?? '(not found)',
      allProps: Object.keys(props),
    })

    const alreadySent =
      (confirmationSentAtPropName && extractDate(props[confirmationSentAtPropName])) ||
      (confirmationStatusPropName && extractText(props[confirmationStatusPropName])?.toLowerCase() === 'sent')

    if (alreadySent) {
      console.log('[visitor-confirm-webhook] Already confirmed, skipping (idempotent)')
      return NextResponse.json({ ok: true, message: 'Already confirmed (idempotent)' }, { status: 200 })
    }

    const emailPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (
        (n === 'email' || n === 'epost' || n.includes('email') || n.includes('epost')) &&
        (props[k]?.type === 'email' || props[k]?.type === 'rich_text')
      )
    })
    const email = emailPropName
      ? props[emailPropName]?.type === 'email'
        ? props[emailPropName]?.email
        : extractText(props[emailPropName])
      : null

    const namePropName =
      Object.keys(props).find((k) => props[k]?.type === 'title') ||
      Object.keys(props).find((k) => normalizeKey(k).includes('nimi'))
    const name = namePropName ? extractText(props[namePropName]) : null

    const relationPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return props[k]?.type === 'relation' && n.includes('kulastus')
    })
    const visitId = relationPropName && props[relationPropName]?.relation?.[0]?.id

    let dateStr = ''
    let timeSlot: string | undefined

    if (visitId) {
      const visitPageRes = await fetchNotion(
        `https://api.notion.com/v1/pages/${visitId.replace(/-/g, '')}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
          },
        }
      )
      if (visitPageRes.ok) {
        const visitPage = await visitPageRes.json()
        const visitProps = visitPage.properties || {}
        const datePropName =
          Object.keys(visitProps).find(
            (k) =>
              visitProps[k]?.type === 'date' &&
              (normalizeKey(k).includes('kuupaev') || normalizeKey(k) === 'kuupaev')
          ) || Object.keys(visitProps).find((k) => visitProps[k]?.type === 'date')
        const timePropName = Object.keys(visitProps).find(
          (k) =>
            normalizeKey(k) === 'kellaaeg' ||
            normalizeKey(k) === 'aeg' ||
            normalizeKey(k).includes('kellaaeg')
        )

        const dateValue = datePropName ? visitProps[datePropName]?.date?.start : null
        if (dateValue) {
          dateStr = new Date(dateValue).toLocaleDateString('et-EE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          const rawTime = timePropName ? extractText(visitProps[timePropName]) : null
          const derivedTime = dateValue.includes('T')
            ? formatInTimeZone(dateValue, 'Europe/Tallinn', 'HH:mm')
            : null
          timeSlot = rawTime || derivedTime || undefined
        }
      }
    }

    if (!dateStr) {
      dateStr = new Date().toLocaleDateString('et-EE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const nowIso = new Date().toISOString()
    const patchProps: Record<string, any> = {
      [confirmedPropName]: { checkbox: true },
    }
    if (confirmationSentAtPropName) {
      patchProps[confirmationSentAtPropName] = { date: { start: nowIso } }
    }
    if (confirmationStatusPropName) {
      const statusVal = { name: 'Sent' }
      patchProps[confirmationStatusPropName] =
        confirmationStatusType === 'status'
          ? { status: statusVal }
          : { select: statusVal }
    }
    if (confirmationErrorPropName) {
      patchProps[confirmationErrorPropName] = { rich_text: [] }
    }

    if (email) {
      try {
        await sendConfirmationEmail({
          name: name || 'Külastaja',
          email,
          date: dateStr,
          timeSlot,
          cc: ADMIN_EMAIL,
        })
        console.log('[visitor-confirm-webhook] Email sent to', email)
      } catch (err: any) {
        console.error('[visitor-confirm-webhook] Email send failed:', err)
        if (confirmationStatusPropName) {
          patchProps[confirmationStatusPropName] =
            confirmationStatusType === 'status'
              ? { status: { name: 'Failed' } }
              : { select: { name: 'Failed' } }
        }
        if (confirmationErrorPropName) {
          patchProps[confirmationErrorPropName] = {
            rich_text: [{ type: 'text', text: { content: (err?.message || 'Email send failed').slice(0, 2000) } }],
          }
        }
        const failPatch = Object.fromEntries(
          Object.entries(patchProps).filter(([k, v]) => k && v != null)
        )
        await fetchNotion(`https://api.notion.com/v1/pages/${pageId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties: failPatch }),
        })
        return NextResponse.json(
          { ok: false, error: 'Email send failed' },
          { status: 500 }
        )
      }
    } else {
      if (confirmationStatusPropName) {
        patchProps[confirmationStatusPropName] =
          confirmationStatusType === 'status'
            ? { status: { name: 'Failed' } }
            : { select: { name: 'Failed' } }
      }
      if (confirmationErrorPropName) {
        patchProps[confirmationErrorPropName] = {
          rich_text: [{ type: 'text', text: { content: 'Külastajal puudub e-posti aadress. Saadetud ainult adminile.' } }],
        }
      }
      try {
        await sendConfirmationEmail({
          name: name || 'Külastaja',
          email: ADMIN_EMAIL,
          date: dateStr,
          timeSlot,
          adminOnly: true,
        })
      } catch {
        /* ignore */
      }
    }

    const filteredPatch = Object.fromEntries(
      Object.entries(patchProps).filter(([k, v]) => k && v != null)
    )
    console.log('[visitor-confirm-webhook] Patching Notion:', {
      pageId,
      patchKeys: Object.keys(filteredPatch),
      hasConfirmationFields:
        !!confirmationSentAtPropName ||
        !!confirmationStatusPropName ||
        !!confirmationErrorPropName,
    })
    const patchRes = await fetchNotion(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: filteredPatch }),
    })

    if (!patchRes.ok) {
      const errText = await patchRes.text()
      console.error('[visitor-confirm-webhook] Notion patch error:', patchRes.status, errText)
      return NextResponse.json({ ok: false, error: 'Notion update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error: any) {
    const msg = error?.message || 'Internal server error'
    console.error('[visitor-confirm-webhook] Error:', error)
    const body: Record<string, unknown> = { ok: false, error: msg }
    if (process.env.DEBUG_WEBHOOK) {
      body.stack = error?.stack
    }
    return NextResponse.json(body, { status: 500 })
  }
}
