import { writeFileSync } from 'fs'
import { giftCardRedeemUrl } from '../lib/gift-card.ts'
import { renderGiftCardToPngPdf } from '../lib/gift-card-render.ts'

process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee'

const { pngBuffer } = await renderGiftCardToPngPdf({
  code: 'DEMO-123',
  amountEur: 50,
  validUntil: '2027-12-31',
  qrUrl: giftCardRedeemUrl('DEMO-123', 'et'),
})

const out = '/tmp/papagoi-gift-card-preview.png'
writeFileSync(out, pngBuffer)
console.log(out, pngBuffer.length)
