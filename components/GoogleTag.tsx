'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import {
  hasMarketingConsent,
  onConsentChange,
  type CookieConsent,
} from '@/lib/cookie-consent'
import {
  googleTagInlineSnippet,
  googleTagLoaderId,
  grantGoogleTagConsent,
  revokeGoogleTagConsent,
} from '@/lib/google-ads'

type Props = {
  adsId?: string
  gaId?: string
}

export default function GoogleTag({ adsId, gaId }: Props) {
  const [allowed, setAllowed] = useState(false)
  const loaderId = googleTagLoaderId(adsId, gaId)

  useEffect(() => {
    setAllowed(hasMarketingConsent())

    return onConsentChange((consent: CookieConsent) => {
      if (consent.marketing) {
        grantGoogleTagConsent()
        setAllowed(true)
      } else {
        revokeGoogleTagConsent()
        setAllowed(false)
      }
    })
  }, [])

  if (!allowed || !loaderId) return null

  return (
    <>
      <Script
        id="google-tag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(loaderId)}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-tag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: googleTagInlineSnippet(adsId, gaId),
        }}
      />
    </>
  )
}
