/**
 * GMB → Notion sünk: millal rida PATCH-ida.
 * „Viimati sünkroniseeritud“ üksi ei ole muutus — muidu ~800 rida timeoutib.
 * Kuupäevad/rich-text peavad klappima Notioni GET-kujuga, muidu iga käivitus
 * loeb kõik read muutunuks.
 */

import { generateReplyType } from '@/lib/google-review-replies'
import { extractOriginalGmbComment, toNotionRichText } from '@/lib/gmb-review-comment'
import { googleReviewIdFromGmbReview, richTextPlainFromProp } from '@/lib/gmb-review-id'
import { GMB_STATUS } from '@/lib/gmb-review-workflow'

export const GMB_REVIEW_SYNC_TIMESTAMP_PROP = 'Viimati sünkroniseeritud'
export const GMB_REVIEW_SYNC_PATCH_LIMIT = 150
export const GMB_REVIEW_SYNC_PATCH_DIFF_LOG_LIMIT = 5

const PATCH_PRIORITY_FIELDS = new Set([
  'Staatus',
  'Vastus postitatud?',
  'Vastuse postitamise kuupäev',
  'Hinne',
])

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

export type NotionReviewFieldDiff = {
  name: string
  type: string
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

function isDateOnlyStart(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function asDateStartString(start: unknown): string {
  if (typeof start !== 'string') return ''
  return start.trim()
}

/**
 * Google: 2026-11-01T10:00:00.123Z
 * Notion datetime: 2026-11-01T10:00:00.000+00:00
 * Notion date-only: 2026-11-01
 */
function sameDateStart(a: unknown, b: unknown): boolean {
  if (a === b) return true
  const sa = asDateStartString(a)
  const sb = asDateStartString(b)
  if (!sa && !sb) return true
  if (!sa || !sb) return false
  if (isDateOnlyStart(sa) || isDateOnlyStart(sb)) {
    return sa.slice(0, 10) === sb.slice(0, 10)
  }
  const ma = Date.parse(sa)
  const mb = Date.parse(sb)
  if (Number.isFinite(ma) && Number.isFinite(mb)) {
    return Math.floor(ma / 1000) === Math.floor(mb / 1000)
  }
  return sa.slice(0, 10) === sb.slice(0, 10)
}

function selectName(prop: unknown): string {
  if (!prop || typeof prop !== 'object') return ''
  const name = (prop as { select?: { name?: unknown } | null }).select?.name
  return typeof name === 'string' ? name.trim() : ''
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
  return typeof url === 'string' ? url.trim() : ''
}

function dateStartValue(prop: unknown): unknown {
  if (!prop || typeof prop !== 'object') return null
  const date = (prop as { date?: { start?: unknown } | null }).date
  if (!date || typeof date !== 'object') return null
  return date.start ?? null
}

function comparablePlainText(prop: unknown): string {
  return richTextPlainFromProp(prop)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim()
}

function notionWriteFieldType(nextProp: unknown): string {
  if (!nextProp || typeof nextProp !== 'object') return 'unknown'
  const next = nextProp as Record<string, unknown>
  if ('title' in next) return 'title'
  if ('rich_text' in next) return 'rich_text'
  if ('number' in next) return 'number'
  if ('date' in next) return 'date'
  if ('url' in next) return 'url'
  if ('select' in next) return 'select'
  if ('checkbox' in next) return 'checkbox'
  return 'unknown'
}

function sameNotionReviewField(existingProp: unknown, nextProp: unknown): boolean {
  if (!nextProp || typeof nextProp !== 'object') return true
  const next = nextProp as Record<string, unknown>
  if ('title' in next || 'rich_text' in next) {
    return comparablePlainText(existingProp) === comparablePlainText(nextProp)
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

/** Erinenud väljad: ainult nimi + tüüp, mitte väärtused ega tekst. */
export function notionReviewSyncFieldDiffs(
  existingProperties: Record<string, unknown> | null | undefined,
  nextProperties: Record<string, unknown>,
): NotionReviewFieldDiff[] {
  const diffs: NotionReviewFieldDiff[] = []
  for (const [key, nextProp] of Object.entries(nextProperties)) {
    if (key === GMB_REVIEW_SYNC_TIMESTAMP_PROP) continue
    if (sameNotionReviewField(existingProperties?.[key], nextProp)) continue
    diffs.push({ name: key, type: notionWriteFieldType(nextProp) })
  }
  return diffs
}

/** True kui mõni sisuväli erineb. Ajatempel ei loe. */
export function notionReviewSyncNeedsPatch(
  existingProperties: Record<string, unknown> | null | undefined,
  nextProperties: Record<string, unknown>,
): boolean {
  if (!existingProperties) return true
  return notionReviewSyncFieldDiffs(existingProperties, nextProperties).length > 0
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

function isPriorityPatch(item: ReviewSyncPlanItem): boolean {
  const diffs = notionReviewSyncFieldDiffs(item.existing?.properties, item.properties)
  return diffs.some((diff) => PATCH_PRIORITY_FIELDS.has(diff.name))
}

/** Staatus / vastus / hinne ees, ülejäänud stabiilses järjekorras. */
export function sortReviewSyncPatches(patches: ReviewSyncPlanItem[]): ReviewSyncPlanItem[] {
  return patches
    .map((item, index) => ({ item, index, rank: isPriorityPatch(item) ? 0 : 1 }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.item)
}

export function applyReviewSyncPatchLimit(
  patches: ReviewSyncPlanItem[],
  limit = GMB_REVIEW_SYNC_PATCH_LIMIT,
): { patches: ReviewSyncPlanItem[]; deferredPatches: number } {
  const safeLimit =
    Number.isFinite(limit) && limit >= 0 ? Math.floor(limit) : GMB_REVIEW_SYNC_PATCH_LIMIT
  return {
    patches: patches.slice(0, safeLimit),
    deferredPatches: Math.max(0, patches.length - safeLimit),
  }
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

  return {
    creates,
    patches: sortReviewSyncPatches(patches),
    skippedUnchanged,
    skippedNoId,
  }
}
