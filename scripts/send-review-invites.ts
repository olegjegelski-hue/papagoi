import 'dotenv/config'
import { formatInTimeZone } from 'date-fns-tz'
import { buildReviewInviteEmail, createTransporter, sendReviewInviteEmail } from '../lib/email'
import { shouldShowReviewDonationLine } from '../lib/email-i18n'
import { extractGroupTypeFromNotionVisitorProps } from '../lib/notion-booking'
import { escapeHtml } from '../lib/sanitize'
import {
  extractVisitLanguageFromNotionVisitorProps,
  parseVisitMailLocale,
  type VisitMailLocale,
} from '../lib/visit-language'

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
  }
}

interface VisitorRecord {
  id: string
  email: string
  name: string | null
  visitDate: string | null
  locale: VisitMailLocale
  groupType: string | null
}

async function getVisitorsForVisit(
  notionApiKey: string,
  visitorsDb: VisitorsDbMeta,
  visitId: string,
  visitDate: string | null
): Promise<VisitorRecord[]> {
  const { databaseId, relationPropertyName, emailPropertyName, namePropertyName } = visitorsDb
  if (!relationPropertyName || !emailPropertyName) return []

  const allVisitors: VisitorRecord[] = []
  let cursor: string | undefined

  do {
    const filter: any = {
      property: relationPropertyName,
      relation: { contains: visitId.replace(/-/g, '') },
    }

    const body: Record<string, unknown> = {
      filter,
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
        locale: parseVisitMailLocale(extractVisitLanguageFromNotionVisitorProps(props)),
        groupType: extractGroupTypeFromNotionVisitorProps(props),
      })
    }

    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  return allVisitors
}

export async function sendReviewEmail(
  to: string,
  name: string | null,
  visitDateIso: string | null,
  options?: { locale?: VisitMailLocale; groupType?: string | null }
) {
  return sendReviewInviteEmail({
    to,
    name,
    visitDateIso,
    locale: options?.locale,
    groupType: options?.groupType,
  })
}

type ReviewInviteRecipientRow = {
  name: string | null
  email: string
  locale: VisitMailLocale
  groupType: string | null
  showDonation: boolean
  failed?: boolean
}

const VARIANT_LOCALE_ORDER: VisitMailLocale[] = ['et', 'en', 'ru']

function localeCodeUpper(locale: VisitMailLocale) {
  return locale.toUpperCase()
}

function recipientLine(row: ReviewInviteRecipientRow) {
  const name = row.name?.trim() || '—'
  const groupType = row.groupType?.trim() || '—'
  const donation = row.showDonation ? 'jah' : 'ei'
  const failed = row.failed ? ' · ebaõnnestus' : ''
  return `${name} · ${row.email} · ${localeCodeUpper(row.locale)} · ${groupType} · annetuse rida: ${donation}${failed}`
}

function variantKey(locale: VisitMailLocale, showDonation: boolean) {
  return `${locale}:${showDonation ? '1' : '0'}`
}

function variantHeading(locale: VisitMailLocale, showDonation: boolean, count: number) {
  return `${localeCodeUpper(locale)} · ${showDonation ? 'annetuse reaga' : 'ilma annetuseta'} · ${count} kirja`
}

function collectReviewInviteVariants(recipients: ReviewInviteRecipientRow[]) {
  type Variant = {
    locale: VisitMailLocale
    showDonation: boolean
    count: number
    groupType: string | null
  }
  const map = new Map<string, Variant>()
  for (const row of recipients) {
    if (row.failed) continue
    const key = variantKey(row.locale, row.showDonation)
    const existing = map.get(key)
    if (existing) {
      existing.count += 1
    } else {
      map.set(key, {
        locale: row.locale,
        showDonation: row.showDonation,
        count: 1,
        groupType: row.groupType,
      })
    }
  }
  return VARIANT_LOCALE_ORDER.flatMap((locale) =>
    [true, false]
      .map((showDonation) => map.get(variantKey(locale, showDonation)))
      .filter((v): v is Variant => Boolean(v))
  )
}

function shouldIncludeLetterSamples(params: {
  sentCount: number
  dryRun: boolean
  earlyReason?: string
  recipients: ReviewInviteRecipientRow[]
}) {
  if (params.earlyReason) return false
  if (params.dryRun) return params.recipients.some((row) => !row.failed)
  return params.sentCount > 0
}

export function buildReviewCronSummaryContent(params: {
  visitsCount: number
  uniqueEmailsCount: number
  sentCount: number
  errorCount: number
  dryRun: boolean
  earlyReason?: string
  errorMessage?: string
  recipients?: ReviewInviteRecipientRow[]
  nowLabel: string
}) {
  const recipients = params.recipients ?? []
  const lines = [
    `Käivitus: ${params.nowLabel} (Tallinna aeg)`,
    params.dryRun ? 'Režiim: DRY RUN' : '',
    params.earlyReason ? `Põhjus: ${params.earlyReason}` : '',
    `Külastusi täna: ${params.visitsCount}`,
    `E-posti aadresse: ${params.uniqueEmailsCount}`,
    `Saadetud: ${params.sentCount}`,
    `Ebaõnnestus: ${params.errorCount}`,
    params.errorMessage ? `Viga: ${params.errorMessage}` : '',
  ].filter(Boolean)

  const includeLetters = shouldIncludeLetterSamples({
    sentCount: params.sentCount,
    dryRun: params.dryRun,
    earlyReason: params.earlyReason,
    recipients,
  })
  const variants = includeLetters ? collectReviewInviteVariants(recipients) : []

  const letterSamples = variants.map((variant) => ({
    heading: variantHeading(variant.locale, variant.showDonation, variant.count),
    built: buildReviewInviteEmail({
      name: null,
      locale: variant.locale,
      groupType: variant.groupType,
    }),
  }))

  const textParts = [lines.join('\n')]
  if (recipients.length) {
    textParts.push('', 'Kellele saadeti', ...recipients.map((row) => `- ${recipientLine(row)}`))
  }
  if (letterSamples.length) {
    textParts.push('', 'Saadetud kirja tekst')
    for (const sample of letterSamples) {
      textParts.push('', sample.heading, `Teema: ${sample.built.subject}`, '', sample.built.text)
    }
  }
  textParts.push('', 'See kiri saadetakse iga kord, kui cron käivitatakse.')

  const recipientHtml = recipients.length
    ? `<h3 style="color: #333; margin: 24px 0 8px;">Kellele saadeti</h3><ul style="padding-left: 20px; line-height: 1.7;">${recipients
        .map((row) => `<li>${escapeHtml(recipientLine(row))}</li>`)
        .join('')}</ul>`
    : ''

  const letterHtml = letterSamples
    .map(
      (sample) =>
        `<h4 style="color: #333; margin: 20px 0 8px;">${escapeHtml(sample.heading)}</h4><p style="margin: 0 0 10px;"><strong>Teema:</strong> ${escapeHtml(sample.built.subject)}</p><div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff;">${sample.built.html}</div>`
    )
    .join('')

  const letterSectionHtml = letterHtml
    ? `<h3 style="color: #333; margin: 24px 0 8px;">Saadetud kirja tekst</h3>${letterHtml}`
    : ''

  const html = `<div style="font-family: Arial, sans-serif; max-width: 640px;"><h2 style="color: #333; border-bottom: 2px solid #43A047;">Arvustuskutsete cron – kokkuvõte</h2><pre style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${lines.join('\n')}</pre>${recipientHtml}${letterSectionHtml}<p style="font-size: 13px; color: #666;">See kiri saadetakse iga kord, kui cron käivitatakse.</p></div>`

  return { html, text: textParts.join('\n') }
}

/** Saadab keskusele kokkuvõtte iga croni käivitusest. */
async function sendReviewCronSummaryEmail(params: {
  visitsCount: number
  uniqueEmailsCount: number
  sentCount: number
  errorCount: number
  dryRun: boolean
  earlyReason?: string
  errorMessage?: string
  recipients?: ReviewInviteRecipientRow[]
}) {
  const to = process.env.CENTER_EMAIL || process.env.SMTP_USER || 'keskus@papagoi.ee'
  const now = formatInTimeZone(new Date(), 'Europe/Tallinn', 'dd.MM.yyyy HH:mm')
  const subject = params.earlyReason
    ? `[Papagoi] Arvustuskutsete cron – ${params.earlyReason}`
    : `[Papagoi] Arvustuskutsete cron: ${params.sentCount} kirja saadetud`
  const { html, text } = buildReviewCronSummaryContent({ ...params, nowLabel: now })
  try {
    const transporter = createTransporter()
    const fromAddress = process.env.SMTP_USER || 'keskus@papagoi.ee'
    await transporter.sendMail({ from: `"Papagoi Keskus" <${fromAddress}>`, to, subject, html, text })
  } catch (err) {
    console.error('Failed to send cron summary email:', err)
  }
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

  const dryRun = process.env.REVIEW_DRY_RUN === '1'

  console.log('Fetching today visits from Notion...')
  const visits = await getTodayVisitIds(NOTION_API_KEY, NOTION_VISITS_DATABASE_ID)
  // Loogika: tänased külastused → kõik seotud külastajad → kõigile, kellel on täidetud Email-tulp, saadetakse kiri.
  if (!visits.length) {
    console.log('No visits found for today in Notion. Nothing to do.')
    await sendReviewCronSummaryEmail({
      visitsCount: 0,
      uniqueEmailsCount: 0,
      sentCount: 0,
      errorCount: 0,
      dryRun,
      earlyReason: 'Täna külastusi pole (Notion)',
    })
    return
  }

  const visitorsDb = await resolveVisitorsDatabase(NOTION_API_KEY, NOTION_VISITORS_DATABASE_ID)
  if (!visitorsDb) {
    console.error('Could not resolve visitors database metadata.')
    await sendReviewCronSummaryEmail({
      visitsCount: visits.length,
      uniqueEmailsCount: 0,
      sentCount: 0,
      errorCount: 0,
      dryRun,
      earlyReason: 'Külastajate andmebaasi ei õnnestunud laadida',
    })
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
    await sendReviewCronSummaryEmail({
      visitsCount: visits.length,
      uniqueEmailsCount: 0,
      sentCount: 0,
      errorCount: 0,
      dryRun,
      earlyReason: 'Külastajatel pole e-maili (täidetud Email-tulp)',
    })
    return
  }

  console.log(
    `Found ${uniqueByEmail.size} unique email(s) for today.` +
      (dryRun ? ' DRY RUN: will not send emails or update Notion.' : ' Sending review emails...')
  )

  let successCount = 0
  let errorCount = 0
  const recipients: ReviewInviteRecipientRow[] = []

  for (const [email, visitors] of uniqueByEmail.entries()) {
    const first = visitors[0]
    const showDonation = shouldShowReviewDonationLine(first.groupType)
    if (dryRun) {
      recipients.push({
        name: first.name,
        email,
        locale: first.locale,
        groupType: first.groupType,
        showDonation,
      })
      console.log(
        `[DRY RUN] Would send review email to ${email} (name: ${first.name || '—'}, locale: ${
          first.locale
        }, groupType: ${first.groupType || '—'}, visits: ${visitors.length})`
      )
      continue
    }
    try {
      await sendReviewEmail(email, first.name, first.visitDate, {
        locale: first.locale,
        groupType: first.groupType,
      })
      successCount++
      recipients.push({
        name: first.name,
        email,
        locale: first.locale,
        groupType: first.groupType,
        showDonation,
      })
      console.log(`Review email sent to ${email}`)
    } catch (error) {
      errorCount++
      recipients.push({
        name: first.name,
        email,
        locale: first.locale,
        groupType: first.groupType,
        showDonation,
        failed: true,
      })
      console.error(`Failed to send review email to ${email}:`, error)
    }
  }

  console.log(
    `Done. Successfully sent ${successCount} email(s). Failed: ${errorCount}.`
  )

  await sendReviewCronSummaryEmail({
    visitsCount: visits.length,
    uniqueEmailsCount: uniqueByEmail.size,
    sentCount: successCount,
    errorCount,
    dryRun,
    recipients,
  })
}

if (process.env.REVIEW_CLI === '1') {
  runReviewInvitesFromEnv().catch((error) => {
    console.error('Unexpected error in send-review-invites script:', error)
    process.exit(1)
  })
}

