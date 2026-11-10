import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

export const GIFT_CARD_STAFF_COOKIE = 'papagoi_gift_staff'
export const GIFT_CARD_STAFF_COOKIE_MAX_AGE = 365 * 24 * 60 * 60
export const MIN_STAFF_PIN_LENGTH = 6

function staffPin(): string {
  return (process.env.GIFT_CARD_STAFF_PIN || '').trim()
}

function staffHmacSecret(): string {
  return (process.env.GIFT_CARD_STAFF_SECRET || '').trim()
}

function pinFingerprint(pin: string): string {
  return createHash('sha256').update(pin).digest('hex')
}

/** PIN ≥ 6 ja eraldi HMAC-saladus. Lühike PIN logib vea ja lülitab keskuse vaate välja. */
export function isGiftCardStaffConfigured(): boolean {
  const pin = staffPin()
  const secret = staffHmacSecret()
  if (pin.length > 0 && pin.length < MIN_STAFF_PIN_LENGTH) {
    console.error(
      `[gift-card-staff] GIFT_CARD_STAFF_PIN on lühem kui ${MIN_STAFF_PIN_LENGTH} märki — keskuse vaade on väljas`
    )
    return false
  }
  return pin.length >= MIN_STAFF_PIN_LENGTH && secret.length > 0
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
  if (!isGiftCardStaffConfigured()) return null
  const secret = staffHmacSecret()
  const exp = Math.floor(nowMs / 1000) + GIFT_CARD_STAFF_COOKIE_MAX_AGE
  const payload = `v1.${exp}.${pinFingerprint(staffPin())}`
  return `${payload}.${signPayload(payload, secret)}`
}

export function verifyStaffCookieValue(
  token: string | undefined | null,
  nowMs: number = Date.now()
): boolean {
  if (!isGiftCardStaffConfigured() || !token) return false
  const secret = staffHmacSecret()
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== 'v1') return false
  const exp = Number(parts[1])
  if (!Number.isFinite(exp) || exp * 1000 < nowMs) return false
  const expectedPinHash = pinFingerprint(staffPin())
  if (!timingSafeStringEqual(parts[2], expectedPinHash)) return false
  const payload = `v1.${parts[1]}.${parts[2]}`
  const expected = signPayload(payload, secret)
  return timingSafeStringEqual(parts[3], expected)
}

export function staffPinMatches(input: string): boolean {
  if (!isGiftCardStaffConfigured()) return false
  return timingSafeStringEqual(input.trim(), staffPin())
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
