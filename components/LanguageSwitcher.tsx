'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/navigation'

const languages = [
  { code: 'et', label: 'EST' },
  { code: 'en', label: 'ENG' },
  { code: 'ru', label: 'RUS' },
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

  const currentLabel = languages.find((l) => l.code === locale)?.label ?? 'EST'

  const handleSelect = (code: string) => {
    if (code === locale) {
      setIsOpen(false)
      return
    }
    setIsOpen(false)
    router.replace(pathname, { locale: code })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-0.5 text-deep-anthracite hover:text-papagoi-green font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-papagoi-green/30 rounded"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Vali keel"
      >
        <span>{currentLabel}</span>
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
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                  locale === lang.code
                    ? 'text-papagoi-green bg-papagoi-green/10'
                    : 'text-deep-anthracite hover:text-papagoi-green hover:bg-papagoi-beige-200'
                }`}
                disabled={false}
                title={undefined}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
