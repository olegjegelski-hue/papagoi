import 'dotenv/config'
import { formatInTimeZone } from 'date-fns-tz'
import { sendSms } from '../lib/sms'
import { createTransporter } from '../lib/email'

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
  countPropertyName: string | null
  smsReminderSentPropertyName: string | null
}

interface VisitorRecord {
  id: string
  phone: string
  name: string | null
  visitDate: string | null
  visitTime: string | null
  groupSize: number | null
  /** Kas sellel rea real on juba "SMS saadetud" linnuke (true = ära saada) */
  smsAlreadySent: boolean
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

  const countPropertyName =
    (properties['Arv']?.type === 'number' ? 'Arv' : null) ||
    Object.keys(properties).find((key) => {
      const prop = properties[key]
      if (prop?.type !== 'number') return false
      const normalized = normalizeKey(key)
      return normalized === 'arv' || normalized.includes('arv')
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
    countPropertyName,
    smsReminderSentPropertyName,
  }
}

/** Tagastab kõik selle külastusega seotud külastajad; linnukese kontrollitakse iga rea pealt eraldi. */
async function getVisitorsForVisit(
  notionApiKey: string,
  visitorsDb: VisitorsDbMeta,
  visitId: string,
  visitDate: string | null,
  visitTime: string | null
): Promise<{ visitors: VisitorRecord[]; smsSentPropertyKey: string | null }> {
  const { databaseId, relationPropertyName, phonePropertyName, namePropertyName, countPropertyName, smsReminderSentPropertyName } =
    visitorsDb
  if (!relationPropertyName || !phonePropertyName) return { visitors: [], smsSentPropertyKey: null }

  const allVisitors: VisitorRecord[] = []
  let discoveredSmsKey: string | null = smsReminderSentPropertyName || null
  let cursor: string | undefined

  do {
    const body: Record<string, unknown> = {
      filter: {
        property: relationPropertyName,
        relation: { contains: visitId.replace(/-/g, '') },
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

      const smsSentKey =
        discoveredSmsKey ||
        Object.keys(props).find(
          (k) => props[k]?.type === 'checkbox' && normalizeKey(k).includes('saadetud')
        ) ||
        null
      if (smsSentKey && !discoveredSmsKey) discoveredSmsKey = smsSentKey

      let smsAlreadySent = true
      if (smsSentKey) {
        const checkboxVal = props[smsSentKey]?.checkbox
        smsAlreadySent = checkboxVal === true
      }

      let groupSize: number | null = null
      if (countPropertyName) {
        const n = props[countPropertyName]?.number
        if (typeof n === 'number' && Number.isInteger(n) && n >= 1) groupSize = n
      }

      allVisitors.push({
        id: page.id,
        phone: normalizedPhone,
        name: nameValue,
        visitDate,
        visitTime,
        groupSize,
        smsAlreadySent,
      })
    }

    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return { visitors: allVisitors, smsSentPropertyKey: discoveredSmsKey }
}

async function markSmsReminderSent(
  notionApiKey: string,
  visitorPageId: string,
  smsSentPropertyKey: string
) {
  if (!smsSentPropertyKey) return

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
        [smsSentPropertyKey]: { checkbox: true },
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

function buildReminderMessage(
  visitDateIso: string | null,
  visitTime: string | null,
  groupSize: number | null
) {
  let datePart = 'homme'
  if (visitDateIso) {
    datePart = formatInTimeZone(visitDateIso, 'Europe/Tallinn', 'dd.MM.yyyy')
  }

  const timePart = visitTime || 'kokkulepitud ajal'
  const countPart =
    groupSize != null && groupSize >= 1 ? ` (${groupSize} inimest)` : ''

  return (
    `Tere! Meeldetuletus: Papagoi Keskus ${datePart} kell ${timePart}.${countPart} Papagoid ootavad! Kui plaanid muutuvad, palun helistada: +372 512 7938.`
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

  console.log('Resolving Külastajad DB, id suffix:', NOTION_VISITORS_DATABASE_ID.replace(/-/g, '').slice(-8))
  const visitorsDb = await resolveVisitorsDatabase(NOTION_API_KEY, NOTION_VISITORS_DATABASE_ID)
  if (!visitorsDb) {
    console.error('Could not resolve visitors database metadata.')
    process.exit(1)
  }

  const uniqueByPhone = new Map<string, VisitorRecord[]>()
  let effectiveSmsSentPropertyKey: string | null = visitorsDb.smsReminderSentPropertyName || null

  for (const visit of visits) {
    const { visitors, smsSentPropertyKey } = await getVisitorsForVisit(
      NOTION_API_KEY,
      visitorsDb,
      visit.id,
      visit.date || null,
      visit.time || null
    )
    if (smsSentPropertyKey && !effectiveSmsSentPropertyKey) effectiveSmsSentPropertyKey = smsSentPropertyKey
    for (const v of visitors) {
      if (v.smsAlreadySent) continue
      const phone = v.phone.trim()
      if (!phone) continue
      const list = uniqueByPhone.get(phone) ?? []
      list.push(v)
      uniqueByPhone.set(phone, list)
    }
  }

  if (!effectiveSmsSentPropertyKey) {
    console.error(
      'ABORT: Ei leitud ühtegi "SMS saadetud" tüüpi veergu (ei skeemist ega külastaja lehtedelt). SMS-e ei saadeta.'
    )
    return
  }

  if (!uniqueByPhone.size) {
    console.log('No visitors without linnuke (SMS saadetud) found for tomorrow. Nothing to do.')
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
    const message = buildReminderMessage(first.visitDate, first.visitTime, first.groupSize)

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
        await markSmsReminderSent(NOTION_API_KEY, v.id, effectiveSmsSentPropertyKey!)
      }
    } catch (error) {
      errorCount++
      console.error(`Failed to send SMS reminder to ${phone}:`, error)
    }
  }

  console.log(
    `Done. Successfully sent ${successCount} SMS reminder(s). Failed: ${errorCount}.`
  )

  // Saada kokkuvõtte email keskusele, kui päriselt SMS-e saadeti
  if (!dryRun && uniqueByPhone.size > 0) {
    try {
      const transporter = createTransporter()
      const to = process.env.CENTER_EMAIL || 'keskus@papagoi.ee'
      const fromAddress = process.env.SMTP_USER || 'keskus@papagoi.ee'
      const subject = 'SMS meeldetuletused – päevakokkuvõte'

      const now = new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })

      const text = [
        'Papagoi Keskuse külastuste SMS-meeldetuletuste kokkuvõte',
        '',
        `Kuupäev ja kellaaeg (Tallinn): ${now}`,
        '',
        `Unikaalseid telefoninumbreid (plaanitud): ${uniqueByPhone.size}`,
        `Õnnestus saata: ${successCount}`,
        `Ebaõnnestus: ${errorCount}`,
      ].join('\n')

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
            SMS meeldetuletuste kokkuvõte
          </h2>
          <p>Kuupäev ja kellaaeg (Tallinn): <strong>${now}</strong></p>
          <ul style="line-height: 1.6;">
            <li><strong>Unikaalseid telefoninumbreid (plaanitud):</strong> ${uniqueByPhone.size}</li>
            <li><strong>Õnnestus saata:</strong> ${successCount}</li>
            <li><strong>Ebaõnnestus:</strong> ${errorCount}</li>
          </ul>
        </div>
      `

      await transporter.sendMail({
        from: `"Papagoi Keskus – SMS meeldetuletused" <${fromAddress}>`,
        to,
        subject,
        text,
        html,
      })

      console.log(`Visit SMS summary email sent to ${to}`)
    } catch (error) {
      console.error('Failed to send visit SMS summary email:', error)
    }
  }
}

if (process.env.VISIT_SMS_CLI === '1') {
  runVisitSmsRemindersFromEnv().catch((error) => {
    console.error('Unexpected error in send-visit-sms-reminders script:', error)
    process.exit(1)
  })
}

