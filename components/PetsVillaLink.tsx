'use client'

import type { ReactNode } from 'react'
import { trackPetsVillaClick } from '@/lib/meta-pixel'

type Props = {
  children: ReactNode
  className?: string
  source?: string
}

export default function PetsVillaLink({ children, className, source }: Props) {
  return (
    <a
      href="https://petsvilla.ee"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackPetsVillaClick(source)}
    >
      {children}
    </a>
  )
}
