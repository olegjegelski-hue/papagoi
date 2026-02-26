import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_TITLE = 'Broneering Papagoi Keskuses'
const DEFAULT_LOCATION = 'Tartu mnt 80, Soinaste, Kambja vald'
const DEFAULT_DESCRIPTION = 'Külastus Papagoi Keskuses. Külastuse kestus: 45–60 min. Palume olla kohal 5–10 min varem.'

/** Genereerib .ics faili broneeringu kalendrisse lisamiseks */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')
  const title = searchParams.get('title') || DEFAULT_TITLE
  const location = searchParams.get('location') || DEFAULT_LOCATION
  const description = searchParams.get('description') || DEFAULT_DESCRIPTION

  if (!startParam || !endParam) {
    return NextResponse.json({ error: 'Missing start or end parameter' }, { status: 400 })
  }

  const startDate = new Date(startParam)
  const endDate = new Date(endParam)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  // ICS format: DTSTART/DTEND in UTC (YYYYMMDDTHHmmSSZ)
  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  const dtStart = formatIcsDate(startDate)
  const dtEnd = formatIcsDate(endDate)

  const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Papagoi Keskus//Broneering//ET',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="broneering-papagoi.ics"',
    },
  })
}
