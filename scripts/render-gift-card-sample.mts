import { writeFileSync } from 'fs'
import { renderGiftCardToPngPdf } from '../lib/gift-card-render.ts'

process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papagoi.ee'

const { pngBuffer } = await renderGiftCardToPngPdf({
  code: 'DEMO-123',
  amountEur: 50,
  validUntil: '2027-12-31',
  qrUrl: 'https://www.papagoi.ee/kinkekaart/lunasta?code=DEMO-123',
})

const out = '/tmp/papagoi-gift-card-preview.png'
writeFileSync(out, pngBuffer)
console.log(out, pngBuffer.length)
