import { NextResponse } from 'next/server'
import { renderGiftCardToPngPdf } from '@/lib/gift-card-render'

export const dynamic = 'force-dynamic'

/** Ainult `next dev` — näidiskinkekaart PNG (brauseris nägemiseks). */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const { pngBuffer } = await renderGiftCardToPngPdf({
    code: 'DEMO-123',
    amountEur: 50,
    validUntil: '2027-12-31',
    qrUrl: `${baseUrl.replace(/\/$/, '')}/kinkekaart/lunasta?code=DEMO-123`,
  })

  return new NextResponse(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  })
}
