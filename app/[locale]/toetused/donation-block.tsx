'use client'

import { useEffect, useState } from 'react'
import DonationForm from '@/components/DonationForm'
import { parseDonationPurpose } from '@/lib/donation'

const PURPOSE_EVENT = 'papagoi:donation-purpose'

function emitDonationPurpose(purpose: string) {
  window.dispatchEvent(new CustomEvent(PURPOSE_EVENT, { detail: purpose }))
}

export function GiftDonateLink({
  purpose,
  className,
  children,
}: {
  purpose: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <a
      href="#anneta"
      className={className}
      onClick={() => emitDonationPurpose(purpose)}
    >
      {children}
    </a>
  )
}

export default function ToetusedDonationBlock({ title }: { title: string }) {
  const [purpose, setPurpose] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fromQuery = parseDonationPurpose(
      new URLSearchParams(window.location.search).get('purpose')
    )
    if (fromQuery) setPurpose(fromQuery)

    const onPurpose = (e: Event) => {
      const parsed = parseDonationPurpose((e as CustomEvent<string>).detail)
      if (parsed) setPurpose(parsed)
    }
    window.addEventListener(PURPOSE_EVENT, onPurpose)
    return () => window.removeEventListener(PURPOSE_EVENT, onPurpose)
  }, [])

  return (
    <div id="anneta" className="scroll-mt-[12.5rem] mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="bg-card text-card-foreground border rounded-xl p-6 md:p-8 shadow-2xl">
        <DonationForm initialPurpose={purpose} />
      </div>
    </div>
  )
}
