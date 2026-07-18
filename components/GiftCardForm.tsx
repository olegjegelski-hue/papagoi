'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Gift, ChevronUp, ChevronDown } from 'lucide-react'
import { trackGiftCardSubmit } from '@/lib/meta-pixel'

const STEP = 10
const MIN = 10
const MAX = 1000

function roundToStep(value: number): number {
  const rounded = Math.round(value / STEP) * STEP
  return Math.min(MAX, Math.max(MIN, rounded))
}

export default function GiftCardForm() {
  const locale = useLocale()
  const [amount, setAmount] = useState<number>(10)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [botField, setBotField] = useState('') // honeypot

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/gift-card-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          amount,
          confirm,
          botField,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Tellimus ebaõnnestus')
        return
      }
      trackGiftCardSubmit({ value: amount })
      setSubmitted(true)
    } catch {
      setError('Ühendusviga. Proovi uuesti või võta ühendust.')
    } finally {
      setLoading(false)
    }
  }

  const increment = () => setAmount((a) => Math.min(MAX, a + STEP))
  const decrement = () => setAmount((a) => Math.max(MIN, a - STEP))
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!Number.isNaN(v)) setAmount(roundToStep(v))
  }
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (Number.isNaN(v) || v < MIN) setAmount(MIN)
    else if (v > MAX) setAmount(MAX)
    else setAmount(roundToStep(v))
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <p className="text-xl font-semibold text-green-800 mb-2">Täname!</p>
        <p className="text-deep-anthracite/80">
          Tellimus on kinnitatud. Saatsime kinnituskirja teie e-postile. Koopia saadeti ka Papagoi Keskusele. Võtame peagi ühendust kinkekaardi maksmise ja vormistamise osas.
        </p>
        <p className="text-sm text-deep-anthracite/60 mt-4">
          Küsimuste korral: <a href="tel:+3725127938" className="text-papagoi-green hover:underline">+372 512 7938</a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <label className="block text-lg font-semibold text-deep-anthracite mb-3">
          Vali kinkekaardi väärtus (10 € = 1 külastus)
        </label>
        <div className="flex items-center gap-2 max-w-xs">
          <button
            type="button"
            onClick={decrement}
            disabled={amount <= MIN}
            aria-label="Vähenda summat"
            className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-papagoi-green/30 text-deep-anthracite hover:border-papagoi-green hover:bg-papagoi-green/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center justify-center transition-all"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center">
            <input
              type="number"
              min={MIN}
              step={STEP}
              value={amount}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-full px-4 py-3 rounded-xl border-2 border-papagoi-green/30 text-center text-xl font-semibold text-deep-anthracite focus:ring-2 focus:ring-papagoi-green focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Summa eurodes"
            />
            <span className="ml-2 text-xl font-semibold text-deep-anthracite">€</span>
          </div>
          <button
            type="button"
            onClick={increment}
            aria-label="Suurenda summat"
            className="flex-shrink-0 w-12 h-12 rounded-xl border-2 border-papagoi-green/30 text-deep-anthracite hover:border-papagoi-green hover:bg-papagoi-green/10 flex items-center justify-center transition-all"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>
        <p className="mt-2 text-warm-gray-600 text-sm">
          {amount} € = {amount / 10} külastust (maksimaalselt {MAX} €)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="gift-name" className="block text-sm font-medium text-deep-anthracite mb-1">
            Nimi
          </label>
          <input
            id="gift-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-papagoi-green/20 focus:ring-2 focus:ring-papagoi-green focus:border-transparent"
            placeholder="Nimi"
          />
        </div>
        <div>
          <label htmlFor="gift-phone" className="block text-sm font-medium text-deep-anthracite mb-1">
            Tel
          </label>
          <input
            id="gift-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-papagoi-green/20 focus:ring-2 focus:ring-papagoi-green focus:border-transparent"
            placeholder="+372 5xxx xxxx"
          />
        </div>
        <div>
          <label htmlFor="gift-email" className="block text-sm font-medium text-deep-anthracite mb-1">
            E-post
          </label>
          <input
            id="gift-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-papagoi-green/20 focus:ring-2 focus:ring-papagoi-green focus:border-transparent"
            placeholder="email@näide.ee"
          />
        </div>
      </div>

      {/* Honeypot väli robotite vastu – inimkasutajale ei kuvata */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="gift-company">Ettevõte</label>
        <input
          id="gift-company"
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

      <div className="flex items-start gap-3 bg-papagoi-beige-100 border border-papagoi-beige-300 rounded-xl px-4 py-3">
        <input
          id="gift-confirm"
          type="checkbox"
          checked={confirm}
          required
          onChange={(e) => setConfirm(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-papagoi-green/60 text-papagoi-green focus:ring-papagoi-green"
        />
        <label htmlFor="gift-confirm" className="text-sm text-deep-anthracite text-left">
          Kinnitan, et soovin päriselt kinkekaarti ja see ei ole test ega roboti tehtud päring.
        </label>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading || !confirm}
          className="w-full sm:w-auto papagoi-cta disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Gift className="w-5 h-5 mr-2" />
          {loading ? 'Saadan…' : `Soovin kinkekaarti (${amount} €)`}
        </button>
      </div>
    </form>
  )
}
