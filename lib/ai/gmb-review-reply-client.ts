import {
  GMB_REVIEW_REPLY_JSON_SCHEMA,
  GMB_REVIEW_REPLY_REPLY_TYPES,
  GMB_REVIEW_REPLY_SYSTEM_PROMPT,
  buildGmbReviewReplyUserPrompt,
  expectedReplyTypeForRating,
  type GmbReviewReplyAiOutput,
  type GmbReviewReplyDecision,
  type GmbReviewReplyPromptInput,
  type GmbReviewReplyType,
} from '@/lib/ai/prompts/gmb-review-reply'

const DEFAULT_MODEL = 'google/gemini-2.5-flash'
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions'
const MAX_REPLY_CHARS = 800

export class GmbReplyAiValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GmbReplyAiValidationError'
  }
}

export class GmbReplyAiRateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GmbReplyAiRateLimitError'
  }
}

export function isGmbReplyAiRateLimitError(error: unknown): boolean {
  if (error instanceof GmbReplyAiRateLimitError) return true
  const message = error instanceof Error ? error.message : String(error)
  return /\b429\b/.test(message) || /rate[- ]limited|too many requests/i.test(message)
}

export function getGmbReplyAiModel(): string {
  return process.env.GMB_REPLY_AI_MODEL?.trim() || DEFAULT_MODEL
}

export function getAiGatewayToken(): string | null {
  const key = process.env.AI_GATEWAY_API_KEY?.trim()
  if (key) return key
  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim()
  return oidc || null
}

function isReplyType(value: unknown): value is GmbReviewReplyType {
  return typeof value === 'string' && (GMB_REVIEW_REPLY_REPLY_TYPES as readonly string[]).includes(value)
}

function looksLikeForbiddenReplyShape(reply: string): string | null {
  if (/```/.test(reply)) return 'reply sisaldab koodiplokki'
  if (/\n\s*\|.+\|/.test(reply) || /^\s*\|.+\|/.test(reply)) return 'reply sisaldab markdowni tabelit'
  if (/^\s*[{\[]/.test(reply) || /"decision"\s*:/.test(reply)) return 'reply näeb välja nagu JSON'
  if (/\b(chatgpt|gemini|openai|keelemudel|tehisintellekt|\bAI\b)\b/i.test(reply)) {
    return 'reply mainib AI-d'
  }
  return null
}

export function validateGmbReviewReplyAiOutput(
  parsed: unknown,
  rating?: number | null,
): GmbReviewReplyAiOutput {
  if (!parsed || typeof parsed !== 'object') {
    throw new GmbReplyAiValidationError('AI väljund ei ole objekt')
  }
  const raw = parsed as Record<string, unknown>
  if (raw.decision !== 'draft' && raw.decision !== 'skip') {
    throw new GmbReplyAiValidationError(`vigane decision: ${String(raw.decision)}`)
  }
  if (typeof raw.reason !== 'string') {
    throw new GmbReplyAiValidationError('reason peab olema string')
  }
  const decision = raw.decision as GmbReviewReplyDecision
  const reason = raw.reason.trim()
  if (!reason) {
    throw new GmbReplyAiValidationError('reason on tühi')
  }

  if (decision === 'skip') {
    if (raw.reply != null) {
      throw new GmbReplyAiValidationError('skip korral peab reply olema null')
    }
    if (raw.replyType != null) {
      throw new GmbReplyAiValidationError('skip korral peab replyType olema null')
    }
    return { decision: 'skip', reply: null, replyType: null, reason }
  }

  if (typeof raw.reply !== 'string' || !raw.reply.trim()) {
    throw new GmbReplyAiValidationError('draft korral peab reply olema mitte-tühi string')
  }
  const reply = raw.reply.trim()
  if (reply.length > MAX_REPLY_CHARS) {
    throw new GmbReplyAiValidationError(`reply on liiga pikk (${reply.length} > ${MAX_REPLY_CHARS})`)
  }
  const shapeError = looksLikeForbiddenReplyShape(reply)
  if (shapeError) {
    throw new GmbReplyAiValidationError(shapeError)
  }
  if (!isReplyType(raw.replyType)) {
    throw new GmbReplyAiValidationError(`vigane replyType: ${String(raw.replyType)}`)
  }
  const expected = expectedReplyTypeForRating(rating ?? null)
  if (!expected) {
    throw new GmbReplyAiValidationError('draft korral peab hinne olema 1–5')
  }
  if (raw.replyType !== expected) {
    throw new GmbReplyAiValidationError(
      `replyType ei vasta hindele ${rating}: oodatud "${expected}", tuli "${raw.replyType}"`,
    )
  }

  return { decision: 'draft', reply, replyType: raw.replyType, reason }
}

export function parseGmbReplyAiJson(raw: string, rating?: number | null): GmbReviewReplyAiOutput {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/\{[\s\S]*\}/)
  const jsonText = fenced ? fenced[0] : trimmed
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new GmbReplyAiValidationError('AI väljund ei ole kehtiv JSON')
  }
  return validateGmbReviewReplyAiOutput(parsed, rating)
}

export async function generateGmbReviewReplyDraft(
  input: GmbReviewReplyPromptInput,
): Promise<GmbReviewReplyAiOutput> {
  const token = getAiGatewayToken()
  if (!token) {
    throw new Error('AI Gateway token missing (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN)')
  }

  const messages = [
    { role: 'system', content: GMB_REVIEW_REPLY_SYSTEM_PROMPT },
    { role: 'user', content: buildGmbReviewReplyUserPrompt(input) },
  ]

  const schemaFormat = {
    type: 'json_schema',
    json_schema: {
      name: 'gmb_review_reply',
      strict: true,
      schema: GMB_REVIEW_REPLY_JSON_SCHEMA,
    },
  }
  const objectFormat = { type: 'json_object' }

  async function callGateway(responseFormat: unknown): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    try {
      return await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: getGmbReplyAiModel(),
          temperature: 0.6,
          messages,
          response_format: responseFormat,
        }),
      })
    } finally {
      clearTimeout(timeout)
    }
  }

  let response = await callGateway(schemaFormat)
  let bodyText = await response.text()
  if (!response.ok && response.status === 400) {
    response = await callGateway(objectFormat)
    bodyText = await response.text()
  }
  if (!response.ok) {
    const snippet = bodyText.slice(0, 400)
    if (response.status === 429 || /rate[- ]limited|too many requests/i.test(bodyText)) {
      throw new GmbReplyAiRateLimitError(`AI Gateway ${response.status}: ${snippet}`)
    }
    throw new Error(`AI Gateway ${response.status}: ${snippet}`)
  }

  const data = JSON.parse(bodyText) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content || !content.trim()) {
    throw new GmbReplyAiValidationError('AI Gateway returned empty content')
  }

  return parseGmbReplyAiJson(content, input.rating)
}
