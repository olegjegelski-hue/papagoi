'use client'

import { useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Calendar, Gift } from 'lucide-react'
import type { GiftCardPublicKind, GiftCardPublicView, TodayVisitor } from '@/lib/gift-card-status'
import { formatGiftCardDate } from '@/lib/gift-card-status'

type StaffProps = {
  loggedIn: boolean
  visitors: TodayVisitor[]
  canMark: boolean
  canUndo: boolean
  blockKind: GiftCardPublicKind | null
}

type Props = {
  queryCode: string
  card: GiftCardPublicView | null
  rateLimited?: boolean
  serverError?: boolean
  staffEnabled: boolean
  staff: StaffProps | null
}

const KIND_STYLES: Record<GiftCardPublicKind, string> = {
  valid: 'bg-papagoi-green/15 text-papagoi-green border-papagoi-green/30',
  used: 'bg-warm-gray-100 text-warm-gray-700 border-warm-gray-200',
  expired: 'bg-orange-50 text-orange-800 border-orange-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  not_found: 'bg-warm-gray-100 text-warm-gray-700 border-warm-gray-200',
}

export default function GiftCardRedeemView({
  queryCode,
  card,
  rateLimited,
  serverError,
  staffEnabled,
  staff,
}: Props) {
  const t = useTranslations('GiftCardRedeem')
  const router = useRouter()
  const kind: GiftCardPublicKind = card?.kind ?? 'not_found'
  const [panel, setPanel] = useState<'mark' | 'undo' | null>(null)
  const [visitorId, setVisitorId] = useState('none')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const statusLabel = useMemo(() => {
    if (kind === 'valid') return t('statusValid')
    if (kind === 'used') return t('statusUsed')
    if (kind === 'expired') return t('statusExpired')
    if (kind === 'pending') return t('statusPending')
    if (kind === 'cancelled') return t('statusCancelled')
    return t('statusNotFound')
  }, [kind, t])

  const postAction = async (action: 'mark' | 'undo') => {
    if (!card) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/gift-card-redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          code: card.code,
          visitorId: action === 'mark' ? visitorId : undefined,
          confirm: true,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const code = typeof data?.errorCode === 'string' ? data.errorCode : ''
        const keys = [
          'notFound',
          'notMarkable',
          'notUndoable',
          'visitorInvalid',
          'unauthorized',
          'rateLimited',
          'confirmRequired',
          'missingCode',
          'unknown',
        ] as const
        setError(
          keys.includes(code as (typeof keys)[number])
            ? t(`errors.${code}` as 'errors.unknown')
            : t('errors.unknown')
        )
        return
      }
      setMessage(action === 'mark' ? t('markedOk') : t('undoneOk'))
      setPanel(null)
      router.refresh()
    } catch {
      setError(t('errors.network'))
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    await fetch('/api/gift-card-staff/logout', { method: 'POST' })
    router.refresh()
  }

  if (rateLimited) {
    return (
      <CardShell title={t('title')}>
        <p className="text-warm-gray-700">{t('rateLimited')}</p>
      </CardShell>
    )
  }

  if (serverError) {
    return (
      <CardShell title={t('title')}>
        <p className="text-warm-gray-700">{t('serverConfig')}</p>
      </CardShell>
    )
  }

  if (!queryCode) {
    return (
      <CardShell title={t('title')}>
        <p className="text-warm-gray-700">{t('enterCodeHint')}</p>
        <code className="mt-4 block rounded-lg bg-white px-3 py-2 text-sm text-deep-anthracite shadow-sm">
          /kinkekaart/lunasta?code=PK-XXXXXXX
        </code>
      </CardShell>
    )
  }

  return (
    <div className="min-h-[70vh] bg-papagoi-beige-50 px-4 pb-20 pt-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-papagoi-green/10 bg-card shadow-2xl">
          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue p-8 text-center text-white">
            <Gift className="mx-auto mb-4 h-12 w-12 opacity-90" />
            <h1 className="text-2xl font-bold md:text-3xl">{t('title')}</h1>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {staffEnabled && staff?.loggedIn ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-papagoi-green/20 bg-papagoi-green/5 px-4 py-3 text-sm">
                <span className="font-medium text-deep-anthracite">{t('staffLoggedIn')}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="min-h-[44px] rounded-full px-4 font-semibold text-papagoi-green hover:underline"
                >
                  {t('logout')}
                </button>
              </div>
            ) : null}

            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-wide text-warm-gray-500">{t('codeLabel')}</p>
              <p className="break-all text-2xl font-bold text-deep-anthracite">{card?.code || queryCode}</p>
              <span
                className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold ${KIND_STYLES[kind]}`}
              >
                {statusLabel}
              </span>
            </div>

            {card ? (
              <dl className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
                <div className="rounded-xl bg-papagoi-beige-50 px-4 py-3">
                  <dt className="text-sm text-warm-gray-500">{t('valueLabel')}</dt>
                  <dd className="text-lg font-semibold text-deep-anthracite">{card.amountEur} €</dd>
                </div>
                <div className="rounded-xl bg-papagoi-beige-50 px-4 py-3">
                  <dt className="text-sm text-warm-gray-500">{t('validUntilLabel')}</dt>
                  <dd className="text-lg font-semibold text-deep-anthracite">
                    {formatGiftCardDate(card.validUntil) || '—'}
                  </dd>
                </div>
              </dl>
            ) : null}

            {kind === 'used' && card?.usedAt ? (
              <p className="text-center text-warm-gray-700">
                {t('usedOn', { date: formatGiftCardDate(card.usedAt) })}
              </p>
            ) : null}

            {kind === 'valid' ? (
              <Link href="/broneeri" className="papagoi-cta w-full">
                <Calendar className="h-5 w-5" />
                {t('bookVisit')}
              </Link>
            ) : null}

            {kind === 'not_found' ? (
              <div className="space-y-4 text-center">
                <p className="text-warm-gray-700">{t('notFoundBody')}</p>
                <Link href="/kontakt#kirjuta" className="papagoi-cta w-full">
                  {t('contactUs')}
                </Link>
              </div>
            ) : null}

            {message ? (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-green-800">{message}</p>
            ) : null}
            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-red-700">{error}</p>
            ) : null}

            {staffEnabled && staff?.loggedIn && card ? (
              <StaffActions
                t={t}
                cardCode={card.code}
                staff={staff}
                panel={panel}
                setPanel={setPanel}
                visitorId={visitorId}
                setVisitorId={setVisitorId}
                busy={busy}
                onMark={() => postAction('mark')}
                onUndo={() => postAction('undo')}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-papagoi-beige-50 px-4 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-3 text-2xl font-bold text-deep-anthracite">{title}</h1>
        {children}
      </div>
    </div>
  )
}

function StaffActions({
  t,
  cardCode,
  staff,
  panel,
  setPanel,
  visitorId,
  setVisitorId,
  busy,
  onMark,
  onUndo,
}: {
  t: ReturnType<typeof useTranslations<'GiftCardRedeem'>>
  cardCode: string
  staff: StaffProps
  panel: 'mark' | 'undo' | null
  setPanel: (v: 'mark' | 'undo' | null) => void
  visitorId: string
  setVisitorId: (v: string) => void
  busy: boolean
  onMark: () => void
  onUndo: () => void
}) {
  if (staff.canMark) {
    return (
      <div className="space-y-4 border-t border-papagoi-beige-200 pt-6">
        {panel !== 'mark' ? (
          <button
            type="button"
            onClick={() => setPanel('mark')}
            className="papagoi-cta w-full min-h-[52px] text-lg"
          >
            {t('markUsed')}
          </button>
        ) : (
          <div className="space-y-4 rounded-2xl border border-papagoi-green/20 bg-papagoi-beige-50 p-4">
            <p className="font-semibold text-deep-anthracite">{t('confirmMark', { code: cardCode })}</p>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium text-warm-gray-600">{t('todayVisitors')}</legend>
              <label className="flex min-h-[44px] items-center gap-3 rounded-xl bg-white px-3 py-2">
                <input
                  type="radio"
                  name="visitor"
                  value="none"
                  checked={visitorId === 'none'}
                  onChange={() => setVisitorId('none')}
                />
                <span>{t('unlinkVisitor')}</span>
              </label>
              {staff.visitors.map((visitor) => (
                <label
                  key={visitor.id}
                  className="flex min-h-[44px] items-start gap-3 rounded-xl bg-white px-3 py-2"
                >
                  <input
                    type="radio"
                    name="visitor"
                    value={visitor.id}
                    checked={visitorId === visitor.id}
                    onChange={() => setVisitorId(visitor.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium text-deep-anthracite">{visitor.name}</span>
                    <span className="block text-sm text-warm-gray-500">
                      {t('visitorMeta', {
                        time: visitor.time || '—',
                        count: visitor.count ?? '—',
                      })}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy}
                onClick={() => setPanel(null)}
                className="min-h-[48px] flex-1 rounded-full border border-papagoi-beige-300 bg-white px-4 font-semibold text-deep-anthracite"
              >
                {t('confirmCancel')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onMark}
                className="papagoi-cta min-h-[48px] flex-1"
              >
                {busy ? t('working') : t('confirmYes')}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (staff.canUndo) {
    return (
      <div className="space-y-4 border-t border-papagoi-beige-200 pt-6">
        {panel !== 'undo' ? (
          <button
            type="button"
            onClick={() => setPanel('undo')}
            className="w-full min-h-[52px] rounded-full border-2 border-papagoi-green/30 px-6 font-semibold text-deep-anthracite"
          >
            {t('undo')}
          </button>
        ) : (
          <div className="space-y-4 rounded-2xl border border-papagoi-green/20 bg-papagoi-beige-50 p-4">
            <p className="font-semibold text-deep-anthracite">{t('confirmUndo', { code: cardCode })}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy}
                onClick={() => setPanel(null)}
                className="min-h-[48px] flex-1 rounded-full border border-papagoi-beige-300 bg-white px-4 font-semibold"
              >
                {t('confirmCancel')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onUndo}
                className="papagoi-cta min-h-[48px] flex-1"
              >
                {busy ? t('working') : t('undo')}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (staff.blockKind && staff.blockKind !== 'valid') {
    return (
      <p className="border-t border-papagoi-beige-200 pt-6 text-center text-sm text-warm-gray-600">
        {t(`cannotMark.${staff.blockKind}` as 'cannotMark.used')}
      </p>
    )
  }

  return null
}
