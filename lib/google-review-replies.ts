import type { VisitMailLocale } from '@/lib/visit-language'
import { extractOriginalGmbComment } from '@/lib/gmb-review-comment'

/**
 * Automaatvastus ainult arvustustele, mis on loodud selle kuupäeva
 * (Europe/Tallinn) hommikust alates. Vanu 670 kirjet cron ei täida.
 * Vercelis saab üle kirjutada: GMB_AUTO_REPLY_SINCE=YYYY-MM-DD
 */
export const DEFAULT_GMB_AUTO_REPLY_SINCE = '2026-08-27'

export function autoReplySinceDate(): string {
  const raw = process.env.GMB_AUTO_REPLY_SINCE?.trim()
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  return DEFAULT_GMB_AUTO_REPLY_SINCE
}

function ymdInTallinn(iso: string): string | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-CA', { timeZone: 'Europe/Tallinn' })
}

export function isOnOrAfterAutoReplySince(createdAtIso: string | null | undefined): boolean {
  if (!createdAtIso) return false
  const ymd = ymdInTallinn(createdAtIso)
  if (!ymd) return false
  return ymd >= autoReplySinceDate()
}

export function replyFirstName(displayName: string | null | undefined): string | null {
  const raw = (displayName || '').trim()
  if (!raw || /^anon/i.test(raw) || raw === 'Anonüümne') return null
  const first = raw.split(/\s+/)[0]
  return first || null
}

export function detectReviewLocale(comment: string | null | undefined): VisitMailLocale {
  const text = (extractOriginalGmbComment(comment) || '').trim()
  if (!text) return 'et'
  if (/[а-яё]/i.test(text)) return 'ru'
  if (/[äöüõšž]/i.test(text)) return 'et'
  const lower = text.toLowerCase()
  if (/\b(väga|aitäh|papagoi|lapsed|koht|meeldis|tore|käisime|peremees|armas)\b/.test(lower)) {
    return 'et'
  }
  if (/\b(the|and|was|with|very|place|parrot|kids|loved|great|nice|owner)\b/.test(lower)) {
    return 'en'
  }
  return 'et'
}

function pickVariant(variants: string[], seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return variants[h % variants.length]
}

function fillName(template: string, name: string | null): string {
  if (name) return template.split('{Nimi}').join(name)
  return template
    .replace(/\{Nimi\}, /g, '')
    .replace(/, \{Nimi\}/g, '')
    .replace(/\{Nimi\}! /g, '')
    .replace(/\{Nimi\}!/g, '')
    .replace(/\{Nimi\}/g, '')
    .replace(/  +/g, ' ')
    .replace(/^,\s*/g, '')
    .trim()
}

/** 5 lühikest, Olegi häälega. Rotatsioon reviewId järgi, et re-sync ei vahetaks teksti. */
export const REPLY_VARIANTS_5: Record<VisitMailLocale, string[]> = {
  et: [
    'Aitäh, {Nimi}! Väga tore, et papagoid teile meeldisid. Tulge jälle!',
    '{Nimi}, aitäh! Selline sõna teeb tuju heaks. Papagoid ootavad teid tagasi.',
    'Aitäh, et tulite, {Nimi}! Mul on hea meel, et külastus korda läks.',
    'Aitäh, {Nimi}! Tore kuulda, et teil oli hea aeg. Kohtumiseni!',
    '{Nimi}, aitäh sooja sõna eest! Tulge, kui jälle papagoide tuju tahate.',
  ],
  en: [
    'Thanks, {Nimi}! So glad the parrots made you happy. Come again!',
    '{Nimi}, thank you — that really made my day. The birds will be happy to see you again.',
    'Thanks for coming, {Nimi}! Glad you had a good time.',
    'Thank you, {Nimi}! You\'re always welcome back.',
    '{Nimi}, thanks for the kind words. Come say hi to the parrots again anytime.',
  ],
  ru: [
    'Спасибо, {Nimi}! Очень рад, что попугаи вам понравились. Приходите ещё!',
    '{Nimi}, спасибо — такие слова поднимают настроение. Попугаи будут рады вас снова увидеть.',
    'Спасибо, что пришли, {Nimi}! Рад, что визит удался.',
    'Спасибо, {Nimi}! Буду рад вас снова видеть.',
    '{Nimi}, спасибо за тёплые слова! Заходите ещё.',
  ],
}

export const REPLY_VARIANTS_4: Record<VisitMailLocale, string[]> = {
  et: [
    'Aitäh, {Nimi}! Tore, et käisite. Kui midagi saaks paremini, kirjutage julgelt keskus@papagoi.ee.',
    'Aitäh, {Nimi}! Hea meel, et külastus meeldis. Kui jääb mõni mõte, kuidas veel paremaks, andke teada.',
    '{Nimi}, aitäh tagasiside eest! Kui midagi jäi kripeldama, kirjutage mulle keskus@papagoi.ee.',
    'Aitäh, et tulite, {Nimi}! Kui saan järgmine kord midagi paremini teha, öelge palun otse.',
    'Aitäh, {Nimi}! Tore, et olite. Mõte, kuidas kogemust viie tärnini viia, on mulle oluline — keskus@papagoi.ee.',
  ],
  en: [
    'Thanks, {Nimi}! Glad you came. If anything could have been better, write me at keskus@papagoi.ee.',
    'Thank you, {Nimi}! Nice to hear the visit went well. If you have a thought on how to make it even better, I\'d like to know.',
    '{Nimi}, thanks for the review. If something didn\'t quite land, drop me a line at keskus@papagoi.ee.',
    'Thanks for coming, {Nimi}! If I can do something better next time, please tell me straight.',
    'Thank you, {Nimi}! I\'d genuinely like to know what would take the visit to five stars — keskus@papagoi.ee.',
  ],
  ru: [
    'Спасибо, {Nimi}! Рад, что вы пришли. Если что-то можно сделать лучше — напишите keskus@papagoi.ee.',
    'Спасибо, {Nimi}! Приятно, что визит понравился. Если есть мысль, как сделать ещё лучше, буду рад услышать.',
    '{Nimi}, спасибо за отзыв! Если что-то зацепило не так, напишите мне на keskus@papagoi.ee.',
    'Спасибо, что пришли, {Nimi}! Если в следующий раз могу сделать что-то лучше, скажите прямо.',
    'Спасибо, {Nimi}! Мне важно знать, что помогло бы довести визит до пяти звёзд — keskus@papagoi.ee.',
  ],
}

export type AutoReplyInput = {
  reviewId?: string | null
  displayName?: string | null
  rating: number | null
  comment?: string | null
  createTime?: string | null
}

/** Sama värav synci mallil ja generate'il: tärn-ainult / tühi tekst ei lähe vastusesse. */
export function hasReviewTextForReply(comment: string | null | undefined): boolean {
  return Boolean(extractOriginalGmbComment(comment)?.trim())
}

export function isEligibleForAutoReply(input: AutoReplyInput): boolean {
  if (input.rating !== 4 && input.rating !== 5) return false
  if (!isOnOrAfterAutoReplySince(input.createTime)) return false
  return hasReviewTextForReply(input.comment)
}

export function generateAutoReplyDraft(input: AutoReplyInput): string | null {
  if (!isEligibleForAutoReply(input)) return null
  const locale = detectReviewLocale(input.comment)
  const variants = input.rating === 5 ? REPLY_VARIANTS_5[locale] : REPLY_VARIANTS_4[locale]
  const seed = `${input.reviewId || ''}|${input.rating}|${locale}`
  const name = replyFirstName(input.displayName)
  return fillName(pickVariant(variants, seed), name)
}

export function generateReplyType(rating: number | null): string | null {
  if (rating == null) return null
  if (rating >= 5) return '5★ – tänu ja kutse tagasi'
  if (rating === 4) return '4★ – tänu ja küsi kuidas paremaks'
  if (rating <= 3) return '1–3★ – vabandus ja palu kirjutada'
  return null
}
