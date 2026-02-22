/**
 * Broneeringu salvestamine Notioni – Külastused ja Külastajad.
 * Leiab olemasoleva külastuse (kuupäev + kellaaeg) või loob uue, seejärel lisab külastaja.
 * EI muuda ega kustuta olemasolevaid kirjeid.
 */

import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
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

function findProperty(
  properties: Record<string, any>,
  matchers: { type?: string; normalizedIncludes?: string[]; normalizedEquals?: string }[]
) {
  for (const matcher of matchers) {
    const found = Object.keys(properties).find((key) => {
      const prop = properties[key]
      if (matcher.type && prop?.type !== matcher.type) return false
      const normalized = normalizeKey(key)
      if (matcher.normalizedEquals && normalized !== matcher.normalizedEquals) return false
      if (matcher.normalizedIncludes?.length) {
        if (!matcher.normalizedIncludes.some((inc) => normalized.includes(inc))) return false
      }
      return true
    })
    if (found) return found
  }
  return null
}

/**
 * Leiab olemasoleva Külastused rea (kuupäev + kellaaeg) või loob uue.
 * Tagastab page ID.
 */
export async function findOrCreateVisit(payload: {
  date: string
  timeSlot?: string
  totalPrice?: number
}): Promise<string | null> {
  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_VISITS_DATABASE_ID = process.env.NOTION_VISITS_DATABASE_ID

  if (!NOTION_API_KEY || !NOTION_VISITS_DATABASE_ID || !payload.date?.trim()) return null

  const dbId = NOTION_VISITS_DATABASE_ID.replace(/-/g, '')

  const dbRes = await fetchNotion(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!dbRes.ok) {
    console.error('Notion Külastused DB fetch viga:', dbRes.status)
    return null
  }

  const dbData = await dbRes.json()
  const properties = dbData.properties || {}

  const datePropName = findProperty(properties, [
    { type: 'date', normalizedIncludes: ['kuupaev'] },
    { type: 'date', normalizedEquals: 'kuupaev' },
  ])
  const timePropName = findProperty(properties, [
    { normalizedEquals: 'kellaaeg' },
    { normalizedEquals: 'aeg' },
    { normalizedIncludes: ['kellaaeg'] },
  ])
  const titlePropName = Object.keys(properties).find((k) => properties[k]?.type === 'title')
  if (!titlePropName || !datePropName) {
    console.warn('Notion Külastused: puuduvad Kuupäev või Title väljad')
    return null
  }

  let dateFilterValue = payload.date
  if (payload.timeSlot) {
    const utcDate = fromZonedTime(
      `${payload.date}T${payload.timeSlot}:00`,
      'Europe/Tallinn'
    )
    dateFilterValue = formatInTimeZone(utcDate, 'Europe/Tallinn', "yyyy-MM-dd'T'HH:mm:ssXXX")
  }
  const andFilters: any[] = [
    {
      property: datePropName,
      date: { equals: dateFilterValue },
    },
  ]
  if (timePropName && payload.timeSlot) {
    const timeProp = properties[timePropName]
    if (timeProp?.type === 'select') {
      andFilters.push({
        property: timePropName,
        select: { equals: payload.timeSlot },
      })
    } else if (timeProp?.type === 'rich_text') {
      andFilters.push({
        property: timePropName,
        rich_text: { contains: payload.timeSlot },
      })
    }
  }

  const queryRes = await fetchNotion(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: andFilters.length === 1 ? andFilters[0] : { and: andFilters },
      page_size: 1,
    }),
  })

  if (!queryRes.ok) {
    console.error('Notion Külastused query viga:', queryRes.status)
    return null
  }

  const queryData = await queryRes.json()
  const existing = queryData.results?.[0]
  if (existing) {
    return existing.id
  }

  const titleContent = [payload.date, payload.timeSlot || ''].filter(Boolean).join(' ')
  let dateStart = payload.date
  if (payload.timeSlot) {
    const utcDate = fromZonedTime(
      `${payload.date}T${payload.timeSlot}:00`,
      'Europe/Tallinn'
    )
    dateStart = formatInTimeZone(utcDate, 'Europe/Tallinn', "yyyy-MM-dd'T'HH:mm:ssXXX")
  }
  const visitProps: Record<string, any> = {
    [titlePropName]: { title: [{ type: 'text', text: { content: titleContent } }] },
    [datePropName]: {
      date: { start: dateStart },
    },
  }
  if (timePropName && payload.timeSlot) {
    const timeProp = properties[timePropName]
    if (timeProp?.type === 'select') {
      visitProps[timePropName] = { select: { name: payload.timeSlot } }
    } else if (timeProp?.type === 'rich_text') {
      visitProps[timePropName] = {
        rich_text: [{ type: 'text', text: { content: payload.timeSlot } }],
      }
    }
  }

  const createRes = await fetchNotion('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: visitProps,
    }),
  })

  if (!createRes.ok) {
    const errText = await createRes.text()
    console.error('Notion Külastused create viga:', createRes.status, errText)
    return null
  }

  const created = await createRes.json()
  return created.id
}

/**
 * Loob Külastajad rea ja seob selle Külastused-ga.
 */
export async function createVisitor(payload: {
  visitPageId: string
  name: string
  email: string
  phone: string
  groupSize: number
  groupType?: string
  message?: string
  totalPrice?: number
}): Promise<boolean> {
  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_VISITORS_DATABASE_ID = process.env.NOTION_VISITORS_DATABASE_ID

  if (!NOTION_API_KEY || !NOTION_VISITORS_DATABASE_ID) return false

  const dbId = NOTION_VISITORS_DATABASE_ID.replace(/-/g, '')
  const visitId = payload.visitPageId.replace(/-/g, '')

  const dbRes = await fetchNotion(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!dbRes.ok) {
    console.error('Notion Külastajad DB fetch viga:', dbRes.status)
    return false
  }

  const dbData = await dbRes.json()
  const properties = dbData.properties || {}

  const titlePropName = Object.keys(properties).find((k) => properties[k]?.type === 'title')
  const relationPropName =
    (properties['Külastused']?.type === 'relation' ? 'Külastused' : null) ||
    Object.keys(properties).find((k) => {
      const n = normalizeKey(k)
      return properties[k]?.type === 'relation' && n.includes('kulastus')
    })
  const countPropName =
    (properties['Arv'] ? 'Arv' : null) ||
    Object.keys(properties).find((k) => {
      const n = normalizeKey(k)
      return n === 'arv' || n.includes('arv')
    })
  const emailPropName = findProperty(properties, [
    { normalizedEquals: 'e-post' },
    { normalizedIncludes: ['email', 'epost'] },
  ])
  const phonePropName = findProperty(properties, [
    { normalizedEquals: 'telefon' },
    { normalizedIncludes: ['phone', 'telefon'] },
  ])
  const namePropName = titlePropName || findProperty(properties, [{ normalizedIncludes: ['nimi'] }])

  if (!titlePropName && !namePropName) {
    console.warn('Notion Külastajad: puudub Nimi/Title väljad')
    return false
  }
  if (!relationPropName) {
    console.warn('Notion Külastajad: puudub Külastused relation')
    return false
  }

  const visitorProps: Record<string, any> = {
    [titlePropName || namePropName!]: {
      title: [{ type: 'text', text: { content: payload.name || 'Külastaja' } }],
    },
    [relationPropName]: {
      relation: [{ id: visitId }],
    },
  }

  if (countPropName) {
    visitorProps[countPropName] = { number: payload.groupSize }
  }
  if (emailPropName) {
    const emailProp = properties[emailPropName]
    if (emailProp?.type === 'email') {
      visitorProps[emailPropName] = { email: payload.email }
    } else {
      visitorProps[emailPropName] = {
        rich_text: [{ type: 'text', text: { content: payload.email } }],
      }
    }
  }
  if (phonePropName) {
    const phoneProp = properties[phonePropName]
    if (phoneProp?.type === 'phone_number') {
      visitorProps[phonePropName] = { phone_number: payload.phone }
    } else {
      visitorProps[phonePropName] = {
        rich_text: [{ type: 'text', text: { content: payload.phone } }],
      }
    }
  }

  const createRes = await fetchNotion('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: visitorProps,
    }),
  })

  if (!createRes.ok) {
    const errText = await createRes.text()
    console.error('Notion Külastajad create viga:', createRes.status, errText)
    return false
  }

  return true
}
