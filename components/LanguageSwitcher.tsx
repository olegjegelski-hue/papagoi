'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import { ChevronDown } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useScrollLock } from '@/hooks/use-scroll-lock'

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

const MENU_GAP = 4
const VIEWPORT_PADDING = 8
const ROW_HEIGHT = 44
const MENU_CHROME = 8

export default function LanguageSwitcher() {
  const t = useTranslations('Nav')
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ visibility: 'hidden' })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'et'

  useScrollLock(isOpen)

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const viewTop = window.visualViewport?.offsetTop ?? 0
    const viewLeft = window.visualViewport?.offsetLeft ?? 0
    const viewWidth = window.visualViewport?.width ?? window.innerWidth
    const viewHeight = window.visualViewport?.height ?? window.innerHeight
    const viewBottom = viewTop + viewHeight
    const viewRight = viewLeft + viewWidth

    const spaceBelow = viewBottom - rect.bottom - VIEWPORT_PADDING
    const spaceAbove = rect.top - viewTop - VIEWPORT_PADDING
    const estimatedHeight = languages.length * ROW_HEIGHT + MENU_CHROME
    const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow
    const maxHeight = Math.max(ROW_HEIGHT, Math.floor((openUp ? spaceAbove : spaceBelow) - MENU_GAP))
    const usedHeight = Math.min(estimatedHeight, maxHeight)

    const minWidth = 128
    const width = Math.max(minWidth, rect.width)
    const left = Math.min(
      Math.max(viewLeft + VIEWPORT_PADDING, rect.right - width),
      viewRight - width - VIEWPORT_PADDING
    )

    setMenuStyle({
      position: 'fixed',
      top: openUp ? rect.top - MENU_GAP - usedHeight : rect.bottom + MENU_GAP,
      left,
      width,
      maxHeight,
      overflowY: 'auto',
      zIndex: 61,
      visibility: 'visible',
    })
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return
    updateMenuPosition()

    const update = () => updateMenuPosition()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [isOpen, updateMenuPosition])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return
      setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isOpen])

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
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-11 items-center gap-0.5 px-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded hover:opacity-90"
        style={!('stripe' in current && current.stripe) ? { color: current.color } : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('chooseLanguage')}
      >
        <span>{renderLabel(current)}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {isOpen &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            data-scroll-lock-scrollable=""
            className="min-w-[8rem] py-1 bg-papagoi-beige-100 border border-papagoi-beige-300 rounded-lg shadow-lg overflow-y-auto overscroll-contain"
            style={menuStyle}
          >
              {languages.map((lang) => (
                <li key={lang.code} role="option" aria-selected={locale === lang.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full h-11 text-left pl-5 pr-4 text-sm font-medium transition-opacity hover:opacity-90 ${
                      locale === lang.code ? 'bg-black/5' : 'hover:bg-black/5'
                    }`}
                    style={
                      'stripe' in lang && lang.stripe
                        ? { borderLeft: `3px solid ${lang.color}` }
                        : { color: lang.color, borderLeft: `3px solid ${lang.color}` }
                    }
                  >
                    {renderLabel(lang)}
                  </button>
                </li>
              ))}
            </ul>,
          document.body
        )}
    </div>
  )
}
