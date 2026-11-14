import jwt from 'jsonwebtoken'

export type MontonioBillingAddress = {
  firstName: string
  lastName: string
  email: string
  country?: string
  phoneNumber?: string
  addressLine1?: string
  locality?: string
  region?: string
  postalCode?: string
}

export type MontonioLineItem = {
  name: string
  quantity: number
  finalPrice: number
}

export type MontonioPaymentMethod = {
  method: 'paymentInitiation'
  amount: number
  currency: string
  methodDisplay?: string
  methodOptions?: {
    preferredCountry?: string
    preferredLocale?: string
    preferredProvider?: string
    paymentDescription?: string
    paymentReference?: string
  }
}

export type CreateMontonioOrderInput = {
  merchantReference: string
  returnUrl: string
  notificationUrl: string
  currency: string
  grandTotal: number
  locale: string
  billingAddress?: MontonioBillingAddress
  lineItems?: MontonioLineItem[]
  payment: MontonioPaymentMethod
}

export type MontonioConfig = {
  accessKey: string
  secretKey: string
  environment: 'sandbox' | 'production'
  apiUrl: string
}

export class MontonioConfigError extends Error {
  constructor(message = 'Montonio API keys are missing') {
    super(message)
    this.name = 'MontonioConfigError'
  }
}

export function hasMontonioConfig(): boolean {
  return Boolean(process.env.MONTONIO_ACCESS_KEY?.trim() && process.env.MONTONIO_SECRET_KEY?.trim())
}

export function getMontonioConfig(): MontonioConfig {
  const accessKey = process.env.MONTONIO_ACCESS_KEY?.trim()
  const secretKey = process.env.MONTONIO_SECRET_KEY?.trim()
  const environment = process.env.MONTONIO_ENVIRONMENT === 'production' ? 'production' : 'sandbox'

  if (!accessKey || !secretKey) {
    throw new MontonioConfigError()
  }

  const apiUrl =
    environment === 'sandbox'
      ? 'https://sandbox-stargate.montonio.com/api/orders'
      : 'https://stargate.montonio.com/api/orders'

  return { accessKey, secretKey, environment, apiUrl }
}

export async function createMontonioOrder(
  orderData: CreateMontonioOrderInput
): Promise<{ paymentUrl: string; uuid: string }> {
  const config = getMontonioConfig()

  const token = jwt.sign(
    {
      accessKey: config.accessKey,
      ...orderData,
    },
    config.secretKey,
    {
      algorithm: 'HS256',
      expiresIn: '10m',
    }
  )

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: token }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Montonio API error: ${response.status} - ${errorText.slice(0, 500)}`)
  }

  const data = (await response.json()) as { paymentUrl?: unknown; uuid?: unknown }

  if (typeof data.paymentUrl !== 'string' || !data.paymentUrl || typeof data.uuid !== 'string' || !data.uuid) {
    throw new Error('Invalid response from Montonio API: missing paymentUrl or uuid')
  }

  return { paymentUrl: data.paymentUrl, uuid: data.uuid }
}

export function validateMontonioToken(token: string): Record<string, unknown> {
  const config = getMontonioConfig()
  const decoded = jwt.verify(token, config.secretKey, { algorithms: ['HS256'] })
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid Montonio token')
  }
  const payload = decoded as Record<string, unknown>
  if (payload.accessKey !== config.accessKey) {
    throw new Error('Montonio tokeni accessKey ei kattu')
  }
  return payload
}

export function generateMerchantReference(prefix: string = 'ORDER'): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `${prefix}-${timestamp}-${random}`
}

export function isSafeMontonioPaymentUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}
