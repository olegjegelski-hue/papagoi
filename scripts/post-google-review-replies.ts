import 'dotenv/config'

import { getGmbAccessToken } from './sync-google-reviews-to-notion'
import { createTransporter } from '../lib/email'
import { GMB_STATUS, isGmbReplyReadyToPost } from '@/lib/gmb-review-workflow'

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

type NotionPage = {
  id: string
  properties: Record<string, any>
}

async function fetchNotionPagesNeedingReply(): Promise<NotionPage[]> {
  const NOTION_API_KEY = assertEnv('NOTION_API_KEY')
  const rawDbId = assertEnv('NOTION_REVIEWS_DATABASE_ID')
  const databaseId = rawDbId.replace(/-/g, '')

  const results: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, any> = {
      page_size: 100,
      filter: {
        and: [
          {
            property: 'Google review ID',
            rich_text: { is_not_empty: true },
          },
          {
            property: 'Vastus',
            rich_text: { is_not_empty: true },
          },
          {
            property: 'Vastus postitatud?',
            checkbox: { equals: false },
          },
          {
            property: 'Kinnitatud',
            checkbox: { equals: true },
          },
          {
            property: 'Staatus',
            select: { equals: GMB_STATUS.ready },
          },
        ],
      },
    }

    if (startCursor) {
      body.start_cursor = startCursor
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to query Notion reviews needing reply: ${response.status} - ${text}`)
    }

    const data = await response.json()
    const pageResults: any[] = data.results || []
    for (const page of pageResults) {
      results.push({ id: page.id, properties: page.properties || {} })
    }

    startCursor = data.has_more ? data.next_cursor : undefined
  } while (startCursor)

  return results
}

function getRichTextPlainText(prop: any): string | null {
  const rich = prop?.rich_text
  if (!Array.isArray(rich) || rich.length === 0) return null
  const text = rich.map((t: { plain_text?: string; text?: { content?: string } }) => t?.plain_text ?? t?.text?.content ?? '').join('')
  return text && String(text).trim().length > 0 ? String(text).trim() : null
}

/** Ainult Staatus → Viga. Vastus postitatud? ja kuupäev jäävad puutumata. */
async function markPostError(apiKey: string, pageId: string, reason: string) {
  console.error(`Marking Notion page ${pageId} as ${GMB_STATUS.error}: ${reason}`)
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        Staatus: { select: { name: GMB_STATUS.error } },
      },
    }),
  })
  if (!response.ok) {
    const text = await response.text()
    console.error(`Failed to mark ${GMB_STATUS.error} on ${pageId}: ${response.status} - ${text}`)
  }
}

export async function postRepliesToGoogle() {
  // Ainult Kinnitatud + Staatus „Valmis postitamiseks“. Mustandit ega Uus ridu ei postita.
  const NOTION_API_KEY = assertEnv('NOTION_API_KEY')
  const pages = await fetchNotionPagesNeedingReply()

  if (!pages.length) {
    console.log('No Notion review pages pending reply.')
    return
  }

  console.log(`Found ${pages.length} Notion review pages with confirmed replies to post...`)

  const accountId = assertEnv('GOOGLE_MY_BUSINESS_ACCOUNT_ID')
  const locationId = assertEnv('GOOGLE_MY_BUSINESS_LOCATION_ID')
  const accessToken = await getGmbAccessToken()

  let success = 0
  let failed = 0

  for (const page of pages) {
    const props = page.properties

    const reviewIdProp = props['Google review ID']
    const replyTextProp = props['Vastus']

    const reviewId = getRichTextPlainText(reviewIdProp)
    const replyText = getRichTextPlainText(replyTextProp)
    const status = props['Staatus']?.select?.name || null
    const gate = isGmbReplyReadyToPost({
      status,
      confirmed: props['Kinnitatud']?.checkbox === true,
      replyPosted: props['Vastus postitatud?']?.checkbox === true,
      replyText,
      reviewId,
    })

    if (!gate.ok) {
      console.log(`Skipping page ${page.id}: ${gate.reason}`)
      continue
    }

    const name = `accounts/${accountId}/locations/${locationId}/reviews/${reviewId}`
    const url = `https://mybusiness.googleapis.com/v4/${encodeURI(name)}/reply`

    const gmbResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: replyText }),
    })

    if (!gmbResponse.ok) {
      const text = await gmbResponse.text()
      const reason = `${gmbResponse.status}: ${text}`
      console.error(
        `Failed to post reply to Google page=${page.id} reviewId=${reviewId}: ${reason}`,
      )
      failed++
      await markPostError(NOTION_API_KEY, page.id, reason)
      continue
    }

    const nowIso = new Date().toISOString()

    const notionResponse = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          'Vastus postitatud?': {
            checkbox: true,
          },
          Staatus: {
            select: { name: GMB_STATUS.posted },
          },
          'Vastuse postitamise kuupäev': {
            date: { start: nowIso },
          },
        },
      }),
    })

    if (!notionResponse.ok) {
      const text = await notionResponse.text()
      console.error(
        `Reply posted to Google but failed to update Notion page ${page.id}: ${notionResponse.status} - ${text}`,
      )
      failed++
      continue
    }

    success++
  }

  console.log(
    `Done posting replies to Google. Success: ${success}, Failed: ${failed}, Total considered: ${pages.length}`,
  )

  // Saada kokkuvõte emailiga keskusele
  if (pages.length > 0) {
    try {
      const transporter = createTransporter()
      const to = process.env.CENTER_EMAIL || 'keskus@papagoi.ee'
      const fromAddress = process.env.SMTP_USER || 'keskus@papagoi.ee'
      const subject = 'Google arvustuste vastused – päevakokkuvõte'

      const now = new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })

      const text = [
        'Google arvustuste vastuste kokkuvõte',
        '',
        `Kuupäev ja kellaaeg (Tallinn): ${now}`,
        '',
        `Kokku kontrollitud: ${pages.length}`,
        `Õnnestus postitada: ${success}`,
        `Ebaõnnestus: ${failed}`,
      ].join('\n')

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
            Google arvustuste vastuste kokkuvõte
          </h2>
          <p>Kuupäev ja kellaaeg (Tallinn): <strong>${now}</strong></p>
          <ul style="line-height: 1.6;">
            <li><strong>Kokku kontrollitud:</strong> ${pages.length}</li>
            <li><strong>Õnnestus postitada:</strong> ${success}</li>
            <li><strong>Ebaõnnestus:</strong> ${failed}</li>
          </ul>
        </div>
      `

      await transporter.sendMail({
        from: `"Papagoi Keskus – Google vastused" <${fromAddress}>`,
        to,
        subject,
        text,
        html,
      })

      console.log(`Replies summary email sent to ${to}`)
    } catch (error) {
      console.error('Failed to send replies summary email:', error)
    }
  }
}

if (require.main === module) {
  postRepliesToGoogle().catch((error) => {
    console.error('Post replies failed:', error)
    process.exit(1)
  })
}

