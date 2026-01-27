'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'papagoi-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(COOKIE_CONSENT_KEY) : null;
    if (!stored) setVisible(true);
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie teade"
      className="fixed bottom-0 left-0 right-0 z-50 bg-deep-anthracite/95 text-white border-t border-papagoi-green/30 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-warm-gray-200">
            Kasutame küpsiseid (cookies), et veebileht töötaks korralikult ja et saaksime analüüsida külastuste statistikat.
            Jätkates lehe kasutamist, nõustute küpsiste kasutamisega.{' '}
            <Link href="/privaatsus" className="text-papagoi-green hover:underline">
              Lugege lähemalt
            </Link>
            .
          </p>
          <Button
            onClick={handleAccept}
            className="bg-papagoi-green hover:bg-papagoi-green/90 text-white font-semibold shrink-0 rounded-full px-6"
          >
            Nõustun
          </Button>
        </div>
      </div>
    </div>
  );
}
