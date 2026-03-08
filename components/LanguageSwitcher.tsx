'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/navigation'

// Lipu värvid: Eesti horisontaalselt 1/3 sinine, 1/3 must, 1/3 valge
const EST_STRIPE =
  'linear-gradient(to bottom, #0072CE 0%, #0072CE 33.33%, #000 33.33%, #000 66.66%, #fff 66.66%, #fff 100%)'
// Vene lipp: 1/3 valge, 1/3 sinine, 1/3 punane
const RUS_STRIPE =
  'linear-gradient(to bottom, #fff 0%, #fff 33.33%, #0039A6 33.33%, #0039A6 66.66%, #D52B1E 66.66%, #D52B1E 100%)'
// Briti lipp (Union Jack): pilt paistab läbi tähtede
const ENG_FLAG_BG = "url('/union-jack.png')"

const languages = [
  { code: 'et', label: 'EST', color: '#0072CE', stripe: EST_STRIPE },
  { code: 'en', label: 'ENG', color: '#012169', bgImage: ENG_FLAG_BG },
  { code: 'ru', label: 'RUS', color: '#D52B1E', stripe: RUS_STRIPE },
] as const

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'et'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = languages.find((l) => l.code === locale) ?? languages[0]

  const handleSelect = (code: string) => {
    if (code === locale) {
      setIsOpen(false)
      return
    }
    setIsOpen(false)
    router.replace(pathname, { locale: code })
  }

  const renderLabel = (lang: (typeof languages)[number]) => {
    if ('bgImage' in lang && lang.bgImage) {
      return (
        <span
          className="inline-block"
          style={{
            backgroundImage: lang.bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(0,0,0,0.7)',
            paintOrder: 'stroke fill',
          }}
        >
          {lang.label}
        </span>
      )
    }
    if ('stripe' in lang && lang.stripe) {
      return (
        <span
          className="inline-block"
          style={{
            background: lang.stripe,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {lang.label}
        </span>
      )
    }
    return lang.label
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-0.5 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded hover:opacity-90"
        style={!('stripe' in current && current.stripe) ? { color: current.color } : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Vali keel"
      >
        <span>{renderLabel(current)}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-[8rem] py-1 bg-papagoi-beige-100 border border-papagoi-beige-300 rounded-lg shadow-lg z-50"
        >
          {languages.map((lang) => (
            <li key={lang.code} role="option" aria-selected={locale === lang.code}>
              <button
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left pl-5 pr-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${
                  locale === lang.code ? 'bg-black/5' : 'hover:bg-black/5'
                }`}
                style={
                  'stripe' in lang && lang.stripe
                    ? { borderLeft: `3px solid ${lang.color}` }
                    : { color: lang.color, borderLeft: `3px solid ${lang.color}` }
                }
                disabled={false}
                title={undefined}
              >
                {renderLabel(lang)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
