import { URLSearchParams } from 'url'

interface SendSmsOptions {
  to: string
  content: string
}

interface SendberryResponse {
  status?: string
  cost?: number
  count?: number
  ID?: string
  SMS_ID?: string
  [key: string]: unknown
}

function getSendberryConfig() {
  const key = process.env.SENDBERRY_API_KEY
  const name = process.env.SENDBERRY_NAME
  const password = process.env.SENDBERRY_PASSWORD
  const from = process.env.SENDBERRY_FROM

  if (!key || !name || !password || !from) {
    throw new Error(
      'Sendberry configuration missing. Please set SENDBERRY_API_KEY, SENDBERRY_NAME, SENDBERRY_PASSWORD and SENDBERRY_FROM.'
    )
  }

  return { key, name, password, from }
}

export async function sendSms({ to, content }: SendSmsOptions): Promise<SendberryResponse> {
  const { key, name, password, from } = getSendberryConfig()

  const endpoint = process.env.SENDBERRY_SMS_ENDPOINT || 'https://api.sendberry.com/SMS/SEND'

  if (!to?.trim()) {
    throw new Error('sendSms: "to" phone number is required')
  }
  if (!content?.trim()) {
    throw new Error('sendSms: "content" is required')
  }

  const params = new URLSearchParams()
  params.set('key', key)
  params.set('name', name)
  params.set('password', password)
  params.set('from', from)
  params.set('content', content)
  params.append('to[]', to.trim())
  params.set('response', 'JSON')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Sendberry SMS request failed: HTTP ${res.status} ${text}`)
  }

  let data: SendberryResponse
  try {
    data = (await res.json()) as SendberryResponse
  } catch (error) {
    throw new Error(`Sendberry SMS response is not valid JSON: ${(error as Error).message}`)
  }

  if (data.status !== 'ok') {
    throw new Error(`Sendberry SMS error: ${JSON.stringify(data)}`)
  }

  return data
}

