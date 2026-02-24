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
  if (property.type === 'multi_select') return property.multi_select?.[0]?.name || null
  if (property.type === 'formula') return property.formula?.string ?? property.formula?.number?.toString() ?? null
  if (property.type === 'rollup' && property.rollup?.type === 'array' && property.rollup?.array?.[0]) {
    const first = property.rollup.array[0]
    return first?.title?.[0]?.plain_text ?? first?.rich_text?.[0]?.plain_text ?? null
  }
  return null
}

/** Otsib tekstist kehtiva kellaaja (HH:mm, 0–23:00–59). Vältib kuupäeva 25.02. */
function extractTimeFromText(txt: string | null): string | null {
  if (!txt || typeof txt !== 'string') return null
  const match = txt.match(/(\d{1,2})[.:](\d{2})\b/g)
  if (!match) return null
  for (const m of match) {
    const parts = m.split(/[.:]/)
    const h = parseInt(parts[0], 10)
    const min = parseInt(parts[1], 10)
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  }
  return null
}

/** Normaliseerib kellaaja HH:mm (nt "16" → "16:00"). */
function normalizeTime(raw: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?/)
  if (!m) return extractTimeFromText(raw)
  const h = parseInt(m[1], 10)
  const min = m[2] ? parseInt(m[2], 10) : 0
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function extractDate(property: any): string | null {
  if (!property?.date?.start) return null
  return property.date.start
}

function extractNumber(property: any): number | null {
  if (!property) return null
  if (typeof property.number === 'number') return property.number
  if (property.formula?.number != null) return property.formula.number
  if (property.rollup?.number != null) return property.rollup.number
  const str = property.formula?.string ?? extractText(property)
  if (str && typeof str === 'string') {
    const num = parseFloat(str.replace(/[^\d.,]/g, '').replace(',', '.'))
    return isNaN(num) ? null : num
  }
  return null
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
  return NextResponse.json({
    ok: true,
    message: 'Webhook endpoint active. Use POST with Notion payload.',
  })
}

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const { visitorId, sig } = extractFromPayload(body)
    const debug = process.env.NODE_ENV === 'development' || !!process.env.DEBUG_WEBHOOK

    if (!visitorId) {
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

    const alreadySent =
      (confirmationSentAtPropName && extractDate(props[confirmationSentAtPropName])) ||
      (confirmationStatusPropName && extractText(props[confirmationStatusPropName])?.toLowerCase() === 'sent')

    if (alreadySent) {
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

    const arvPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (n === 'arv' || n.includes('arv')) && (props[k]?.type === 'number' || props[k]?.type === 'formula')
    })
    const groupSize = arvPropName ? extractNumber(props[arvPropName]) : null

    const summaPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (n === 'summa' || n.includes('summa')) && (props[k]?.type === 'number' || props[k]?.type === 'formula' || props[k]?.type === 'rollup')
    })
    const price = summaPropName ? extractNumber(props[summaPropName]) : null

    const relationPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return props[k]?.type === 'relation' && n.includes('kulastus')
    })
    const visitId = relationPropName && props[relationPropName]?.relation?.[0]?.id

    let dateStr = ''
    let timeSlot: string | undefined
    let dateForSubject = ''
    let debugVisit: Record<string, unknown> | undefined

    // Kuupäev ja kellaaeg tulevad seotud Külastused-lehelt (relation)
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
            normalizeKey(k).includes('kellaaeg') ||
            normalizeKey(k).includes('time')
        )

        const dateValue = datePropName ? visitProps[datePropName]?.date?.start : null
        if (process.env.DEBUG_WEBHOOK) {
          console.log('[visitor-confirm-webhook] visit raw:', {
            datePropName,
            dateValue,
            hasT: dateValue?.includes?.('T'),
            timePropName,
            timePropValue: timePropName ? extractText(visitProps[timePropName]) : null,
            visitPropKeys: Object.keys(visitProps),
          })
        }
        if (dateValue) {
          dateStr = new Date(dateValue).toLocaleDateString('et-EE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          // Kellaaeg: 1) Kuupäev datetime-st, 2) Kellaaeg-tulp, 3) pealkirjast, 4) kõik Külastuse tulbad
          const timeFromDate =
            dateValue.includes('T') ? formatInTimeZone(dateValue, 'Europe/Tallinn', 'HH:mm') : null
          const timeFromProp = timePropName ? normalizeTime(extractText(visitProps[timePropName])) : null
          const titleProp = Object.keys(visitProps).find((k) => visitProps[k]?.type === 'title')
          const timeFromTitle = titleProp ? extractTimeFromText(extractText(visitProps[titleProp])) : null
          let timeFromAny: string | null = null
          if (!timeFromDate && !timeFromProp && !timeFromTitle) {
            for (const [, prop] of Object.entries(visitProps) as [string, any][]) {
              const txt = extractText(prop) ?? (prop as { formula?: { string?: string } })?.formula?.string ?? null
              timeFromAny = extractTimeFromText(txt)
              if (timeFromAny) break
            }
          }
          timeSlot = timeFromDate || timeFromProp || timeFromTitle || timeFromAny || undefined
          const dStr = formatInTimeZone(dateValue, 'Europe/Tallinn', 'dd.MM')
          dateForSubject = timeSlot ? `${dStr} kell ${timeSlot}` : dStr
          if (process.env.DEBUG_WEBHOOK) {
            const sample: Record<string, string | null> = {}
            for (const [k, v] of Object.entries(visitProps) as [string, any][]) {
              sample[k] = extractText(v) ?? v?.formula?.string ?? (v?.date?.start ?? null)
            }
            debugVisit = {
              props: Object.keys(visitProps),
              sample,
              timeFromDate,
              timeFromProp,
              timeFromTitle,
              timeFromAny,
              dateValue: dateValue?.slice?.(0, 30),
            }
            console.log('[visitor-confirm-webhook] DEBUG visit:', JSON.stringify(debugVisit, null, 2))
          }
        }
      }
    }

    if (!dateStr) {
      const fallback = new Date()
      dateStr = fallback.toLocaleDateString('et-EE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!dateForSubject) {
        const dStr = formatInTimeZone(fallback, 'Europe/Tallinn', 'dd.MM')
        dateForSubject = timeSlot ? `${dStr} kell ${timeSlot}` : dStr
      }
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
          groupSize: groupSize ?? undefined,
          price: price ?? undefined,
          dateForSubject: dateForSubject || undefined,
          cc: ADMIN_EMAIL,
        })
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
          groupSize: groupSize ?? undefined,
          price: price ?? undefined,
          dateForSubject: dateForSubject || undefined,
          adminOnly: true,
        })
      } catch {
        /* ignore */
      }
    }

    const filteredPatch = Object.fromEntries(
      Object.entries(patchProps).filter(([k, v]) => k && v != null)
    )
    const resBody: Record<string, unknown> = { ok: true }
    if (process.env.DEBUG_WEBHOOK) {
      resBody._debug = { timeSlot, dateForSubject, visit: debugVisit }
      console.log('[visitor-confirm-webhook] DEBUG result:', { timeSlot, dateForSubject })
    }
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

    return NextResponse.json(resBody, { status: 200 })
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
