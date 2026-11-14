'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Heart, ChevronUp, ChevronDown } from 'lucide-react'
import { trackDonationSubmit } from '@/lib/meta-pixel'
import {
  DONATION_AMOUNT_MAX,
  DONATION_AMOUNT_MIN,
  DONATION_AMOUNT_STEP,
  DONATION_COMMENT_MAX,
  DONATION_PURPOSES,
  DONATION_QUICK_AMOUNTS,
  parseDonationPurpose,
  roundDonationAmount,
  type DonationPurpose,
} from '@/lib/donation'

function isHttpsPaymentUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

const PURPOSE_EMOJI: Record<DonationPurpose, string> = {
  kingi: '💛',
  toit: '🌾',
  uldine: '🌿',
}

export default function DonationForm({ initialPurpose }: { initialPurpose?: string }) {
  const locale = useLocale()
  const t = useTranslations('DonationForm')
  const parsedInitial = parseDonationPurpose(initialPurpose)
  const [purpose, setPurpose] = useState<DonationPurpose | ''>(parsedInitial ?? '')

  useEffect(() => {
    const parsed = parseDonationPurpose(initialPurpose)
    if (parsed) setPurpose(parsed)
  }, [initialPurpose])
  const [amount, setAmount] = useState<number>(10)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [publishName, setPublishName] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [botField, setBotField] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!purpose) {
      setError(t('errors.purposeRequired'))
      return
    }
    setLoading(true)
    let redirected = false
    try {
      const res = await fetch('/api/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          amount,
          purpose,
          comment: comment.trim(),
          publishName,
          confirm,
          botField,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const code = typeof data?.errorCode === 'string' ? data.errorCode : ''
        const errorKeys = [
          'nameRequired',
          'emailRequired',
          'confirmRequired',
          'emailInvalid',
          'amountInvalid',
          'purposeRequired',
          'rateLimited',
          'serverConfig',
          'unknown',
        ] as const
        setError(
          errorKeys.includes(code as (typeof errorKeys)[number])
            ? t(`errors.${code}` as 'errors.nameRequired')
            : t('errorGeneric')
        )
        return
      }
      const paymentUrl = typeof data?.paymentUrl === 'string' ? data.paymentUrl : ''
      if (paymentUrl && isHttpsPaymentUrl(paymentUrl)) {
        trackDonationSubmit({ value: amount })
        redirected = true
        window.location.assign(paymentUrl)
        return
      }
      setSubmitted(true)
    } catch {
      setError(t('errorNetwork'))
    } finally {
      if (!redirected) setLoading(false)
    }
  }

  const increment = () => setAmount((a) => Math.min(DONATION_AMOUNT_MAX, a + DONATION_AMOUNT_STEP))
  const decrement = () => setAmount((a) => Math.max(DONATION_AMOUNT_MIN, a - DONATION_AMOUNT_STEP))
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!Number.isNaN(v)) setAmount(roundDonationAmount(v))
  }
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (Number.isNaN(v) || v < DONATION_AMOUNT_MIN) setAmount(DONATION_AMOUNT_MIN)
    else if (v > DONATION_AMOUNT_MAX) setAmount(DONATION_AMOUNT_MAX)
    else setAmount(roundDonationAmount(v))
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <p className="text-xl font-semibold text-green-800 mb-2">{t('receivedTitle')}</p>
        <p className="text-deep-anthracite/80">{t('receivedBody')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className="block text-lg font-semibold text-deep-anthracite mb-3 text-center">
          {t('purposeSelect')}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DONATION_PURPOSES.map((key) => {
            const selected = purpose === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPurpose(key)}
                aria-pressed={selected}
                className={`rounded-xl border-2 px-4 py-4 text-left transition-all ${
                  selected
                    ? 'border-papagoi-green bg-papagoi-green/10 shadow-sm'
                    : 'border-papagoi-green/20 bg-white hover:border-papagoi-green/50'
                }`}
              >
                <span className="text-2xl block mb-2" aria-hidden>
                  {PURPOSE_EMOJI[key]}
                </span>
                <span className="block font-semibold text-deep-anthracite">{t(`purpose.${key}`)}</span>
                <span className="block text-sm text-warm-gray-600 mt-1">{t(`purposeHint.${key}`)}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-col items-center text-center">
        <label className="block text-lg font-semibold text-deep-anthracite mb-3">
          {t('amountSelect')}
        </label>
        <div className="flex items-center gap-2 max-w-xs">
          <button
            type="button"
            onClick={decrement}
            disabled={amount <= DONATION_AMOUNT_MIN}
            aria-label={t('decreaseAmount')}
            className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-papagoi-green/30 text-deep-anthracite hover:border-papagoi-green hover:bg-papagoi-green/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center justify-center transition-all"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center">
            <input
              type="number"
              inputMode="numeric"
              min={DONATION_AMOUNT_MIN}
              max={DONATION_AMOUNT_MAX}
              step={DONATION_AMOUNT_STEP}
              value={amount}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-papagoi-green/30 text-center text-xl font-semibold text-deep-anthracite focus:ring-2 focus:ring-papagoi-green focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={t('amountAria')}
            />
            <span className="ml-2 text-xl font-semibold text-deep-anthracite">€</span>
          </div>
          <button
            type="button"
            onClick={increment}
            aria-label={t('increaseAmount')}
            className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-papagoi-green/30 text-deep-anthracite hover:border-papagoi-green hover:bg-papagoi-green/10 flex items-center justify-center transition-all"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {DONATION_QUICK_AMOUNTS.map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => setAmount(quick)}
              className={`min-h-[40px] px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                amount === quick
                  ? 'border-papagoi-green bg-papagoi-green text-white'
                  : 'border-papagoi-green/30 text-deep-anthracite hover:border-papagoi-green hover:bg-papagoi-green/10'
              }`}
            >
              {quick} €
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="donation-name" className="block text-sm font-medium text-deep-anthracite mb-1">
            {t('name')}
          </label>
          <input
            id="donation-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="w-full min-h-[44px] px-4 py-3 rounded-xl border border-papagoi-green/20 focus:ring-2 focus:ring-papagoi-green focus:border-transparent text-base"
            placeholder={t('namePlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="donation-email" className="block text-sm font-medium text-deep-anthracite mb-1">
            {t('email')}
          </label>
          <input
            id="donation-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full min-h-[44px] px-4 py-3 rounded-xl border border-papagoi-green/20 focus:ring-2 focus:ring-papagoi-green focus:border-transparent text-base"
            placeholder={t('emailPlaceholder')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="donation-comment" className="block text-sm font-medium text-deep-anthracite mb-1">
          {t('comment')}
        </label>
        <textarea
          id="donation-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, DONATION_COMMENT_MAX))}
          maxLength={DONATION_COMMENT_MAX}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-papagoi-green/20 focus:ring-2 focus:ring-papagoi-green focus:border-transparent text-base"
          placeholder={t('commentPlaceholder')}
        />
        <p className="mt-1 text-xs text-warm-gray-600 text-right">
          {comment.length}/{DONATION_COMMENT_MAX}
        </p>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="donation-company">{t('companyHoneypot')}</label>
        <input
          id="donation-company"
          type="text"
          value={botField}
          onChange={(e) => setBotField(e.target.value)}
          autoComplete="off"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-xl py-2 px-4">
          {error}
        </p>
      )}

      <div className="flex items-start gap-3 bg-white border border-papagoi-green/20 rounded-xl px-4 py-3">
        <input
          id="donation-publish-name"
          type="checkbox"
          checked={publishName}
          onChange={(e) => setPublishName(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-papagoi-green/60 text-papagoi-green focus:ring-papagoi-green"
        />
        <label htmlFor="donation-publish-name" className="text-sm text-deep-anthracite text-left">
          {t('publishNameLabel')}
        </label>
      </div>

      <div className="flex items-start gap-3 bg-papagoi-beige-100 border border-papagoi-beige-300 rounded-xl px-4 py-3">
        <input
          id="donation-confirm"
          type="checkbox"
          checked={confirm}
          required
          onChange={(e) => setConfirm(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-papagoi-green/60 text-papagoi-green focus:ring-papagoi-green"
        />
        <label htmlFor="donation-confirm" className="text-sm text-deep-anthracite text-left">
          {t('confirmLabel')}
        </label>
      </div>

      <p className="text-sm text-deep-anthracite/70 text-center">{t('montonioNotice')}</p>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading || !confirm || !purpose}
          className="w-full sm:w-auto papagoi-cta disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Heart className="w-5 h-5 mr-2" />
          {loading ? t('submitting') : t('submit', { amount })}
        </button>
      </div>

      <p className="text-xs text-warm-gray-600 text-center">{t('privacyNote')}</p>
    </form>
  )
}
