import 'dotenv/config'
import { sendReviewEmail } from './send-review-invites'

async function main() {
  const to = 'keskus@papagoi.ee'
  const name = 'Papagoi sõber'
  const visitDateIso = new Date().toISOString()

  console.log(`Sending example review email to ${to}...`)
  await sendReviewEmail(to, name, visitDateIso)
  console.log('Example review email sent.')
}

main().catch((error) => {
  console.error('Failed to send example review email:', error)
  process.exit(1)
})

