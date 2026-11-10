/**
 * JSON-LD aggregateRating Notioni Google arvustuste andmebaasist.
 * Allikas on sama DB, mida GMB sync täidab (väli Hinne).
 * Ebaõnnestumisel null — vana 5.0 / 801 ei tohi skeemi jääda.
 */

import {
  queryNotionReviewPages,
  type NotionReviewPage,
} from '@/lib/notion-reviews-query'
import type { SchemaAggregateRating } from '@/lib/google-place-details'

export const NOTION_RATING_REVALIDATE_SECONDS = 86400

export const hinneNotEmptyFilter: Record<string, unknown> = {
  property: 'Hinne',
  number: { is_not_empty: true },
}

export function hinneFromNotionProperty(prop: unknown): number | null {
  if (!prop || typeof prop !== 'object') return null
  const n = (prop as { number?: unknown }).number
  if (typeof n !== 'number' || !Number.isFinite(n)) return null
  if (n < 1 || n > 5) return null
  return n
}

export function hinneValuesFromPages(pages: NotionReviewPage[]): number[] {
  const values: number[] = []
  for (const page of pages) {
    const hinne = hinneFromNotionProperty(page.properties?.Hinne)
    if (hinne != null) values.push(hinne)
  }
  return values
}

/** Ainult päris hinded. 0 rida / puuduv keskmine → null. */
export function aggregateRatingFromHinneValues(
  ratings: number[],
): SchemaAggregateRating | null {
  if (!Array.isArray(ratings) || ratings.length === 0) return null
  const sum = ratings.reduce((acc, n) => acc + n, 0)
  const avg = sum / ratings.length
  if (!Number.isFinite(avg) || avg <= 0) return null
  return {
    '@type': 'AggregateRating',
    ratingValue: avg.toFixed(1),
    ratingCount: String(ratings.length),
  }
}

export async function fetchNotionAggregateRating(): Promise<SchemaAggregateRating | null> {
  const apiKey = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_REVIEWS_DATABASE_ID
  if (!apiKey || !databaseId) return null

  try {
    const { pages } = await queryNotionReviewPages({
      apiKey,
      databaseId,
      filter: hinneNotEmptyFilter,
    })
    return aggregateRatingFromHinneValues(hinneValuesFromPages(pages))
  } catch (error) {
    console.error('Notion aggregate rating failed', error)
    return null
  }
}
