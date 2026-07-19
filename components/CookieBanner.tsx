'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import {
  onCookieSettingsOpen,
  readConsent,
  writeConsent,
} from '@/lib/cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const t = useTranslations('CookieBanner')

  useEffect(() => {
    const stored = readConsent()
    if (!stored) {
      setVisible(true)
      setMarketing(false)
    } else {
      setMarketing(stored.marketing)
    }

    return onCookieSettingsOpen(() => {
      const current = readConsent()
      setMarketing(current?.marketing ?? false)
      setShowDetails(true)
      setVisible(true)
    })
  }, [])

  const save = (nextMarketing: boolean) => {
    writeConsent(nextMarketing)
    setMarketing(nextMarketing)
    setShowDetails(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label={t('ariaLabel')}
      className="fixed bottom-0 left-0 right-0 z-50 bg-deep-anthracite/95 text-white border-t border-papagoi-green/30 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm sm:text-base text-warm-gray-200">
            {t('message')}{' '}
            <Link
              href="/privaatsus"
              className="inline-flex h-11 items-center text-papagoi-green hover:underline align-middle"
            >
              {t('readMore')}
            </Link>
            .
          </p>

          {showDetails && (
            <div className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{t('necessaryTitle')}</p>
                  <p className="text-warm-gray-300 mt-1">{t('necessaryDesc')}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  {t('alwaysOn')}
                </span>
              </div>
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">{t('marketingTitle')}</p>
                  <p className="text-warm-gray-300 mt-1">{t('marketingDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-white/30 accent-papagoi-green"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  aria-label={t('marketingTitle')}
                />
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
            {!showDetails ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDetails(true)}
                className="text-warm-gray-200 hover:text-white hover:bg-white/10 h-11"
              >
                {t('settings')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => save(false)}
              className="border-white/30 bg-transparent text-white hover:bg-white/10 h-11"
            >
              {t('necessaryOnly')}
            </Button>
            {showDetails ? (
              <Button
                type="button"
                onClick={() => save(marketing)}
                className="bg-papagoi-green hover:bg-papagoi-green/90 text-white font-semibold h-11 rounded-full px-6"
              >
                {t('save')}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => save(true)}
                className="bg-papagoi-green hover:bg-papagoi-green/90 text-white font-semibold h-11 rounded-full px-6"
              >
                {t('accept')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
