import 'dotenv/config'
import { sendReviewInviteEmail } from '../lib/email'
import type { VisitMailLocale } from '../lib/visit-language'

const TEST_REVIEW_TO = 'keskus@papagoi.ee'

const variants: { locale: VisitMailLocale; groupType: string; label: string }[] = [
  { locale: 'et', groupType: 'perevisit', label: 'ET perevisit (annetuse reaga)' },
  { locale: 'et', groupType: 'kool', label: 'ET kool (ilma annetuseta)' },
  { locale: 'en', groupType: 'perevisit', label: 'EN perevisit (annetuse reaga)' },
  { locale: 'ru', groupType: 'perevisit', label: 'RU perevisit (annetuse reaga)' },
]

async function main() {
  const visitDateIso = new Date().toISOString()
  for (const v of variants) {
    console.log(`Sending ${v.label} to ${TEST_REVIEW_TO}...`)
    const built = await sendReviewInviteEmail({
      to: TEST_REVIEW_TO,
      name: 'Papagoi sõber',
      visitDateIso,
      locale: v.locale,
      groupType: v.groupType,
    })
    console.log(
      `Sent. subject="${built.subject}" donationLine=${built.showDonation} locale=${built.locale}`
    )
  }
  console.log('All example review emails sent.')
}

main().catch((error) => {
  console.error('Failed to send example review email:', error)
  process.exit(1)
})
