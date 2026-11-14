/**
 * GMB → Notion sünk: millal rida PATCH-ida.
 * „Viimati sünkroniseeritud“ üksi ei ole muutus — muidu 793 rida timeoutib.
 */

import { generateReplyType } from '@/lib/google-review-replies'
import { extractOriginalGmbComment, toNotionRichText } from '@/lib/gmb-review-comment'
import { googleReviewIdFromGmbReview, richTextPlainFromProp } from '@/lib/gmb-review-id'
import { GMB_STATUS } from '@/lib/gmb-review-workflow'

export const GMB_REVIEW_SYNC_TIMESTAMP_PROP = 'Viimati sünkroniseeritud'

export type GoogleReviewForSync = {
  reviewId?: string | null
  name?: string | null
  reviewer?: { displayName?: string | null }
  starRating?: string | null
  comment?: string | null
  createTime?: string | null
  updateTime?: string | null
  reviewReply?: {
    comment?: string | null
    updateTime?: string | null
  } | null
}

export function starRatingToNumber(starRating: string | null | undefined): number | null {
  if (!starRating) return null
  switch (starRating.toUpperCase()) {
    case 'ONE':
      return 1
    case 'TWO':
      return 2
    case 'THREE':
      return 3
    case 'FOUR':
      return 4
    case 'FIVE':
      return 5
    default: {
      const asNumber = Number.parseInt(starRating, 10)
      return Number.isFinite(asNumber) ? asNumber : null
    }
  }
}

function dateStartMs(start: unknown): number | null {
  if (typeof start !== 'string' || !start.trim()) return null
  const ms = Date.parse(start)
  return Number.isFinite(ms) ? ms : null
}

function sameDateStart(a: unknown, b: unknown): boolean {
  if (a === b) return true
  const ma = dateStartMs(a)
  const mb = dateStartMs(b)
  if (ma != null && mb != null) return ma === mb
  const sa = typeof a === 'string' ? a.slice(0, 10) : ''
  const sb = typeof b === 'string' ? b.slice(0, 10) : ''
  return Boolean(sa) && sa === sb
}

function selectName(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const name = (prop as { select?: { name?: unknown } }).select?.name
  return typeof name === 'string' ? name : ''
}

function numberValue(prop: unknown): number | null {
  if (!prop || typeof prop !== 'object') return null
  const n = (prop as { number?: unknown }).number
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function checkboxValue(prop: unknown): boolean {
  if (!prop || typeof prop !== 'object') return false
  return (prop as { checkbox?: unknown }).checkbox === true
}

function urlValue(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const url = (prop as { url?: unknown }).url
  return typeof url === 'string' ? url : ''
}

function dateStartValue(prop: unknown): unknown {
  if (!prop || typeof prop !== 'object') return null
  return (prop as { date?: { start?: unknown } }).date?.start ?? null
}

function sameNotionReviewField(existingProp: unknown, nextProp: unknown): boolean {
  if (!nextProp || typeof nextProp !== 'object') return true
  const next = nextProp as Record<string, unknown>
  if ('title' in next || 'rich_text' in next) {
    return richTextPlainFromProp(existingProp) === richTextPlainFromProp(nextProp)
  }
  if ('number' in next) {
    return numberValue(existingProp) === numberValue(nextProp)
  }
  if ('date' in next) {
    return sameDateStart(dateStartValue(existingProp), dateStartValue(nextProp))
  }
  if ('url' in next) {
    return urlValue(existingProp) === urlValue(nextProp)
  }
  if ('select' in next) {
    return selectName(existingProp) === selectName(nextProp)
  }
  if ('checkbox' in next) {
    return checkboxValue(existingProp) === checkboxValue(nextProp)
  }
  return true
}

/** True kui mõni sisuväli erineb. Ajatempel ei loe. */
export function notionReviewSyncNeedsPatch(
  existingProperties: Record<string, unknown> | null | undefined,
  nextProperties: Record<string, unknown>,
): boolean {
  if (!existingProperties) return true
  for (const [key, nextProp] of Object.entries(nextProperties)) {
    if (key === GMB_REVIEW_SYNC_TIMESTAMP_PROP) continue
    if (!sameNotionReviewField(existingProperties[key], nextProp)) return true
  }
  return false
}

export function buildNotionPropertiesFromReview(
  review: GoogleReviewForSync,
  existingProperties: Record<string, any> | null,
  reviewUrl: string,
  nowIso = new Date().toISOString(),
): Record<string, any> {
  const originalComment = extractOriginalGmbComment(review.comment)
  const rating = starRatingToNumber(review.starRating)
  const replyType = generateReplyType(rating)
  const name =
    (review.reviewer?.displayName && review.reviewer.displayName.trim()) || 'Anonüümne'
  const createDate = review.createTime || null
  const replyExists = Boolean(review.reviewReply && review.reviewReply.comment)

  const props: Record<string, any> = {}

  props['Nimi'] = {
    title: [
      {
        type: 'text',
        text: { content: name },
      },
    ],
  }

  if (rating != null) {
    props['Hinne'] = { number: rating }
  }

  if (originalComment) {
    props['Arvustuse tekst'] = {
      rich_text: toNotionRichText(originalComment),
    }
  }

  if (createDate) {
    props['Arvustuse kuupäev'] = {
      date: { start: createDate },
    }
  }

  const reviewId = googleReviewIdFromGmbReview(review)
  if (reviewId) {
    props['Google review ID'] = {
      rich_text: [
        {
          type: 'text',
          text: { content: reviewId },
        },
      ],
    }
  }

  if (reviewUrl) {
    props['Google review URL'] = {
      url: reviewUrl,
    }
  }

  const existingStatus = existingProperties?.['Staatus']?.select?.name as string | undefined
  const alreadyPosted = existingProperties?.['Vastus postitatud?']?.checkbox === true
  const status =
    replyExists || alreadyPosted ? GMB_STATUS.posted : existingStatus || GMB_STATUS.uus
  props['Staatus'] = {
    select: { name: status },
  }

  if (replyType) {
    props['Automaatse vastuse tüüp'] = {
      select: { name: replyType },
    }
  }

  props['Vastus postitatud?'] = {
    checkbox: alreadyPosted || replyExists,
  }

  if (review.reviewReply?.updateTime) {
    props['Vastuse postitamise kuupäev'] = {
      date: { start: review.reviewReply.updateTime },
    }
  }

  props[GMB_REVIEW_SYNC_TIMESTAMP_PROP] = {
    date: { start: nowIso },
  }

  return props
}

export type ReviewSyncPlanItem = {
  review: GoogleReviewForSync
  reviewId: string
  existing: { id: string; properties: Record<string, any> } | null
  properties: Record<string, any>
}

export type ReviewSyncPlan = {
  creates: ReviewSyncPlanItem[]
  patches: ReviewSyncPlanItem[]
  skippedUnchanged: number
  skippedNoId: number
}

export function planReviewSyncActions(
  reviews: GoogleReviewForSync[],
  existingByReviewId: Map<string, { id: string; properties: Record<string, any> }>,
  reviewUrl: string,
  nowIso = new Date().toISOString(),
): ReviewSyncPlan {
  const creates: ReviewSyncPlanItem[] = []
  const patches: ReviewSyncPlanItem[] = []
  let skippedUnchanged = 0
  let skippedNoId = 0

  for (const review of reviews) {
    const reviewId = googleReviewIdFromGmbReview(review)
    if (!reviewId) {
      skippedNoId++
      continue
    }
    const existing = existingByReviewId.get(reviewId) || null
    const properties = buildNotionPropertiesFromReview(
      review,
      existing?.properties || null,
      reviewUrl,
      nowIso,
    )
    const item: ReviewSyncPlanItem = { review, reviewId, existing, properties }
    if (!existing) {
      creates.push(item)
    } else if (notionReviewSyncNeedsPatch(existing.properties, properties)) {
      patches.push(item)
    } else {
      skippedUnchanged++
    }
  }

  return { creates, patches, skippedUnchanged, skippedNoId }
}
