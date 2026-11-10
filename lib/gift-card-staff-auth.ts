import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

export const GIFT_CARD_STAFF_COOKIE = 'papagoi_gift_staff'
export const GIFT_CARD_STAFF_COOKIE_MAX_AGE = 365 * 24 * 60 * 60

function staffPin(): string {
  return (process.env.GIFT_CARD_STAFF_PIN || '').trim()
}

export function isGiftCardStaffConfigured(): boolean {
  return staffPin().length > 0
}

function hmacSecret(): string | null {
  const pin = staffPin()
  return pin || null
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

/** Võrdleb stringe SHA-256 kaudu, et pikkus ei lekiks. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const left = sha256(a)
  const right = sha256(b)
  return timingSafeEqual(left, right)
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function createStaffCookieValue(nowMs: number = Date.now()): string | null {
  const secret = hmacSecret()
  if (!secret) return null
  const exp = Math.floor(nowMs / 1000) + GIFT_CARD_STAFF_COOKIE_MAX_AGE
  const payload = `v1.${exp}`
  return `${payload}.${signPayload(payload, secret)}`
}

export function verifyStaffCookieValue(
  token: string | undefined | null,
  nowMs: number = Date.now()
): boolean {
  const secret = hmacSecret()
  if (!secret || !token) return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false
  const exp = Number(parts[1])
  if (!Number.isFinite(exp) || exp * 1000 < nowMs) return false
  const payload = `v1.${parts[1]}`
  const expected = signPayload(payload, secret)
  return timingSafeStringEqual(parts[2], expected)
}

export function staffPinMatches(input: string): boolean {
  const expected = staffPin()
  if (!expected) return false
  return timingSafeStringEqual(input.trim(), expected)
}

export function staffCookieSetOptions(secure: boolean) {
  return {
    httpOnly: true as const,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: GIFT_CARD_STAFF_COOKIE_MAX_AGE,
  }
}

export function staffCookieClearOptions(secure: boolean) {
  return {
    httpOnly: true as const,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

export function requestIsHttps(request: Request): boolean {
  const proto = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '')
  return proto === 'https'
}
