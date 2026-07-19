'use client'

import { useEffect } from 'react'

/** Kerib ankrule pärast client-navigatsiooni nii, et sticky nav ei kata sektsiooni pealkirja. */
export default function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))

    const scrollToAnchor = () => {
      const el = document.getElementById(id)
      if (!el) return
      const nav = document.querySelector('nav')
      const navHeight = nav instanceof HTMLElement ? nav.getBoundingClientRect().height : 0
      // natuke õhku pealkirja kohale (nav + 12px)
      const offset = navHeight + 12
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }

    // layout / fontid: korduvalt pärast paint’i
    requestAnimationFrame(() => {
      scrollToAnchor()
      window.setTimeout(scrollToAnchor, 150)
      window.setTimeout(scrollToAnchor, 400)
    })
  }, [])

  return null
}
