import { NextResponse } from 'next/server'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
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

function extractGuests(property: any) {
  if (!property) return null
  if (property.type === 'number') return property.number ?? null
  if (property.type === 'rollup') {
    if (property.rollup?.type === 'number') return property.rollup?.number ?? null
    return null
  }
  if (property.type === 'rich_text') {
    const value = property.rich_text?.[0]?.plain_text
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (property.type === 'select') {
    const value = property.select?.name
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function extractCount(property: any) {
  if (!property) return 0
  if (property.type === 'number') return property.number ?? 0
  if (property.type === 'rich_text') {
    const value = property.rich_text?.[0]?.plain_text
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (property.type === 'select') {
    const value = property.select?.name
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

async function resolveVisitorsDatabase(
  NOTION_API_KEY: string,
  visitorsDatabaseId: string
) {
  const dbId = visitorsDatabaseId.replace(/-/g, '')
  const response = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!response.ok) return null
  const data = await response.json()
  const properties = data.properties || {}
  const relationPropertyName =
    (properties['Külastused']?.type === 'relation' ? 'Külastused' : null) ||
    Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return properties[key]?.type === 'relation' && normalized.includes('kulastus')
    })
  const countPropertyName =
    (properties['Arv'] ? 'Arv' : null) ||
    Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized === 'arv' || normalized.includes('arv')
    })
  return {
    databaseId: dbId,
    relationPropertyName,
    countPropertyName,
  }
}

async function sumVisitorCountsByPageIds(
  NOTION_API_KEY: string,
  visitorsDb: { countPropertyName?: string } | null,
  pageIds: string[]
) {
  const countPropertyName = visitorsDb?.countPropertyName
  if (!countPropertyName || pageIds.length === 0) return null
  const counts = await Promise.all(
    pageIds.map(async (pageId) => {
      const response = await fetch(`https://api.notion.com/v1/pages/${pageId.replace(/-/g, '')}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      })
      if (!response.ok) return 0
      const page = await response.json()
      const properties = page.properties || {}
      return extractCount(properties[countPropertyName])
    })
  )
  if (!counts.length) return null
  return counts.reduce((sum, value) => sum + value, 0)
}

async function sumVisitorCountsByVisitId(
  NOTION_API_KEY: string,
  visitorsDb: { databaseId: string; relationPropertyName?: string; countPropertyName?: string } | null,
  visitPageId: string
) {
  if (!visitorsDb?.relationPropertyName || !visitorsDb?.countPropertyName) return null
  const response = await fetch(`https://api.notion.com/v1/databases/${visitorsDb.databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        property: visitorsDb.relationPropertyName,
        relation: {
          contains: visitPageId,
        },
      },
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  const pages = data.results || []
  if (!pages.length) return null

  return pages.reduce((sum: number, page: any) => {
    const properties = page.properties || {}
    const value = extractCount(properties[visitorsDb.countPropertyName])
    return sum + value
  }, 0)
}

function findGuestsPropertyName(properties: Record<string, any>) {
  const directMatch = Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return normalized === 'kulalised' || normalized.includes('kulal')
  })
  if (directMatch) return directMatch

  const numberProps = Object.keys(properties).filter((key) => properties[key]?.type === 'number')
  if (numberProps.length === 1) return numberProps[0]

  const selectProps = Object.keys(properties).filter((key) => properties[key]?.type === 'select')
  const numericSelect = selectProps.find((key) => {
    const options = properties[key]?.select?.options || []
    if (!options.length) return false
    return options.every((option: any) => {
      const parsed = Number.parseInt(option?.name, 10)
      return Number.isFinite(parsed)
    })
  })
  if (numericSelect) return numericSelect
  if (selectProps.length === 1) return selectProps[0]
  return null
}

function findGuestsRelationPropertyName(properties: Record<string, any>) {
  return Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return properties[key]?.type === 'relation' && (normalized.includes('kulastaj') || normalized.includes('kulaline'))
  })
}

async function resolveDatabase(NOTION_API_KEY: string, inputId: string) {
  const baseId = inputId.replace(/-/g, '')
  const fetchDatabase = async (databaseId: string) => {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    })
    if (!response.ok) return null
    const data = await response.json()
    return { databaseId, data }
  }

  const direct = await fetchDatabase(baseId)
  if (direct) return direct

  const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${baseId}/children`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
  })

  if (blocksResponse.ok) {
    const blocksData = await blocksResponse.json()
    const databaseBlock = blocksData.results?.find(
      (block: any) => block.type === 'child_database' || block.type === 'database'
    )
    if (databaseBlock?.id) {
      const childDatabaseId = databaseBlock.id.replace(/-/g, '')
      const childDatabase = await fetchDatabase(childDatabaseId)
      if (childDatabase) return childDatabase
    }
  }

  const searchResponse = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        property: 'object',
        value: 'database',
      },
      query: 'Külastused',
    }),
  })

  if (searchResponse.ok) {
    const searchData = await searchResponse.json()
    if (searchData.results && searchData.results.length > 0) {
      const searchDatabaseId = searchData.results[0].id.replace(/-/g, '')
      const searchDatabase = await fetchDatabase(searchDatabaseId)
      if (searchDatabase) return searchDatabase
    }
  }

  return null
}

export async function GET() {
  try {
    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_VISITS_DATABASE_ID = process.env.NOTION_VISITS_DATABASE_ID
    const NOTION_VISITORS_DATABASE_ID =
      process.env.NOTION_VISITORS_DATABASE_ID || '21744b6080df4f26b265aec71051bed7'

    if (!NOTION_API_KEY || !NOTION_VISITS_DATABASE_ID) {
      return NextResponse.json({ bookings: [] })
    }

    const resolved = await resolveDatabase(NOTION_API_KEY, NOTION_VISITS_DATABASE_ID)
    if (!resolved) {
      return NextResponse.json({ bookings: [] })
    }

    const { databaseId, data: dbData } = resolved
    const properties = dbData.properties || {}
    const datePropertyName = Object.keys(properties).find(
      (key) =>
        properties[key]?.type === 'date' &&
        (normalizeKey(key) === 'kuupaev' || normalizeKey(key).includes('kuupaev'))
    )

    if (!datePropertyName) {
      return NextResponse.json({ bookings: [] })
    }

    const timePropertyName = Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized === 'kellaaeg' || normalized === 'aeg' || normalized.includes('kellaaeg')
    })
    const guestsPropertyName = findGuestsPropertyName(properties)
    const guestsRelationPropertyName = findGuestsRelationPropertyName(properties)

    const today = format(new Date(), 'yyyy-MM-dd')
    const queryResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: datePropertyName,
          date: {
            on_or_after: today,
          },
        },
      }),
    })

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text()
      throw new Error(`Notion query viga: ${queryResponse.status} - ${errorText}`)
    }

    const data = await queryResponse.json()
    const visitorsDb = await resolveVisitorsDatabase(NOTION_API_KEY, NOTION_VISITORS_DATABASE_ID)
    const bookings: { date: string; time: string | null; guests: number | null }[] = []
    for (const page of data.results || []) {
      const pageProperties = page.properties || {}
      const dateValue = pageProperties[datePropertyName]?.date?.start || null
      if (!dateValue) continue
      const timeValue = timePropertyName ? extractTime(pageProperties[timePropertyName]) : null
      const derivedTime = dateValue.includes('T') ? format(new Date(dateValue), 'HH:mm') : null
      let guestsValue = guestsPropertyName ? extractGuests(pageProperties[guestsPropertyName]) : null
      if (guestsValue === null && guestsRelationPropertyName) {
        const relation = pageProperties[guestsRelationPropertyName]?.relation || []
        const relationIds = Array.isArray(relation) ? relation.map((item: any) => item.id) : []
        if (relationIds.length > 0) {
          guestsValue = await sumVisitorCountsByPageIds(NOTION_API_KEY, visitorsDb, relationIds)
        } else {
          guestsValue = null
        }
      }
      if (guestsValue === null) {
        guestsValue = await sumVisitorCountsByVisitId(NOTION_API_KEY, visitorsDb, page.id)
      }
      bookings.push({
        date: dateValue,
        time: timeValue || derivedTime,
        guests: guestsValue,
      })
    }

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error('Notion visits error:', error)
    return NextResponse.json({ bookings: [] }, { status: 500 })
  }
}
