import { unstable_cache } from 'next/cache'
import { buildSiteJsonLdGraph } from '@/lib/json-ld'
import {
  fetchNotionAggregateRating,
  NOTION_RATING_REVALIDATE_SECONDS,
} from '@/lib/notion-aggregate-rating'
import { getSiteUrl } from '@/lib/seo'

const getCachedNotionAggregateRating = unstable_cache(
  fetchNotionAggregateRating,
  ['notion-aggregate-rating'],
  { revalidate: NOTION_RATING_REVALIDATE_SECONDS },
)

export default async function JsonLdSchema() {
  const aggregateRating = await getCachedNotionAggregateRating()
  const schema = buildSiteJsonLdGraph(getSiteUrl(), aggregateRating)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
