import { NextResponse } from 'next/server'
import {
  getFirstGiftCardFromDatabase,
  getGiftCardDetailsByCode,
} from '@/lib/notion-gift-card-lookup'
import { renderGiftCardToPngPdf } from '@/lib/gift-card-render'

/** Ühine loogika: Notion → PNG/PDF vastus (eelvaate ja dev-allalaadimise jaoks). */
export async function buildGiftCardFileResponse(opts: {
  code?: string
  format: 'png' | 'pdf'
  baseUrl: string
  notionApiKey: string
  notionDatabaseId: string
  contentDisposition: 'inline' | 'attachment'
}): Promise<NextResponse> {
  const { format, baseUrl, notionApiKey, notionDatabaseId, contentDisposition } = opts
  const trimmed = (opts.code ?? '').trim()

  const details = trimmed
    ? await getGiftCardDetailsByCode(notionApiKey, notionDatabaseId, trimmed)
    : await getFirstGiftCardFromDatabase(notionApiKey, notionDatabaseId)

  if (!details) {
    return NextResponse.json(
      {
        ok: false,
        error: trimmed ? 'Gift card not found' : 'No gift cards in database (first page empty)',
      },
      { status: 404 }
    )
  }

  const qrUrl = `${baseUrl.replace(/\/$/, '')}/kinkekaart/lunasta?code=${encodeURIComponent(details.code)}`

  const { pngBuffer, pdfBuffer } = await renderGiftCardToPngPdf({
    code: details.code,
    amountEur: details.amountEur,
    validUntil: details.validUntil,
    qrUrl,
  })

  const disp = contentDisposition === 'attachment' ? 'attachment' : 'inline'

  if (format === 'pdf') {
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disp}; filename="kinkekaart-${details.code}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  }

  return new NextResponse(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `${disp}; filename="kinkekaart-${details.code}.png"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
