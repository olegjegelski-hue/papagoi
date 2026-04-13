import { notFound } from 'next/navigation'
import {
  getFirstGiftCardFromDatabase,
  getGiftCardDetailsByCode,
} from '@/lib/notion-gift-card-lookup'
import { renderGiftCardToPngPdf } from '@/lib/gift-card-render'

export const dynamic = 'force-dynamic'

function parseCode(searchParams: Record<string, string | string[] | undefined>): string {
  const raw = searchParams.code
  if (typeof raw === 'string') return raw.trim()
  if (Array.isArray(raw) && raw[0]) return raw[0].trim()
  return ''
}

/** Ainult arenduskeskkond. Näiteks: /dev/kinkekaart-eelvaade?code=PK-WN4K4VXV */
export default async function KinkekaartEelvaadePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const code = parseCode(searchParams)
  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

  if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-200 p-6">
        <p className="max-w-lg text-center text-stone-700">
          Lisa <code className="rounded bg-stone-300 px-1">.env</code> faili{' '}
          <code className="rounded bg-stone-300 px-1">NOTION_API_KEY</code> ja{' '}
          <code className="rounded bg-stone-300 px-1">NOTION_GIFT_CARDS_DATABASE_ID</code>, siis
          värskenda lehte.
        </p>
      </div>
    )
  }

  const details = code
    ? await getGiftCardDetailsByCode(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID, code)
    : await getFirstGiftCardFromDatabase(NOTION_API_KEY, NOTION_GIFT_CARDS_DATABASE_ID)

  if (!details) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-200 p-6">
        <p className="text-stone-700">
          {code ? 'Selle koodiga kinkekaarti ei leitud.' : 'Tabelis pole ühtegi kirjet.'}
        </p>
      </div>
    )
  }

  const qrUrl = `${baseUrl}/kinkekaart/lunasta?code=${encodeURIComponent(details.code)}`
  const { pngBuffer } = await renderGiftCardToPngPdf({
    code: details.code,
    amountEur: details.amountEur,
    validUntil: details.validUntil,
    qrUrl,
  })

  const src = `data:image/png;base64,${pngBuffer.toString('base64')}`

  return (
    <div className="flex min-h-screen flex-col items-center bg-stone-200 p-6">
      <p className="mb-4 max-w-xl text-center text-sm text-stone-600">
        <span className="font-medium text-stone-800">{details.code}</span>
        {' · '}
        {details.amountEur} € · kehtib {details.validUntil || '—'}
        {code ? null : (
          <>
            {' '}
            (esimene kirje; lisa <code className="rounded bg-stone-300 px-1">?code=…</code> konkreetse
            kaardi jaoks)
          </>
        )}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Kinkekaart ${details.code}`}
        className="max-w-full rounded-lg shadow-md"
        width={1080}
        height={680}
      />
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-800"
          href={`/api/gift-card-dev-download?code=${encodeURIComponent(details.code)}&format=png`}
        >
          Laadi alla PNG
        </a>
        <a
          className="rounded-lg border border-stone-400 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-50"
          href={`/api/gift-card-dev-download?code=${encodeURIComponent(details.code)}&format=pdf`}
        >
          Laadi alla PDF
        </a>
      </div>
      <p className="mt-4 max-w-xl text-center text-xs text-stone-500">
        Esimene render võtab mõnikord kauem (Playwright). Kui pilt puudub, oota ja värskenda.
      </p>
      <p className="mt-3 max-w-xl text-center text-xs text-stone-500">
        Tootmisserveris: kasuta <code className="rounded bg-stone-300 px-1">/api/gift-card-preview</code> päisega{' '}
        <code className="rounded bg-stone-300 px-1">x-admin-secret</code> (vt.{' '}
        <code className="rounded bg-stone-300 px-1">GIFT_CARD_ISSUE_SECRET</code>).
      </p>
    </div>
  )
}
