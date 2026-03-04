import 'dotenv/config'
import { formatInTimeZone } from 'date-fns-tz'
import { sendSms } from '../lib/sms'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

function normalizeTimeToHHmm(raw: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?/)
  if (!match) return null
  const hour = parseInt(match[1], 10)
  if (hour < 0 || hour > 23) return null
  const minute = match[2] ? parseInt(match[2], 10) : 0
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function extractTime(property: any) {
  if (!property) return null
  if (property.type === 'select') return property.select?.name || null
  if (property.type === 'rich_text') return property.rich_text?.[0]?.plain_text || null
  if (property.type === 'title') return property.title?.[0]?.plain_text || null
  if (property.type === 'multi_select') {
    const item = property.multi_select?.[0]?.name
    return item || null
  }
  return null
}

function normalizeEstonianPhone(raw: string | null): string | null {
  if (!raw) return null
  // eemalda kõik tühikud ja tavalised eraldajad
  let value = raw.replace(/[\s-]/g, '')
  if (!value) return null

  // 00372xxxxxxxx -> +372xxxxxxxx
  if (value.startsWith('00372')) {
    value = `+372${value.slice(5)}`
  }

  // 372xxxxxxxx -> +372xxxxxxxx
  if (value.startsWith('372')) {
    value = `+${value}`
  }

  // 0xxxxxxxx või xxxxxxxx -> Eesti kohalik number, lisa +372
  if (!value.startsWith('+')) {
    // eemalda algusest üks juhtiv 0, kui on
    value = value.replace(/^0+/, '')
    if (!value) return null
    value = `+372${value}`
  }

  // Pärast normaliseerimist peaks olema kujul +372xxxxxxxx (kokku 12 märki)
  const estonianPattern = /^\+372\d{7,8}$/
  if (!estonianPattern.test(value)) {
    console.warn('Skipping invalid Estonian phone number:', raw, '->', value)
    return null
  }

  // Sendberry lubab + märki, dokumentatsiooni järgi on see valikuline
  return value
}

type NotionPropertyMap = Record<string, any>

interface VisitRecord {
  id: string
  date: string
  time: string | null
}

interface VisitorsDbMeta {
  databaseId: string
  relationPropertyName: string | null
  phonePropertyName: string | null
  namePropertyName: string | null
  smsReminderSentPropertyName: string | null
}

interface VisitorRecord {
  id: string
  phone: string
  name: string | null
  visitDate: string | null
  visitTime: string | null
}

async function resolveVisitsDatabase(notionApiKey: string, visitsDatabaseId: string) {
  const baseId = visitsDatabaseId.replace(/-/g, '')
  const response = await fetchWithTimeout(`https://api.notion.com/v1/databases/${baseId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!response.ok) {
    console.error('Failed to resolve visits database:', response.status)
    return null
  }
  const data = await response.json()
  const properties: NotionPropertyMap = data.properties || {}

  const datePropertyName =
    Object.keys(properties).find(
      (key) =>
        properties[key]?.type === 'date' &&
        (normalizeKey(key) === 'kuupaev' || normalizeKey(key).includes('kuupaev'))
    ) ||
    Object.keys(properties).find((key) => properties[key]?.type === 'date')

  if (!datePropertyName) {
    console.error('Visits database has no date property')
    return null
  }

  const timePropertyName = Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return normalized === 'kellaaeg' || normalized === 'aeg' || normalized.includes('kellaaeg')
  })

  return { databaseId: baseId, datePropertyName, timePropertyName, properties }
}

async function getTomorrowVisitIds(
  notionApiKey: string,
  visitsDatabaseId: string
): Promise<VisitRecord[]> {
  const resolved = await resolveVisitsDatabase(notionApiKey, visitsDatabaseId)
  if (!resolved) return []

  const { databaseId, datePropertyName, timePropertyName, properties } = resolved

  const now = new Date()
  const today = formatInTimeZone(now, 'Europe/Tallinn', 'yyyy-MM-dd')
  const tomorrow = formatInTimeZone(
    new Date(now.getTime() + 24 * 60 * 60 * 1000),
    'Europe/Tallinn',
    'yyyy-MM-dd'
  )
  const twoDaysAgo = formatInTimeZone(
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    'Europe/Tallinn',
    'yyyy-MM-dd'
  )

  const allResults: VisitRecord[] = []
  let cursor: string | undefined

  do {
    const body: Record<string, unknown> = {
      filter: {
        property: datePropertyName,
        date: { on_or_after: twoDaysAgo },
      },
      page_size: 100,
    }
    if (cursor) body.start_cursor = cursor

    const response = await fetchWithTimeout(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionApiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Failed to query visits database:', response.status, text)
      break
    }

    const data = await response.json()
    const results: any[] = data.results || []
    for (const page of results) {
      const dateValue: string | null = page?.properties?.[datePropertyName]?.date?.start || null
      if (!dateValue) continue
      const dateInTallinn = formatInTimeZone(dateValue, 'Europe/Tallinn', 'yyyy-MM-dd')
      if (dateInTallinn !== tomorrow) continue

      const pageProperties = page.properties || {}
      const timeValue = timePropertyName ? extractTime(pageProperties[timePropertyName]) : null
      const derivedTime = dateValue.includes('T')
        ? formatInTimeZone(dateValue, 'Europe/Tallinn', 'HH:mm')
        : null
      const normalizedTime =
        normalizeTimeToHHmm(timeValue || derivedTime) || timeValue || derivedTime

      allResults.push({
        id: page.id,
        date: dateValue,
        time: normalizedTime,
      })
    }
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  if (!allResults.length) {
    console.log(`No visits found for tomorrow (${tomorrow}) in Notion (today is ${today}).`)
  }

  return allResults
}

async function resolveVisitorsDatabase(
  notionApiKey: string,
  visitorsDatabaseId: string
): Promise<VisitorsDbMeta | null> {
  const dbId = visitorsDatabaseId.replace(/-/g, '')
  const response = await fetchWithTimeout(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!response.ok) {
    console.error('Failed to resolve visitors database:', response.status)
    return null
  }

  const data = await response.json()
  const properties: NotionPropertyMap = data.properties || {}

  const relationPropertyName =
    (properties['Külastused']?.type === 'relation' ? 'Külastused' : null) ||
    Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return properties[key]?.type === 'relation' && normalized.includes('kulastus')
    }) ||
    null

  const phonePropertyName =
    Object.keys(properties).find((key) => properties[key]?.type === 'phone_number') ||
    Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized === 'telefon' || normalized.includes('telefon') || normalized.includes('phone')
    }) ||
    null

  const namePropertyName =
    Object.keys(properties).find((key) => properties[key]?.type === 'title') ||
    Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized.includes('nimi') || normalized.includes('name')
    }) ||
    null

  const smsReminderSentPropertyName =
    (properties['SMS saadetud']?.type === 'checkbox' ? 'SMS saadetud' : null) ||
    Object.keys(properties).find((key) => {
      const prop = properties[key]
      if (prop?.type !== 'checkbox') return false
      const normalized = normalizeKey(key)
      return normalized === 'smssaadetud'
    }) ||
    Object.keys(properties).find((key) => {
      const prop = properties[key]
      if (prop?.type !== 'checkbox') return false
      const normalized = normalizeKey(key)
      return (
        normalized.includes('sms') ||
        normalized.includes('meeldetuletus') ||
        normalized.includes('reminder') ||
        normalized.includes('teavitus')
      )
    }) ||
    // Fallback: any checkbox whose name normalizes to contain "saadetud" (e.g. "SMS  saadetud" or different encoding)
    Object.keys(properties).find((key) => {
      const prop = properties[key]
      if (prop?.type !== 'checkbox') return false
      const normalized = normalizeKey(key)
      return normalized.includes('saadetud')
    }) ||
    null

  if (!smsReminderSentPropertyName) {
    const checkboxKeys = Object.keys(properties).filter((k) => properties[k]?.type === 'checkbox')
    console.warn(
      'Visitors database: no checkbox property found for "SMS saadetud". SMS filter and marking will be skipped – risk of duplicate SMS. Checkbox columns in DB:',
      checkboxKeys.length ? checkboxKeys.join(', ') : '(none)'
    )
  } else {
    console.log('Using SMS checkbox property:', smsReminderSentPropertyName)
  }

  if (!relationPropertyName) {
    console.error('Visitors database has no relation to visits (Külastused)')
  }
  if (!phonePropertyName) {
    console.error('Visitors database has no obvious phone property')
  }

  return {
    databaseId: dbId,
    relationPropertyName,
    phonePropertyName,
    namePropertyName,
    smsReminderSentPropertyName,
  }
}

async function getVisitorsForVisit(
  notionApiKey: string,
  visitorsDb: VisitorsDbMeta,
  visitId: string,
  visitDate: string | null,
  visitTime: string | null
): Promise<VisitorRecord[]> {
  const { databaseId, relationPropertyName, phonePropertyName, namePropertyName, smsReminderSentPropertyName } =
    visitorsDb
  if (!relationPropertyName || !phonePropertyName) return []

  const allVisitors: VisitorRecord[] = []
  let cursor: string | undefined

  do {
    const relationFilter: any = {
      property: relationPropertyName,
      relation: { contains: visitId.replace(/-/g, '') },
    }

    const andFilters: any[] = [relationFilter]
    if (smsReminderSentPropertyName) {
      andFilters.push({
        property: smsReminderSentPropertyName,
        checkbox: { equals: false },
      })
    }

    const body: Record<string, unknown> = {
      filter: andFilters.length === 1 ? andFilters[0] : { and: andFilters },
      page_size: 100,
    }
    if (cursor) body.start_cursor = cursor

    const response = await fetchWithTimeout(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionApiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Failed to query visitors database:', response.status, text)
      break
    }

    const data = await response.json()
    const results: any[] = data.results || []
    for (const page of results) {
      const props: NotionPropertyMap = page.properties || {}
      const phoneProp = props[phonePropertyName]
      const phoneValue: string | null =
        phoneProp?.phone_number ??
        (phoneProp?.rich_text?.[0]?.plain_text as string | undefined) ??
        null

      const normalizedPhone = normalizeEstonianPhone(phoneValue)
      if (!normalizedPhone) continue

      const nameProp = namePropertyName ? props[namePropertyName] : null
      const nameValue: string | null =
        nameProp?.title?.[0]?.plain_text ??
        nameProp?.rich_text?.[0]?.plain_text ??
        null

      allVisitors.push({
        id: page.id,
        phone: normalizedPhone,
        name: nameValue,
        visitDate,
        visitTime,
      })
    }

    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return allVisitors
}

async function markSmsReminderSent(
  notionApiKey: string,
  visitorsDb: VisitorsDbMeta,
  visitorPageId: string
) {
  const { smsReminderSentPropertyName } = visitorsDb
  if (!smsReminderSentPropertyName) {
    console.warn('markSmsReminderSent: no checkbox property configured, skipping')
    return
  }

  const pageId = visitorPageId.replace(/-/g, '')
  const response = await fetchWithTimeout(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        [smsReminderSentPropertyName]: { checkbox: true },
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('Failed to mark SMS reminder sent:', response.status, text)
  } else {
    console.log('Marked SMS saadetud=true for page', pageId)
  }
}

function buildReminderMessage(visitDateIso: string | null, visitTime: string | null) {
  const mapUrl =
    process.env.VISIT_SMS_MAP_URL ||
    'https://maps.app.goo.gl/xxxxxxxx' // soovitatav asendada lühikese Google Maps lingiga

  let datePart = 'homme'
  if (visitDateIso) {
    datePart = formatInTimeZone(visitDateIso, 'Europe/Tallinn', 'dd.MM.yyyy')
  }

  const timePart = visitTime || 'kokkulepitud ajal'

  return (
    `Tere! Tuletame meelde, et Papagoi Keskuse külastus on ${datePart} kell ${timePart}. ` +
    `Kui plaanid muutuvad, palun helistage tühistamiseks või aja muutmiseks: +372 512 7938. ` +
    `Papagoid ootavad teid! Google Maps: ${mapUrl}`
  )
}

export async function runVisitSmsRemindersFromEnv() {
  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_VISITS_DATABASE_ID = process.env.NOTION_VISITS_DATABASE_ID
  const NOTION_VISITORS_DATABASE_ID = process.env.NOTION_VISITORS_DATABASE_ID

  if (!NOTION_API_KEY || !NOTION_VISITS_DATABASE_ID || !NOTION_VISITORS_DATABASE_ID) {
    console.error(
      'Missing Notion configuration. Please set NOTION_API_KEY, NOTION_VISITS_DATABASE_ID and NOTION_VISITORS_DATABASE_ID.'
    )
    process.exit(1)
  }

  console.log('Fetching tomorrow visits from Notion...')
  const visits = await getTomorrowVisitIds(NOTION_API_KEY, NOTION_VISITS_DATABASE_ID)
  if (!visits.length) {
    console.log('No visits found for tomorrow in Notion. Nothing to do.')
    return
  }

  const visitorsDb = await resolveVisitorsDatabase(NOTION_API_KEY, NOTION_VISITORS_DATABASE_ID)
  if (!visitorsDb) {
    console.error('Could not resolve visitors database metadata.')
    process.exit(1)
  }

  const uniqueByPhone = new Map<string, VisitorRecord[]>()

  for (const visit of visits) {
    const visitors = await getVisitorsForVisit(
      NOTION_API_KEY,
      visitorsDb,
      visit.id,
      visit.date || null,
      visit.time || null
    )
    for (const v of visitors) {
      const phone = v.phone.trim()
      if (!phone) continue
      const list = uniqueByPhone.get(phone) ?? []
      list.push(v)
      uniqueByPhone.set(phone, list)
    }
  }

  if (!uniqueByPhone.size) {
    console.log('No visitors with phone numbers found for tomorrow. Nothing to do.')
    return
  }

  const dryRun = process.env.VISIT_SMS_DRY_RUN === '1'
  console.log(
    `Found ${uniqueByPhone.size} unique phone number(s) for tomorrow.` +
      (dryRun ? ' DRY RUN: will not send SMS or update Notion.' : ' Sending SMS reminders...')
  )

  let successCount = 0
  let errorCount = 0

  for (const [phone, visitors] of uniqueByPhone.entries()) {
    const first = visitors[0]
    const message = buildReminderMessage(first.visitDate, first.visitTime)

    if (dryRun) {
      console.log(
        `[DRY RUN] Would send SMS to ${phone} (name: ${first.name || '—'}, visits: ${
          visitors.length
        }) with message: ${message}`
      )
      continue
    }

    try {
      await sendSms({ to: phone, content: message })
      successCount++
      console.log(`SMS reminder sent to ${phone}`)

      for (const v of visitors) {
        await markSmsReminderSent(NOTION_API_KEY, visitorsDb, v.id)
      }
    } catch (error) {
      errorCount++
      console.error(`Failed to send SMS reminder to ${phone}:`, error)
    }
  }

  console.log(
    `Done. Successfully sent ${successCount} SMS reminder(s). Failed: ${errorCount}.`
  )
}

if (process.env.VISIT_SMS_CLI === '1') {
  runVisitSmsRemindersFromEnv().catch((error) => {
    console.error('Unexpected error in send-visit-sms-reminders script:', error)
    process.exit(1)
  })
}

