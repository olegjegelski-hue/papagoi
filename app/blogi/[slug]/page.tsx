import { Metadata } from 'next'
import Link from 'next/link'

type NotionText = { plain_text: string }
type NotionBlock = {
  id: string
  type: string
  [key: string]: any
}

type BlogPost = {
  id: string
  title: string
  cover?: string
  date?: string | null
  excerpt?: string
  category?: string[]
  content?: string
}

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
  return property.files?.[0]?.file?.url || property.files?.[0]?.external?.url || ''
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

function getContent(property: any) {
  if (!property) return ''
  if (property.type === 'rich_text') {
    return property.rich_text?.map((item: any) => item.plain_text).join('') || ''
  }
  return ''
}

function isPublished(property: any) {
  if (!property || property.type !== 'checkbox') return true
  return Boolean(property.checkbox)
}

async function fetchBlocks(notionId: string, apiKey: string) {
  const blocks: NotionBlock[] = []
  let cursor: string | undefined
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${notionId}/children`)
    if (cursor) url.searchParams.set('start_cursor', cursor)
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
      },
    })
    if (!response.ok) break
    const data = await response.json()
    blocks.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)
  return blocks
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const apiKey = process.env.NOTION_API_KEY
  const dbId = process.env.NOTION_BLOG_DATABASE_ID
  if (!apiKey || !dbId) return null

  const databaseId = dbId.replace(/-/g, '')
  const dbResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  if (!dbResponse.ok) return null
  const dbData = await dbResponse.json()
  const properties = dbData.properties || {}
  const titlePropertyName = Object.keys(properties).find(
    (key) => properties[key]?.type === 'title'
  )
  const slugPropertyName = Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return normalized === 'slug'
  })
  const categoryPropertyName = Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return normalized === 'kategooria' || normalized === 'category'
  })
  const animalPropertyName = Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return normalized === 'loom'
  })
  const datePropertyName = Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return properties[key]?.type === 'date' && (normalized === 'kuupaev' || normalized === 'date')
  })
  const publishedPropertyName = Object.keys(properties).find((key) => {
    const normalized = normalizeKey(key)
    return properties[key]?.type === 'checkbox' && normalized === 'avaldatud'
  })

  if (!titlePropertyName) return null

  const isNotionId = /^[0-9a-f]{32}$|^[0-9a-f-]{36}$/i.test(slug)
  if (isNotionId) {
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${slug.replace(/-/g, '')}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
      },
    })
    if (!pageResponse.ok) return null
    const page = await pageResponse.json()
    const pageProps = page.properties || {}
    if (publishedPropertyName && !isPublished(pageProps[publishedPropertyName])) return null
    if (animalPropertyName) {
      const animals = getCategories(pageProps[animalPropertyName])
      if (!animals.includes('Papagoid')) return null
    }

    return {
      id: page.id,
      title: getText(pageProps[titlePropertyName]),
      cover: getCover(pageProps['Kaanepilt']),
      date: datePropertyName ? pageProps[datePropertyName]?.date?.start : null,
      excerpt:
        getText(pageProps['Kokkuvõte']) ||
        getText(pageProps['Kokkuvotte']) ||
        getText(pageProps.Excerpt) ||
        getText(pageProps['Kirjeldus']),
      category: categoryPropertyName ? getCategories(pageProps[categoryPropertyName]) : [],
    }
  }

  if (!slugPropertyName) return null
  const slugFilter = {
    property: slugPropertyName,
    rich_text: { equals: slug },
  }
  const animalType = animalPropertyName ? properties[animalPropertyName]?.type : null
  const animalFilter =
    animalPropertyName && animalType === 'select'
      ? {
          property: animalPropertyName,
          select: { equals: 'Papagoid' },
        }
      : animalPropertyName && animalType === 'multi_select'
        ? {
            property: animalPropertyName,
            multi_select: { contains: 'Papagoid' },
          }
        : null
  const publishedFilter = publishedPropertyName
    ? {
        property: publishedPropertyName,
        checkbox: { equals: true },
      }
    : null

  const queryResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        and: [
          slugFilter,
          ...(publishedFilter ? [publishedFilter] : []),
          ...(animalFilter ? [animalFilter] : []),
        ],
      },
      page_size: 1,
    }),
  })
  if (!queryResponse.ok) return null
  const data = await queryResponse.json()
  const page = data.results?.[0]
  if (!page) return null
  const pageProps = page.properties || {}
  if (publishedPropertyName && !isPublished(pageProps[publishedPropertyName])) return null
  if (animalPropertyName) {
    const animals = getCategories(pageProps[animalPropertyName])
    if (!animals.includes('Papagoid')) return null
  }
  const content = getContent(pageProps['Sisu'])

  return {
    id: page.id,
    title: getText(pageProps[titlePropertyName]),
    cover: getCover(pageProps['Kaanepilt']),
    date: datePropertyName ? pageProps[datePropertyName]?.date?.start : null,
    excerpt:
      getText(pageProps['Kokkuvõte']) ||
      getText(pageProps['Kokkuvotte']) ||
      getText(pageProps.Excerpt) ||
      getText(pageProps['Kirjeldus']),
    category: categoryPropertyName ? getCategories(pageProps[categoryPropertyName]) : [],
    content,
  }
}

function renderRichText(text: NotionText[]) {
  return text.map((item, index) => <span key={index}>{item.plain_text}</span>)
}

function renderBlocks(blocks: NotionBlock[]) {
  return blocks.map((block) => {
    switch (block.type) {
      case 'paragraph': {
        const text = block.paragraph?.rich_text || []
        if (!text.length) return null
        return <p key={block.id} className="text-gray-700 leading-relaxed mb-4">{renderRichText(text)}</p>
      }
      case 'heading_1': {
        return <h2 key={block.id} className="text-3xl font-bold text-gray-900 mt-8 mb-4">{renderRichText(block.heading_1?.rich_text || [])}</h2>
      }
      case 'heading_2': {
        return <h3 key={block.id} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{renderRichText(block.heading_2?.rich_text || [])}</h3>
      }
      case 'heading_3': {
        return <h4 key={block.id} className="text-xl font-bold text-gray-900 mt-5 mb-3">{renderRichText(block.heading_3?.rich_text || [])}</h4>
      }
      case 'bulleted_list_item': {
        return (
          <ul key={block.id} className="list-disc pl-6 mb-3 text-gray-700">
            <li>{renderRichText(block.bulleted_list_item?.rich_text || [])}</li>
          </ul>
        )
      }
      case 'numbered_list_item': {
        return (
          <ol key={block.id} className="list-decimal pl-6 mb-3 text-gray-700">
            <li>{renderRichText(block.numbered_list_item?.rich_text || [])}</li>
          </ol>
        )
      }
      case 'quote': {
        return (
          <blockquote key={block.id} className="border-l-4 border-papagoi-green pl-4 italic text-gray-600 my-4">
            {renderRichText(block.quote?.rich_text || [])}
          </blockquote>
        )
      }
      case 'image': {
        const url = block.image?.file?.url || block.image?.external?.url
        if (!url) return null
        const caption = block.image?.caption?.[0]?.plain_text
        return (
          <figure key={block.id} className="my-6">
            <img src={url} alt={caption || 'Blogi pilt'} className="w-full rounded-2xl" />
            {caption && <figcaption className="text-sm text-gray-500 mt-2">{caption}</figcaption>}
          </figure>
        )
      }
      case 'divider':
        return <hr key={block.id} className="my-8 border-gray-200" />
      default:
        return null
    }
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) {
    return {
      title: 'Blogi | Papagoi Keskus',
    }
  }
  return {
    title: `${post.title} | Papagoi Keskus`,
    description: post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Postitust ei leitud</h1>
          <p className="text-gray-600 mt-4">See postitus ei ole avaldatud või seda ei ole olemas.</p>
        </div>
      </div>
    )
  }

  const apiKey = process.env.NOTION_API_KEY
  const blocks = apiKey ? await fetchBlocks(post.id.replace(/-/g, ''), apiKey) : []
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString('et-EE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Link href="/blogi" className="text-sm font-semibold text-papagoi-blue hover:underline">
            ← Tagasi blogi lehele
          </Link>
        </div>
        <article className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/60">
          {post.cover && (
            <div className="h-80 w-full overflow-hidden">
              <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {(post.category || []).map((category) => (
                <span
                  key={category}
                  className="bg-papagoi-green/10 text-papagoi-green text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
              {formattedDate && <span className="text-xs text-gray-500">{formattedDate}</span>}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            {post.excerpt && (
              <p className="text-base text-gray-500 italic border-l-4 border-papagoi-green pl-4 mb-8">
                {post.excerpt}
              </p>
            )}
            <div className="prose max-w-none">
              {post.content
                ? post.content.split('\n').filter(Boolean).map((paragraph, index) => (
                    <p key={`${post.id}-p-${index}`} className="text-lg text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                : renderBlocks(blocks)}
            </div>
            <div className="mt-10">
              <Link href="/blogi" className="text-sm font-semibold text-papagoi-blue hover:underline">
                ← Tagasi blogi lehele
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
