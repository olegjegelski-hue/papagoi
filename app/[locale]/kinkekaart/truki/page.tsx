import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getGiftCardDetailsByCode } from '@/lib/notion-gift-card-lookup'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseCode(searchParams: Record<string, string | string[] | undefined>): string {
  const raw = searchParams.code
  if (typeof raw === 'string') return raw.trim()
  if (Array.isArray(raw) && raw[0]) return raw[0].trim()
  return ''
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'GiftCardPrint' })
  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  }
}

/** Avalik trükileht: /et/kinkekaart/truki?code=PK-XXXXXXX */
export default async function KinkekaartTrukiPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('GiftCardPrint')
  const code = parseCode(await searchParams)

  if (!code) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-papagoi-beige-50 px-4 py-16">
        <div className="max-w-md text-center">
          <h1 className="mb-3 text-2xl font-bold text-deep-anthracite">{t('title')}</h1>
          <p className="text-warm-gray-700">{t('enterCodeHint')}</p>
          <code className="mt-4 block rounded-lg bg-white px-3 py-2 text-sm text-deep-anthracite shadow-sm">
            /kinkekaart/truki?code=PK-XXXXXXX
          </code>
        </div>
      </div>
    )
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY
  const NOTION_GIFT_CARDS_DATABASE_ID = process.env.NOTION_GIFT_CARDS_DATABASE_ID

  if (!NOTION_API_KEY || !NOTION_GIFT_CARDS_DATABASE_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papagoi-beige-50 p-6">
        <p className="text-warm-gray-700">{t('serverConfig')}</p>
      </div>
    )
  }

  const details = await getGiftCardDetailsByCode(
    NOTION_API_KEY,
    NOTION_GIFT_CARDS_DATABASE_ID,
    code
  )

  if (!details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papagoi-beige-50 p-6">
        <p className="text-warm-gray-700">{t('notFound')}</p>
      </div>
    )
  }

  const printApi = `/api/gift-card-print?code=${encodeURIComponent(details.code)}`
  const previewSrc = `${printApi}&format=png&disposition=inline`

  return (
    <div className="flex min-h-screen flex-col items-center bg-papagoi-beige-50 px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-deep-anthracite">{t('title')}</h1>
      <p className="mb-6 text-center text-sm text-warm-gray-600">
        <span className="font-medium text-deep-anthracite">{details.code}</span>
        {' · '}
        {details.amountEur} € · {t('validUntil')} {details.validUntil || '—'}
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewSrc}
        alt={t('imageAlt', { code: details.code })}
        className="max-w-full rounded-lg shadow-lg"
        width={1080}
        height={680}
      />

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          className="rounded-full bg-papagoi-green px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-90"
          href={`${printApi}&format=pdf`}
        >
          {t('downloadPdf')}
        </a>
        <a
          className="rounded-full border border-papagoi-beige-300 bg-white px-6 py-3 text-sm font-semibold text-deep-anthracite shadow-sm hover:bg-papagoi-beige-100"
          href={`${printApi}&format=png`}
        >
          {t('downloadPng')}
        </a>
      </div>

      <p className="mt-6 max-w-md text-center text-xs text-warm-gray-500">{t('privacyNote')}</p>
    </div>
  )
}
