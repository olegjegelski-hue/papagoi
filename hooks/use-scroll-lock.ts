'use client'

import { useEffect } from 'react'

export const SCROLL_LOCK_SCROLLABLE = 'data-scroll-lock-scrollable'

let lockCount = 0

function isInsideScrollable(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(`[${SCROLL_LOCK_SCROLLABLE}]`))
}

function preventBackgroundScroll(event: TouchEvent | WheelEvent) {
  if (!isInsideScrollable(event.target)) {
    event.preventDefault()
  }
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    lockCount += 1
    if (lockCount === 1) {
      document.documentElement.classList.add('scroll-locked')
      document.addEventListener('touchmove', preventBackgroundScroll, { passive: false })
      document.addEventListener('wheel', preventBackgroundScroll, { passive: false })
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        document.documentElement.classList.remove('scroll-locked')
        document.removeEventListener('touchmove', preventBackgroundScroll)
        document.removeEventListener('wheel', preventBackgroundScroll)
      }
    }
  }, [locked])
}
