'use client'

import { useEffect } from 'react'

/** Kerib ankrule pärast client-navigatsiooni (nt /teenused#grupikylastused). */
export default function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    // sticky nav + layout: keri pärast paint’i
    requestAnimationFrame(() => {
      scroll()
      window.setTimeout(scroll, 100)
    })
  }, [])

  return null
}
