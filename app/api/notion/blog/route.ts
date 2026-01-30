import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

function getText(property: any) {
  if (!property) return ''
  if (property.type === 'title') return property.title?.[0]?.plain_text || ''
  if (property.type === 'rich_text') return property.rich_text?.[0]?.plain_text || ''
  return ''
}

function getCover(property: any) {
  if (!property || property.type !== 'files') return ''
  return (
    property.files?.[0]?.file?.url ||
    property.files?.[0]?.external?.url ||
    ''
  )
}

function getSlug(property: any) {
  if (!property) return ''
  if (property.type === 'rich_text') return property.rich_text?.[0]?.plain_text || ''
  if (property.type === 'title') return property.title?.[0]?.plain_text || ''
  return ''
}

function getCategories(property: any) {
  if (!property) return []
  if (property.type === 'select') {
    return property.select?.name ? [property.select.name] : []
  }
  if (property.type === 'multi_select') {
    return property.multi_select?.map((item: any) => item.name) || []
  }
  return []
}

function isPublished(property: any) {
  if (!property || property.type !== 'checkbox') return true
  return Boolean(property.checkbox)
}

export async function GET(request: Request) {
  try {
    const NOTION_API_KEY = process.env.NOTION_API_KEY
    const NOTION_BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug') === '1'

    if (!NOTION_API_KEY || !NOTION_BLOG_DATABASE_ID) {
      return NextResponse.json({ posts: [], debug: debug ? { missingEnv: true } : undefined })
    }

    const databaseId = NOTION_BLOG_DATABASE_ID.replace(/-/g, '')
    const dbResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    })

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text()
      throw new Error(`Notion database viga: ${dbResponse.status} - ${errorText}`)
    }

    const dbData = await dbResponse.json()
    const properties = dbData.properties || {}
    const titlePropertyName = Object.keys(properties).find(
      (key) => properties[key]?.type === 'title'
    )
    const categoryPropertyName = Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized === 'kategooria' || normalized === 'category'
    })
    const animalPropertyName =
      Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized === 'loom'
      }) || 'Loom'
    const datePropertyName = Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return properties[key]?.type === 'date' && (normalized === 'kuupaev' || normalized === 'date')
    })
    const publishedPropertyName =
      Object.keys(properties).find((key) => {
        const normalized = normalizeKey(key)
        return properties[key]?.type === 'checkbox' && normalized === 'avaldatud'
      }) || 'Avaldatud'

    if (!titlePropertyName || !categoryPropertyName) {
      return NextResponse.json({
        posts: [],
        debug: debug
          ? {
              propertyNames: Object.keys(properties),
              titlePropertyName,
              categoryPropertyName,
              animalPropertyName,
            }
          : undefined,
      })
    }

    const animalType = properties[animalPropertyName]?.type
    const publishedType = properties[publishedPropertyName]?.type
    const animalFilter =
      animalType === 'select'
        ? { select: { equals: 'Papagoid' } }
        : animalType === 'multi_select'
          ? { multi_select: { contains: 'Papagoid' } }
          : null
    const canFilterAnimal = Boolean(animalFilter)
    const canFilterPublished = publishedType === 'checkbox'

    const filterPayload =
      canFilterAnimal || canFilterPublished
        ? {
            and: [
              ...(canFilterPublished
                ? [
                    {
                      property: publishedPropertyName,
                      checkbox: { equals: true },
                    },
                  ]
                : []),
              ...(canFilterAnimal
                ? [
                    {
                      property: animalPropertyName,
                      ...animalFilter,
                    },
                  ]
                : []),
            ],
          }
        : null

    const queryResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(filterPayload ? { filter: filterPayload } : {}),
        sorts: datePropertyName
          ? [
              {
                property: datePropertyName,
                direction: 'descending',
              },
            ]
          : [],
      }),
    })

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text()
      throw new Error(`Notion query viga: ${queryResponse.status} - ${errorText}`)
    }

    let data = await queryResponse.json()
    let results = data.results || []
    if (results.length === 0) {
      const fallbackResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 50 }),
      })
      if (fallbackResponse.ok) {
        data = await fallbackResponse.json()
        results = data.results || []
      }
    }

    const posts = results
      .filter((page: any) => {
        const pageProperties = page.properties || {}
        const animalValues = getCategories(pageProperties[animalPropertyName])
        const matchesAnimal = animalValues.includes('Papagoid')
        const isPublic = publishedPropertyName ? isPublished(pageProperties[publishedPropertyName]) : true
        return matchesAnimal && isPublic
      })
      .map((page: any) => {
      const pageProperties = page.properties || {}
      const title = getText(pageProperties[titlePropertyName])
      const excerpt =
        getText(pageProperties['Kokkuvõte']) ||
        getText(pageProperties['Kokkuvotte']) ||
        getText(pageProperties.Excerpt) ||
        getText(pageProperties['Kirjeldus'])
        const cover = getCover(pageProperties['Kaanepilt'])
      const slug =
        getSlug(pageProperties.Slug) ||
        getSlug(pageProperties['Slug']) ||
        getSlug(pageProperties['URL']) ||
        getSlug(pageProperties.Url)
      const categories = getCategories(pageProperties[categoryPropertyName])
      const dateValue = datePropertyName ? pageProperties[datePropertyName]?.date?.start : null

      return {
        id: page.id,
        slug,
        title,
        excerpt,
        cover,
        categories,
        date: dateValue,
        notionUrl: page.url,
      }
    })

    return NextResponse.json({
      posts,
      debug: debug
        ? {
            filteredCount: posts.length,
            propertyNames: Object.keys(properties),
            animalPropertyName,
            publishedPropertyName,
            categoryPropertyName,
          }
        : undefined,
    })
  } catch (error: any) {
    console.error('Notion blog error:', error)
    return NextResponse.json(
      { posts: [], debug: error?.message || 'unknown error' },
      { status: 500 }
    )
  }
}
