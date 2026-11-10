'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type Props = {
  enabled: boolean
  loggedIn: boolean
}

export default function GiftCardStaffLogin({ enabled, loggedIn }: Props) {
  const t = useTranslations('GiftCardStaff')
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/gift-card-staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const code = typeof data?.errorCode === 'string' ? data.errorCode : ''
        const keys = ['badPin', 'rateLimited', 'disabled', 'unknown'] as const
        setError(
          keys.includes(code as (typeof keys)[number])
            ? t(`errors.${code}` as 'errors.unknown')
            : t('errors.unknown')
        )
        return
      }
      setPin('')
      router.refresh()
    } catch {
      setError(t('errors.network'))
    } finally {
      setBusy(false)
    }
  }

  const onLogout = async () => {
    setBusy(true)
    await fetch('/api/gift-card-staff/logout', { method: 'POST' })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="min-h-[70vh] bg-papagoi-beige-50 px-4 pb-20 pt-12">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-papagoi-green/10 bg-card shadow-2xl">
        <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue p-8 text-center text-white">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <p className="text-warm-gray-700">{t('intro')}</p>

          {!enabled ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900">{t('disabled')}</p>
          ) : loggedIn ? (
            <>
              <p className="rounded-xl bg-green-50 px-4 py-3 font-medium text-green-800">{t('loggedIn')}</p>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  const trimmed = code.trim()
                  if (!trimmed) return
                  router.push(`/kinkekaart/lunasta?code=${encodeURIComponent(trimmed)}`)
                }}
              >
                <label htmlFor="staff-code" className="block text-sm font-medium text-deep-anthracite">
                  {t('codeLabel')}
                </label>
                <input
                  id="staff-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-papagoi-green/20 px-4 py-3 text-base focus:border-transparent focus:ring-2 focus:ring-papagoi-green"
                  autoCapitalize="characters"
                  autoComplete="off"
                />
                <button type="submit" className="papagoi-cta w-full">
                  {t('openCode')}
                </button>
              </form>
              <Link href="/kinkekaart/lunasta" className="block text-center font-semibold text-papagoi-green">
                {t('goRedeem')}
              </Link>
              <button
                type="button"
                onClick={onLogout}
                disabled={busy}
                className="w-full min-h-[48px] rounded-full border border-papagoi-beige-300 bg-white font-semibold text-deep-anthracite"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label htmlFor="staff-pin" className="block text-sm font-medium text-deep-anthracite mb-1">
                  {t('pinLabel')}
                </label>
                <input
                  id="staff-pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoComplete="off"
                  inputMode="numeric"
                  className="w-full min-h-[44px] rounded-xl border border-papagoi-green/20 px-4 py-3 text-base focus:border-transparent focus:ring-2 focus:ring-papagoi-green"
                  required
                />
              </div>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <button type="submit" disabled={busy} className="papagoi-cta w-full">
                {busy ? t('submitting') : t('submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
