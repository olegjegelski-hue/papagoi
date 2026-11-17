'use client'

import type { ReactNode } from 'react'
import { trackPetsVillaClick } from '@/lib/meta-pixel'

export const PETSVILLA_HAY_URL =
  'https://petsvilla.ee/hein?utm_source=papagoi.ee&utm_medium=referral&utm_campaign=ristturundus'

type Props = {
  children: ReactNode
  className?: string
  source?: string
  href?: string
}

export default function PetsVillaLink({
  children,
  className,
  source,
  href = 'https://petsvilla.ee',
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackPetsVillaClick(source)}
    >
      {children}
    </a>
  )
}
