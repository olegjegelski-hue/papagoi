/**
 * Broneeringu salvestamine Notioni – Külastused ja Külastajad.
 * Leiab olemasoleva külastuse (kuupäev + kellaaeg) või loob uue, seejärel lisab külastaja.
 * EI muuda ega kustuta olemasolevaid kirjeid.
 */

import { randomBytes } from 'crypto'
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'
import { extractVipFlag, isVipVisitPropertyName } from '@/lib/vip-visit'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

/** Notioni Select „Külastuse keel“ valikud: Est, Rus, Eng */
function visitLanguageToNotionSelect(code: 'et' | 'en' | 'ru') {
  if (code === 'en') return 'Eng'
  if (code === 'ru') return 'Rus'
  return 'Est'
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

export type ReserveVisitResult =
  | { ok: true; visitId: string }
  | { ok: false; reason: 'SLOT_VIP' | 'SLOT_OCCUPIED' | 'NOTION_ERROR' }

function findVipCheckboxPropName(properties: Record<string, any>): string | null {
  return (
    Object.keys(properties).find(
      (key) => properties[key]?.type === 'checkbox' && isVipVisitPropertyName(key)
    ) || null
  )
}

function extractGuestCount(properties: Record<string, any>): number {
  const priceLike = (n: string) =>
    n.includes('summa') || n.includes('hind') || n.includes('price') || n.includes('euro')
  for (const key of Object.keys(properties)) {
    const n = normalizeKey(key)
    const prop = properties[key]
    if (!prop || priceLike(n) || n.includes('vip')) continue
    const looksLikeGuests =
      n === 'kulalised' ||
      n.includes('kulal') ||
      (n.includes('kulastaj') && (n.includes('arv') || n.includes('kokku'))) ||
      n === 'arv'
    if (!looksLikeGuests) continue
    if (prop.type === 'number' && typeof prop.number === 'number') return prop.number
    if (prop.type === 'rollup' && prop.rollup?.type === 'number' && typeof prop.rollup.number === 'number') {
      return prop.rollup.number
    }
    if (prop.type === 'relation' && Array.isArray(prop.relation)) return prop.relation.length
  }
  const relation = Object.keys(properties).find((key) => {
    const n = normalizeKey(key)
    return properties[key]?.type === 'relation' && (n.includes('kulastaj') || n.includes('kulaline'))
  })
  if (relation && Array.isArray(properties[relation]?.relation)) {
    return properties[relation].relation.length
  }
  return 0
}

/**
 * Leiab olemasoleva Külastused rea (kuupäev + kellaaeg) või loob uue.
 * Tagastab page ID.
 */
export async function findOrCreateVisit(payload: {
  date: string
  timeSlot?: string
  totalPrice?: number
  vip?: boolean
}): Promise<string | null> {
  const reserved = await reserveVisitSlot(payload)
  return reserved.ok ? reserved.visitId : null
}

/**
 * Broneerib Külastused-rea, kontrollides VIP/tavalise slotti reegleid submiti hetkel.
 */
export async function reserveVisitSlot(payload: {
  date: string
  timeSlot?: string
  totalPrice?: number
  vip?: boolean
}): Promise<ReserveVisitResult> {
  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_VISITS_DATABASE_ID = process.env.NOTION_VISITS_DATABASE_ID

  if (!NOTION_API_KEY || !NOTION_VISITS_DATABASE_ID || !payload.date?.trim()) {
    return { ok: false, reason: 'NOTION_ERROR' }
  }

  const dbId = NOTION_VISITS_DATABASE_ID.replace(/-/g, '')
  const wantVip = Boolean(payload.vip)

  const dbRes = await fetchNotion(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!dbRes.ok) {
    console.error('Notion Külastused DB fetch viga:', dbRes.status)
    return { ok: false, reason: 'NOTION_ERROR' }
  }

  const dbData = await dbRes.json()
  const properties = dbData.properties || {}
  const vipPropName = findVipCheckboxPropName(properties)

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
    return { ok: false, reason: 'NOTION_ERROR' }
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
      page_size: 10,
    }),
  })

  if (!queryRes.ok) {
    console.error('Notion Külastused query viga:', queryRes.status)
    return { ok: false, reason: 'NOTION_ERROR' }
  }

  const queryData = await queryRes.json()
  const existingPages: any[] = queryData.results || []

  for (const page of existingPages) {
    const pageProps = page.properties || {}
    const isVip = extractVipFlag(pageProps)
    const guests = extractGuestCount(pageProps)
    if (isVip) {
      return { ok: false, reason: 'SLOT_VIP' }
    }
    if (wantVip && guests > 0) {
      return { ok: false, reason: 'SLOT_OCCUPIED' }
    }
  }

  const emptyExisting = existingPages.find((page) => extractGuestCount(page.properties || {}) === 0)
  const joinable = existingPages[0]

  if (wantVip) {
    const reusable = emptyExisting
    if (reusable) {
      if (vipPropName) {
        const patchRes = await fetchNotion(
          `https://api.notion.com/v1/pages/${String(reusable.id).replace(/-/g, '')}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${NOTION_API_KEY}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              properties: { [vipPropName]: { checkbox: true } },
            }),
          }
        )
        if (!patchRes.ok) {
          console.error('Notion VIP linnukese uuendus ebaõnnestus:', patchRes.status)
        }
      }
      return { ok: true, visitId: reusable.id }
    }
    if (existingPages.length > 0) {
      return { ok: false, reason: 'SLOT_OCCUPIED' }
    }
  } else if (joinable) {
    return { ok: true, visitId: joinable.id }
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
  if (wantVip && vipPropName) {
    visitProps[vipPropName] = { checkbox: true }
  } else if (wantVip && !vipPropName) {
    console.warn('Notion Külastused: VIP külastus checkboxi ei leitud')
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
    return { ok: false, reason: 'NOTION_ERROR' }
  }

  const created = await createRes.json()
  return { ok: true, visitId: created.id }
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
  /** Külastuse/juhendi keel – salvestatakse Notioni, kui vastav väli leidub */
  visitLanguage?: 'et' | 'en' | 'ru'
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
    { normalizedEquals: 'email' },
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

  const confirmedPropName = Object.keys(properties).find((k) => {
    const n = normalizeKey(k)
    return properties[k]?.type === 'checkbox' && (n === 'kinnitatud' || n.includes('kinnitatud'))
  })
  if (confirmedPropName) {
    visitorProps[confirmedPropName] = { checkbox: false }
  }

  const signaturePropName = Object.keys(properties).find((k) => {
    const n = normalizeKey(k)
    return (n === 'signature' || n.includes('signature')) && properties[k]?.type === 'rich_text'
  })
  if (signaturePropName) {
    const signature = randomBytes(24).toString('hex')
    visitorProps[signaturePropName] = { rich_text: [{ type: 'text', text: { content: signature } }] }
  }

  const visitLangPropName =
    findProperty(properties, [
      { type: 'select', normalizedIncludes: ['keel', 'language', 'visitlang'] },
      { type: 'rich_text', normalizedIncludes: ['keel', 'language', 'visitlang'] },
    ]) ||
    Object.keys(properties).find((k) => {
      const n = normalizeKey(k)
      return (
        (n.includes('keel') || n.includes('language') || n.includes('visitlang')) &&
        (properties[k]?.type === 'select' || properties[k]?.type === 'rich_text')
      )
    }) ||
    null

  if (visitLangPropName && payload.visitLanguage) {
    const langProp = properties[visitLangPropName]
    if (langProp?.type === 'select') {
      visitorProps[visitLangPropName] = {
        select: { name: visitLanguageToNotionSelect(payload.visitLanguage) },
      }
    } else if (langProp?.type === 'rich_text') {
      visitorProps[visitLangPropName] = {
        rich_text: [{ type: 'text', text: { content: payload.visitLanguage } }],
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
