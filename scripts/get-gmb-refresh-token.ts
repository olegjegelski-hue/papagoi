import dotenv from 'dotenv'

dotenv.config()

const DEVICE_CODE_ENDPOINT = 'https://oauth2.googleapis.com/device/code'
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/business.manage'

async function main() {
  const clientId = process.env.GOOGLE_MY_BUSINESS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Puudub GOOGLE_MY_BUSINESS_CLIENT_ID või GOOGLE_MY_BUSINESS_CLIENT_SECRET .env failis')
    process.exit(1)
  }

  // 1) Küsi device code
  const deviceRes = await fetch(DEVICE_CODE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      scope: SCOPE,
    }).toString(),
  })

  if (!deviceRes.ok) {
    console.error('Device code viga:', await deviceRes.text())
    process.exit(1)
  }

  const deviceData = (await deviceRes.json()) as {
    device_code: string
    user_code: string
    verification_url: string
    expires_in: number
    interval: number
  }

  console.log('--- Google My Business OAuth ---')
  console.log(`1. Ava brauseris: ${deviceData.verification_url}`)
  console.log(`2. Sisesta kood: ${deviceData.user_code}`)
  console.log('3. Kinnita õigused (Google Business Profile).')
  console.log('Ootan, kuni kinnitad...')

  // 2) Küsime tokenit nii kaua, kuni Google ütleb OK
  const start = Date.now()

  while (Date.now() - start < deviceData.expires_in * 1000) {
    await new Promise((r) => setTimeout(r, deviceData.interval * 1000))

    const tokenRes = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        device_code: deviceData.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }).toString(),
    })

    const text = await tokenRes.text()
    let data: any

    try {
      data = JSON.parse(text)
    } catch {
      console.error('Token vastus polnud JSON:', text)
      continue
    }

    if (data.error === 'authorization_pending') {
      // kasutaja pole veel kinnitanud, ootame edasi
      continue
    }

    if (!tokenRes.ok) {
      console.error('Token viga:', data)
      process.exit(1)
    }

    if (!data.refresh_token) {
      console.error('refresh_token puudub vastuses:', data)
      process.exit(1)
    }

    console.log('\nREFRESH TOKEN:')
    console.log(data.refresh_token)
    console.log('\nLisa see .env faili reale:')
    console.log('GOOGLE_MY_BUSINESS_REFRESH_TOKEN=' + data.refresh_token)
    process.exit(0)
  }

  console.error('Seadme kood aegus enne kui kinnitasid.')
  process.exit(1)
}

main().catch((err) => {
  console.error('Viga:', err)
  process.exit(1)
})
