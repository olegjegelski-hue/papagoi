import 'dotenv/config'
import { formatInTimeZone } from 'date-fns-tz'
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

type NotionPropertyMap = Record<string, any>

interface VisitorsDbMeta {
  databaseId: string
  relationPropertyName: string | null
  emailPropertyName: string | null
  namePropertyName: string | null
  reviewSentPropertyName: string | null
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

  return { databaseId: baseId, datePropertyName }
}

async function getTodayVisitIds(
  notionApiKey: string,
  visitsDatabaseId: string
): Promise<{ id: string; date: string }[]> {
  const resolved = await resolveVisitsDatabase(notionApiKey, visitsDatabaseId)
  if (!resolved) return []

  const { databaseId, datePropertyName } = resolved

  const now = new Date()
  const today = formatInTimeZone(now, 'Europe/Tallinn', 'yyyy-MM-dd')
  const twoDaysAgo = formatInTimeZone(
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    'Europe/Tallinn',
    'yyyy-MM-dd'
  )

  const allResults: { id: string; date: string }[] = []
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
      if (dateInTallinn !== today) continue
      allResults.push({ id: page.id, date: dateValue })
    }
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

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

  const emailPropertyName =
    Object.keys(properties).find((key) => properties[key]?.type === 'email') ||
    Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized === 'email' || normalized.includes('email') || normalized.includes('epost')
    }) ||
    null

  const namePropertyName =
    Object.keys(properties).find((key) => properties[key]?.type === 'title') ||
    Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized.includes('nimi') || normalized.includes('name')
    }) ||
    null

  const reviewSentPropertyName =
    Object.keys(properties).find((key) => {
      const prop = properties[key]
      if (prop?.type !== 'checkbox') return false
      const normalized = normalizeKey(key)
      return (
        normalized.includes('review') ||
        normalized.includes('arvustus') ||
        normalized.includes('tagasiside') ||
        normalized.includes('tagasisidekutse') ||
        normalized.includes('reviewkutse') ||
        normalized.includes('kutsu') ||
        normalized.includes('saadetud')
      )
    }) || null

  if (!relationPropertyName) {
    console.error('Visitors database has no relation to visits (Külastused)')
  }
  if (!emailPropertyName) {
    console.error('Visitors database has no obvious email property')
  }

  return {
    databaseId: dbId,
    relationPropertyName,
    emailPropertyName,
    namePropertyName,
    reviewSentPropertyName,
  }
}

interface VisitorRecord {
  id: string
  email: string
  name: string | null
  visitDate: string | null
}

async function getVisitorsForVisit(
  notionApiKey: string,
  visitorsDb: VisitorsDbMeta,
  visitId: string,
  visitDate: string | null
): Promise<VisitorRecord[]> {
  const { databaseId, relationPropertyName, emailPropertyName, namePropertyName, reviewSentPropertyName } =
    visitorsDb
  if (!relationPropertyName || !emailPropertyName) return []

  const allVisitors: VisitorRecord[] = []
  let cursor: string | undefined

  do {
    const filter: any = {
      property: relationPropertyName,
      relation: { contains: visitId.replace(/-/g, '') },
    }

    const andFilters: any[] = [filter]
    if (reviewSentPropertyName) {
      andFilters.push({
        property: reviewSentPropertyName,
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
      const emailProp = props[emailPropertyName]
      const emailValue: string | null =
        emailProp?.email ??
        (emailProp?.rich_text?.[0]?.plain_text as string | undefined) ??
        null

      if (!emailValue) continue

      const nameProp = namePropertyName ? props[namePropertyName] : null
      const nameValue: string | null =
        nameProp?.title?.[0]?.plain_text ??
        nameProp?.rich_text?.[0]?.plain_text ??
        null

      allVisitors.push({
        id: page.id,
        email: emailValue,
        name: nameValue,
        visitDate,
      })
    }

    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return allVisitors
}

async function markReviewSent(
  notionApiKey: string,
  visitorsDb: VisitorsDbMeta,
  visitorPageId: string
) {
  const { reviewSentPropertyName } = visitorsDb
  if (!reviewSentPropertyName) return

  const pageId = visitorPageId.replace(/-/g, '')
  const response = await fetchWithTimeout(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'patch',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        [reviewSentPropertyName]: { checkbox: true },
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('Failed to mark review sent:', response.status, text)
  }
}

export async function sendReviewEmail(to: string, name: string | null, visitDateIso: string | null) {
  const transporter = createTransporter()
  const fromAddress = process.env.SMTP_USER || 'keskus@papagoi.ee'
  const centerEmail = process.env.CENTER_EMAIL || 'keskus@papagoi.ee'
  const reviewLink =
    process.env.REVIEW_GOOGLE_URL || 'https://g.page/r/CXfsGh_UtN6-EBM/review'

  const greetingName = name || 'Papagoi sõber'

  const subject = 'Aitäh külastuse eest! Jäta palun meile Google’i arvustus'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
        Aitäh külastuse eest! Jäta palun meile Google’i arvustus
      </h2>
      <p style="font-size: 16px; line-height: 1.6;">
        Tere, <strong>${greetingName}</strong>!
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Aitäh, et käisite täna <strong>Papagoi Keskuses</strong> külas. Loodame, et külastus pakkus teile rõõmu ja häid elamusi.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Kui teil on hetk aega, oleksime väga tänulikud, kui jätaksite meile <strong>Google’is lühikese arvustuse</strong>.
        See aitab teistel külastajatel meid leida ja toetab meie väikest peretegemist.
      </p>
      <p style="margin: 24px 0;">
        👉 <a href="${reviewLink}" style="background-color: #f59e0b; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;">
          Jäta arvustus siia
        </a>
      </p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        <strong>Võite vabalt lisada ka pilte oma külastusest – see rõõmustab meid väga.</strong>
      </p>
      <p style="margin-top: 16px; font-size: 14px; color: #4b5563;">
        Kui teil on tagasisidet või küsimusi, vastake julgelt sellele kirjale.
      </p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;">Suur aitäh!</p>
        <p style="margin: 5px 0; font-weight: 600;">Papagoi Keskus</p>
        <p style="margin: 5px 0;">Tel +372 51 27 938</p>
        <p style="margin: 5px 0;"><a href="https://www.papagoi.ee/">https://www.papagoi.ee/</a></p>
        <p style="margin: 5px 0;"><a href="mailto:keskus@papagoi.ee">keskus@papagoi.ee</a></p>
      </div>
    </div>
  `

  const text = `
Tere, ${greetingName}!

Aitäh, et käisite täna Papagoi Keskuses külas. Loodame, et külastus pakkus teile rõõmu ja häid elamusi.

Kui teil on hetk aega, oleksime väga tänulikud, kui jätaksite meile Google’is lühikese arvustuse. See aitab teistel külastajatel meid leida ja toetab meie väikest peretegemist.

Jäta arvustus siia:
${reviewLink}

Võite vabalt lisada ka pilte oma külastusest – see rõõmustab meid väga.

Kui teil on tagasisidet või küsimusi, vastake julgelt sellele kirjale.

Suur aitäh!

Papagoi Keskus
Tel +372 51 27 938
https://www.papagoi.ee/
keskus@papagoi.ee
  `.trim()

  await transporter.sendMail({
    from: `"Papagoi Keskus" <${fromAddress}>`,
    to,
    cc: centerEmail,
    subject,
    html,
    text,
  })
}

export async function runReviewInvitesFromEnv() {
  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_VISITS_DATABASE_ID = process.env.NOTION_VISITS_DATABASE_ID
  const NOTION_VISITORS_DATABASE_ID = process.env.NOTION_VISITORS_DATABASE_ID

  if (!NOTION_API_KEY || !NOTION_VISITS_DATABASE_ID || !NOTION_VISITORS_DATABASE_ID) {
    console.error(
      'Missing Notion configuration. Please set NOTION_API_KEY, NOTION_VISITS_DATABASE_ID and NOTION_VISITORS_DATABASE_ID.'
    )
    process.exit(1)
  }

  console.log('Fetching today visits from Notion...')
  const visits = await getTodayVisitIds(NOTION_API_KEY, NOTION_VISITS_DATABASE_ID)
  if (!visits.length) {
    console.log('No visits found for today in Notion. Nothing to do.')
    return
  }

  const visitorsDb = await resolveVisitorsDatabase(NOTION_API_KEY, NOTION_VISITORS_DATABASE_ID)
  if (!visitorsDb) {
    console.error('Could not resolve visitors database metadata.')
    process.exit(1)
  }

  const uniqueByEmail = new Map<string, VisitorRecord[]>()

  for (const visit of visits) {
    const visitors = await getVisitorsForVisit(
      NOTION_API_KEY,
      visitorsDb,
      visit.id,
      visit.date || null
    )
    for (const v of visitors) {
      const list = uniqueByEmail.get(v.email) ?? []
      list.push(v)
      uniqueByEmail.set(v.email, list)
    }
  }

  if (!uniqueByEmail.size) {
    console.log('No visitors with email found for today. Nothing to do.')
    return
  }

  const dryRun = process.env.REVIEW_DRY_RUN === '1'
  console.log(
    `Found ${uniqueByEmail.size} unique email(s) for today.` +
      (dryRun ? ' DRY RUN: will not send emails or update Notion.' : ' Sending review emails...')
  )

  let successCount = 0
  let errorCount = 0

  for (const [email, visitors] of uniqueByEmail.entries()) {
    const first = visitors[0]
    if (dryRun) {
      console.log(
        `[DRY RUN] Would send review email to ${email} (name: ${first.name || '—'}, visits: ${
          visitors.length
        })`
      )
      continue
    }
    try {
      await sendReviewEmail(email, first.name, first.visitDate)
      successCount++
      console.log(`Review email sent to ${email}`)

      // Mark all corresponding visitor pages as "review sent" if property exists
      for (const v of visitors) {
        await markReviewSent(NOTION_API_KEY, visitorsDb, v.id)
      }
    } catch (error) {
      errorCount++
      console.error(`Failed to send review email to ${email}:`, error)
    }
  }

  console.log(
    `Done. Successfully sent ${successCount} email(s). Failed: ${errorCount}.`
  )
}

if (process.env.REVIEW_CLI === '1') {
  runReviewInvitesFromEnv().catch((error) => {
    console.error('Unexpected error in send-review-invites script:', error)
    process.exit(1)
  })
}

