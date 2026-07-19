/** Lightweight Notion blog slug list for sitemap (no cover/full-page fetches). */

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '')
}

function getSlug(property: { type?: string; rich_text?: { plain_text?: string }[]; title?: { plain_text?: string }[] } | undefined) {
  if (!property) return ''
  if (property.type === 'rich_text') return property.rich_text?.[0]?.plain_text || ''
  if (property.type === 'title') return property.title?.[0]?.plain_text || ''
  return ''
}

function getCategories(property: { type?: string; select?: { name?: string }; multi_select?: { name: string }[] } | undefined) {
  if (!property) return [] as string[]
  if (property.type === 'select') {
    return property.select?.name ? [property.select.name] : []
  }
  if (property.type === 'multi_select') {
    return property.multi_select?.map((item) => item.name) || []
  }
  return []
}

function isPublished(property: { type?: string; checkbox?: boolean } | undefined) {
  if (!property || property.type !== 'checkbox') return true
  return Boolean(property.checkbox)
}

export type BlogSitemapEntry = {
  slug: string
  lastModified?: Date
}

export async function getPublishedBlogSlugsForSitemap(): Promise<BlogSitemapEntry[]> {
  const apiKey = process.env.NOTION_API_KEY
  const databaseIdRaw = process.env.NOTION_BLOG_DATABASE_ID
  if (!apiKey || !databaseIdRaw) return []

  const databaseId = databaseIdRaw.replace(/-/g, '')
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  }

  try {
    const dbResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers,
      next: { revalidate: 3600 },
    })
    if (!dbResponse.ok) {
      console.error('sitemap blog: Notion database error', dbResponse.status)
      return []
    }

    const dbData = await dbResponse.json()
    const properties = dbData.properties || {}

    const animalPropertyName =
      Object.keys(properties).find((key) => normalizeKey(key) === 'loom') || 'Loom'
    const publishedPropertyName =
      Object.keys(properties).find((key) => {
        const normalized = normalizeKey(key)
        return properties[key]?.type === 'checkbox' && normalized === 'avaldatud'
      }) || 'Avaldatud'
    const slugPropertyName = Object.keys(properties).find((key) => {
      const normalized = normalizeKey(key)
      return normalized === 'slug' || normalized === 'url'
    })

    const animalType = properties[animalPropertyName]?.type
    const publishedType = properties[publishedPropertyName]?.type
    const animalFilter =
      animalType === 'select'
        ? { select: { equals: 'Papagoid' } }
        : animalType === 'multi_select'
          ? { multi_select: { contains: 'Papagoid' } }
          : null

    const filterPayload =
      animalFilter || publishedType === 'checkbox'
        ? {
            and: [
              ...(publishedType === 'checkbox'
                ? [{ property: publishedPropertyName, checkbox: { equals: true } }]
                : []),
              ...(animalFilter ? [{ property: animalPropertyName, ...animalFilter }] : []),
            ],
          }
        : null

    const results: { id: string; properties?: Record<string, unknown>; last_edited_time?: string }[] = []
    let cursor: string | undefined
    do {
      const queryResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...(filterPayload ? { filter: filterPayload } : {}),
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
        next: { revalidate: 3600 },
      })
      if (!queryResponse.ok) {
        console.error('sitemap blog: Notion query error', queryResponse.status)
        break
      }
      const data = await queryResponse.json()
      results.push(...(data.results || []))
      cursor = data.has_more ? data.next_cursor : undefined
    } while (cursor)

    const entries: BlogSitemapEntry[] = []
    const seen = new Set<string>()

    for (const page of results) {
      const pageProperties = (page.properties || {}) as Record<string, any>
      const animalValues = getCategories(pageProperties[animalPropertyName])
      const matchesAnimal = animalValues.includes('Papagoid')
      const publicOk = publishedPropertyName
        ? isPublished(pageProperties[publishedPropertyName])
        : true
      if (!matchesAnimal || !publicOk) continue

      let slug = ''
      if (slugPropertyName) {
        slug = getSlug(pageProperties[slugPropertyName])
      }
      if (!slug) {
        slug =
          getSlug(pageProperties.Slug) ||
          getSlug(pageProperties['Slug']) ||
          getSlug(pageProperties['URL']) ||
          getSlug(pageProperties.Url)
      }
      if (!slug || seen.has(slug)) continue
      seen.add(slug)

      entries.push({
        slug,
        lastModified: page.last_edited_time ? new Date(page.last_edited_time) : undefined,
      })
    }

    return entries
  } catch (error) {
    console.error('sitemap blog: unexpected error', error)
    return []
  }
}
