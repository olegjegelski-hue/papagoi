import { NextRequest, NextResponse } from 'next/server'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { sendConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

function extractText(property: any): string | null {
  if (!property) return null
  if (property.type === 'rich_text') return property.rich_text?.[0]?.plain_text || null
  if (property.type === 'title') return property.title?.[0]?.plain_text || null
  if (property.type === 'email') return property.email || null
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

export async function GET(request: NextRequest) {
  const SUCCESS_HTML = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Kinnituskiri saadetud</title></head>
<body style="font-family: Arial, sans-serif; max-width: 500px; margin: 80px auto; padding: 20px; text-align: center;">
  <h1 style="color: #059669;">✅ Kinnituskiri saadetud</h1>
  <p>Kliendile on saadetud broneeringu kinnituskiri.</p>
  <p><a href="https://www.papagoi.ee">Tagasi kodulehele</a></p>
</body>
</html>`

  const ERROR_HTML = (msg: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Viga</title></head>
<body style="font-family: Arial, sans-serif; max-width: 500px; margin: 80px auto; padding: 20px; text-align: center;">
  <h1 style="color: #dc2626;">Viga</h1>
  <p>${msg}</p>
  <p><a href="https://www.papagoi.ee">Tagasi kodulehele</a></p>
</body>
</html>`

  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get('visitorId')
    const sig = searchParams.get('sig')

    if (!visitorId || !sig) {
      return new NextResponse(ERROR_HTML('Puuduvad parameetrid (visitorId, sig).'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_VISITORS_DATABASE_ID =
      process.env.NOTION_VISITORS_DATABASE_ID || '21744b6080df4f26b265aec71051bed7'

    if (!NOTION_API_KEY || !NOTION_VISITORS_DATABASE_ID) {
      return new NextResponse(ERROR_HTML('Serveri seadistus puudub.'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
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
      console.error('Notion visitor fetch viga:', pageRes.status, errText)
      return new NextResponse(ERROR_HTML('Külastaja kirjet ei leitud.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const visitorPage = await pageRes.json()
    const props = visitorPage.properties || {}

    const signaturePropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (n === 'signature' || n.includes('signature')) && props[k]?.type === 'rich_text'
    })
    const storedSig = signaturePropName ? extractText(props[signaturePropName]) : null

    if (!storedSig || storedSig !== sig) {
      return new NextResponse(ERROR_HTML('Kehtetu või aegunud link.'), {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const confirmedPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return props[k]?.type === 'checkbox' && (n === 'kinnitatud' || n.includes('kinnitatud'))
    })
    if (!confirmedPropName) {
      return new NextResponse(ERROR_HTML('Kinnitatud väli puudub.'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    if (props[confirmedPropName]?.checkbox === true) {
      return new NextResponse(SUCCESS_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const emailPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return (n === 'email' || n === 'epost' || n.includes('email') || n.includes('epost')) && (props[k]?.type === 'email' || props[k]?.type === 'rich_text')
    })
    const email = emailPropName
      ? (props[emailPropName]?.type === 'email' ? props[emailPropName]?.email : extractText(props[emailPropName]))
      : null

    if (!email) {
      return new NextResponse(ERROR_HTML('Külastajal puudub e-posti aadress.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const namePropName = Object.keys(props).find((k) => props[k]?.type === 'title') ||
      Object.keys(props).find((k) => normalizeKey(k).includes('nimi'))
    const name = namePropName ? extractText(props[namePropName]) : null

    const relationPropName = Object.keys(props).find((k) => {
      const n = normalizeKey(k)
      return props[k]?.type === 'relation' && n.includes('kulastus')
    })
    const visitId = relationPropName && props[relationPropName]?.relation?.[0]?.id

    let dateStr = ''
    let timeSlot: string | undefined
    let calendarStartIso: string | undefined
    let calendarEndIso: string | undefined

    if (visitId) {
      const visitPageRes = await fetchNotion(`https://api.notion.com/v1/pages/${visitId.replace(/-/g, '')}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      })
      if (visitPageRes.ok) {
        const visitPage = await visitPageRes.json()
        const visitProps = visitPage.properties || {}
        const datePropName = Object.keys(visitProps).find((k) =>
          visitProps[k]?.type === 'date' && (normalizeKey(k).includes('kuupaev') || normalizeKey(k) === 'kuupaev')
        ) || Object.keys(visitProps).find((k) => visitProps[k]?.type === 'date')
        const timePropName = Object.keys(visitProps).find((k) =>
          normalizeKey(k) === 'kellaaeg' || normalizeKey(k) === 'aeg' || normalizeKey(k).includes('kellaaeg')
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
          const datePart = dateValue.split('T')[0].split(' ')[0]
          const startDt =
            dateValue.includes('T') || (dateValue.includes(' ') && /\d{1,2}[.:]\d{2}/.test(dateValue))
              ? new Date(dateValue)
              : timeSlot
                ? fromZonedTime(`${datePart} ${timeSlot}:00`, 'Europe/Tallinn')
                : fromZonedTime(`${datePart} 12:00:00`, 'Europe/Tallinn')
          const endDt = new Date(startDt.getTime() + 60 * 60 * 1000)
          calendarStartIso = startDt.toISOString()
          calendarEndIso = endDt.toISOString()
        }
      }
    }

    if (!dateStr) {
      dateStr = new Date().toLocaleDateString('et-EE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }

    const patchRes = await fetchNotion(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { [confirmedPropName]: { checkbox: true } },
      }),
    })

    if (!patchRes.ok) {
      const errText = await patchRes.text()
      console.error('Notion Kinnitatud update viga:', patchRes.status, errText)
      return new NextResponse(ERROR_HTML('Kinnitamine ebaõnnestus.'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    await sendConfirmationEmail({
      name: name || 'Külastaja',
      email,
      date: dateStr,
      timeSlot,
      calendarStartIso,
      calendarEndIso,
      cc: 'keskus@papagoi.ee',
    })

    return new NextResponse(SUCCESS_HTML, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error: any) {
    console.error('confirm-visitor error:', error)
    return new NextResponse(
      ERROR_HTML('Tekkis ootamatu viga. Palun proovige hiljem uuesti.'),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
