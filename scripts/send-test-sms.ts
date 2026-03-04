import 'dotenv/config'
import { formatInTimeZone } from 'date-fns-tz'
import { sendSms } from '../lib/sms'

function buildTestMessage() {
  const mapUrl =
    process.env.VISIT_SMS_MAP_URL ||
    'https://maps.app.goo.gl/xxxxxxxx'

  const now = new Date()
  const tomorrowIso = formatInTimeZone(
    new Date(now.getTime() + 24 * 60 * 60 * 1000),
    'Europe/Tallinn',
    "yyyy-MM-dd'T'HH:mm:ssXXX"
  )
  const datePart = formatInTimeZone(tomorrowIso, 'Europe/Tallinn', 'dd.MM.yyyy')
  const timePart = '12:00'

  return (
    `Tere! Tuletame meelde, et Papagoi Keskuse külastus on ${datePart} kell ${timePart}. ` +
    `Kui plaanid muutuvad, palun helistage tühistamiseks või aja muutmiseks: +372 512 7938. ` +
    `Papagoid ootavad teid! Google Maps: ${mapUrl}`
  )
}

export async function runTestSmsFromEnv() {
  const to = process.env.TEST_SMS_TO
  if (!to || !to.trim()) {
    console.error('TEST_SMS_TO environment variable is not set.')
    process.exit(1)
  }

  const content = buildTestMessage()

  console.log(`Sending test SMS to ${to}...`)
  await sendSms({ to: to.trim(), content })
  console.log('Test SMS sent successfully.')
}

if (process.env.TEST_SMS_CLI === '1') {
  runTestSmsFromEnv().catch((error) => {
    console.error('Unexpected error in send-test-sms script:', error)
    process.exit(1)
  })
}

