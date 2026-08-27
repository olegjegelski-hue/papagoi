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

export const GMB_REWRITE_DEFAULT_STATUSES: readonly GmbStatus[] = [GMB_STATUS.uus]

/** Vanade postitamata vastuste AI rewrite. Default: ainult Staatus=Uus. Mustand loodud ainult targeted + force. */
export function isGmbReplySafeToRewrite(
  input: GmbPostGateInput,
  options?: { allowExistingDraft?: boolean },
): { ok: true } | { ok: false; reason: string } {
  if (!input.reviewId?.trim()) {
    return { ok: false, reason: 'Google review ID puudub' }
  }
  if (!input.replyText?.trim()) {
    return { ok: false, reason: 'Vastus on tühi' }
  }
  if (input.replyPosted) {
    return { ok: false, reason: 'Vastus postitatud? on true' }
  }
  if (input.confirmed) {
    return { ok: false, reason: 'Kinnitatud on true' }
  }
  if (input.status === GMB_STATUS.posted) {
    return { ok: false, reason: `staatus on "${GMB_STATUS.posted}"` }
  }
  if (input.status === GMB_STATUS.ready) {
    return { ok: false, reason: `staatus on "${GMB_STATUS.ready}"` }
  }
  if (input.status === GMB_STATUS.skip) {
    return { ok: false, reason: `staatus on "${GMB_STATUS.skip}"` }
  }
  if (input.status === GMB_STATUS.draft) {
    if (!options?.allowExistingDraft) {
      return {
        ok: false,
        reason: `"${GMB_STATUS.draft}" ootab ülevaatust; uuesti ainult targeted + force=1`,
      }
    }
    return { ok: true }
  }
  if (input.status !== GMB_STATUS.uus) {
    return { ok: false, reason: `staatus pole rewrite'iks lubatud (oli: ${input.status || 'tühi'})` }
  }
  return { ok: true }
}
