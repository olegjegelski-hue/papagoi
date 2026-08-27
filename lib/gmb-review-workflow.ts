import {
  GMB_REVIEW_REPLY_REPLY_TYPES,
  type GmbReviewReplyType,
} from '@/lib/ai/prompts/gmb-review-reply'

export const GMB_STATUS = {
  uus: 'Uus',
  draft: 'Mustand loodud',
  ready: 'Valmis postitamiseks',
  posted: 'Vastus postitatud',
  skip: 'Ei vasta',
  error: 'Viga',
} as const

export type GmbStatus = (typeof GMB_STATUS)[keyof typeof GMB_STATUS]

export const GMB_REPLY_TYPES = GMB_REVIEW_REPLY_REPLY_TYPES
export type GmbReplyType = GmbReviewReplyType

export function isGmbReplyType(value: string | null | undefined): value is GmbReplyType {
  return Boolean(value && (GMB_REPLY_TYPES as readonly string[]).includes(value))
}

export type GmbPostGateInput = {
  status: string | null | undefined
  confirmed: boolean
  replyPosted: boolean
  replyText: string | null | undefined
  reviewId: string | null | undefined
}

/** Range värav: Mustand loodud ei ole kunagi postitatav, isegi kui Kinnitatud on true. */
export function isGmbReplyReadyToPost(
  input: GmbPostGateInput,
): { ok: true } | { ok: false; reason: string } {
  if (input.status === GMB_STATUS.draft) {
    return { ok: false, reason: 'Mustand loodud ei ole inimese kinnitus' }
  }
  if (input.status !== GMB_STATUS.ready) {
    return { ok: false, reason: `staatus peab olema "${GMB_STATUS.ready}" (oli: ${input.status || 'tühi'})` }
  }
  if (!input.confirmed) {
    return { ok: false, reason: 'Kinnitatud puudub' }
  }
  if (input.replyPosted) {
    return { ok: false, reason: 'Vastus postitatud? on juba true' }
  }
  if (!input.replyText?.trim()) {
    return { ok: false, reason: 'Vastus on tühi' }
  }
  if (!input.reviewId?.trim()) {
    return { ok: false, reason: 'Google review ID puudub' }
  }
  return { ok: true }
}
