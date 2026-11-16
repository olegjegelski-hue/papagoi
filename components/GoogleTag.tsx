'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import {
  hasMarketingConsent,
  onConsentChange,
  type CookieConsent,
} from '@/lib/cookie-consent'
import { isValidGoogleAdsId } from '@/lib/google-ads'

type Props = {
  adsId: string
}

function revokeGoogleTagConsent() {
  try {
    window.gtag?.('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    })
  } catch {
    // ignore
  }
}

export default function GoogleTag({ adsId }: Props) {
  const [allowed, setAllowed] = useState(false)
  const safeId = adsId.trim()
  const validId = isValidGoogleAdsId(safeId)

  useEffect(() => {
    setAllowed(hasMarketingConsent())

    return onConsentChange((consent: CookieConsent) => {
      if (consent.marketing) {
        setAllowed(true)
      } else {
        revokeGoogleTagConsent()
        setAllowed(false)
      }
    })
  }, [])

  if (!allowed || !validId) return null

  return (
    <>
      <Script
        id="google-tag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(safeId)}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-tag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${safeId}');
          `,
        }}
      />
    </>
  )
}
