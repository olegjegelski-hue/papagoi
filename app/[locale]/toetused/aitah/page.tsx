import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import {
  decodeMontonioOrderToken,
  donationThankYouKind,
  extractMontonioOrderToken,
  getMontonioPaymentStatus,
  parseMontonioAmount,
  type DonationThankYouKind,
} from '@/lib/montonio-payment'
import { hasMontonioConfig } from '@/lib/montonio'
import { findDonationByMontonio } from '@/lib/notion-donations'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseTokenParam(searchParams: Record<string, string | string[] | undefined>): string | null {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') params.set(key, value)
    else if (Array.isArray(value) && value[0]) params.set(key, value[0])
  }
  return extractMontonioOrderToken({ searchParams: params })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'DonationThankYou' })
  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  }
}

export default async function DonationThankYouPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('DonationThankYou')
  const token = parseTokenParam(await searchParams)

  let kind: DonationThankYouKind = 'failed'
  let code = ''
  let amount: number | null = null
  let purposeLabel = ''

  if (token && hasMontonioConfig()) {
    try {
      const decoded = decodeMontonioOrderToken(token)
      kind = donationThankYouKind(getMontonioPaymentStatus(decoded))
      code = typeof decoded.merchantReference === 'string' ? decoded.merchantReference : ''
      amount = parseMontonioAmount(decoded) ?? null

      const notionApiKey = process.env.NOTION_API_KEY
      const databaseId = process.env.NOTION_DONATIONS_DATABASE_ID
      if (notionApiKey && databaseId) {
        try {
          const record = await findDonationByMontonio(notionApiKey, databaseId, {
            uuid: typeof decoded.uuid === 'string' ? decoded.uuid : undefined,
            merchantReference: code,
          })
          if (record) {
            if (record.code) code = record.code
            if (record.amountEur) amount = record.amountEur
            if (record.purpose) purposeLabel = t(`purpose.${record.purpose}`)
            else if (record.purposeLabel) purposeLabel = record.purposeLabel
          }
        } catch (error) {
          console.error('[toetused/aitah] Notion lookup', error)
        }
      }
    } catch {
      kind = 'failed'
    }
  }

  const title =
    kind === 'paid'
      ? t('paidTitle', { code: code || 'ANN' })
      : kind === 'pending'
        ? t('pendingTitle')
        : t('failedTitle')
  const body =
    kind === 'paid'
      ? t('paidBody', { code: code || 'ANN' })
      : kind === 'pending'
        ? t('pendingBody')
        : t('failedBody')

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-papagoi-beige-50 via-papagoi-beige to-papagoi-green-50/50 pt-12 pb-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <div
          className={`rounded-2xl border p-8 text-center ${
            kind === 'paid'
              ? 'bg-green-50 border-green-200'
              : kind === 'pending'
                ? 'bg-white border-papagoi-green/20'
                : 'bg-papagoi-beige-50 border-papagoi-beige-300'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-deep-anthracite mb-4 break-words">{title}</h1>
          <p className="text-deep-anthracite/80 leading-relaxed">{body}</p>
          {kind === 'paid' && (amount != null || purposeLabel) ? (
            <div className="mt-6 rounded-xl border border-papagoi-green/20 bg-white px-4 py-4 text-left text-sm text-deep-anthracite">
              {amount != null ? (
                <p className="mb-1">
                  <strong>{t('amountLabel')}</strong> {amount} €
                </p>
              ) : null}
              {purposeLabel ? (
                <p>
                  <strong>{t('purposeLabel')}</strong> {purposeLabel}
                </p>
              ) : null}
            </div>
          ) : null}
          {kind !== 'paid' ? (
            <div className="mt-8">
              <Link
                href={{ pathname: '/toetused', hash: 'anneta' }}
                className="papagoi-cta inline-flex items-center justify-center"
              >
                {t('backCta')}
              </Link>
            </div>
          ) : (
            <p className="text-sm text-deep-anthracite/60 mt-6">
              {t('questions')}{' '}
              <a href="tel:+3725127938" className="text-papagoi-green hover:underline">
                +372 512 7938
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
