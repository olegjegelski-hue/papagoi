import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { getGiftCardDetailsByCode } from '../lib/notion-gift-card-lookup'
import { renderGiftCardToPngPdf } from '../lib/gift-card-render'

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
}

async function main() {
  const code = process.argv[2] || 'PK-L9JW86SJ'
  const key = process.env.NOTION_API_KEY
  const db = process.env.NOTION_GIFT_CARDS_DATABASE_ID
  if (!key || !db) throw new Error('Missing NOTION env')

  const d = await getGiftCardDetailsByCode(key, db, code)
  console.log(JSON.stringify(d, null, 2))
  if (!d) throw new Error('Gift card not found')

  const { pngBuffer } = await renderGiftCardToPngPdf({
    code: d.code,
    amountEur: d.amountEur,
    validUntil: d.validUntil,
    qrUrl: `https://papagoi.ee/kinkekaart/lunasta?code=${encodeURIComponent(d.code)}`,
  })

  mkdirSync('output/kinkekaardid', { recursive: true })
  const out = `output/kinkekaardid/kinkekaart-${d.code}.png`
  writeFileSync(out, pngBuffer)
  console.log('wrote', out, pngBuffer.length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
