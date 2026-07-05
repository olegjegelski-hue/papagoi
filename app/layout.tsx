
import type { Metadata } from 'next'
import { Nunito, Open_Sans } from 'next/font/google'
import MetaPixel from '@/components/MetaPixel'
import './globals.css'

const FB_PIXEL_ID = process.env.META_PIXEL_ID

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})
const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  verification: {
    google: 'CPr-Db3uIhvMR38RI3_ligyrF_GVfUv6706fjQAWDpM',
    other: {
      'facebook-domain-verification': 'ytdul5bednhzp0b5mqea9rfibg7c3d',
    },
  },
  title: 'Papagoi Keskus – Elu täis värve ja hääli',
  description: 'Tule külasta Papagoi Keskust Tartus! Üle 50 papagoi, broneeri külastus või osta digitaalne kinkekaart. Giidiga ekskursioonid, sünnipäevad, grupikülastused. Eesti esimene papagoidekeskus alates 2015.',
  keywords: 'papagoi, papagoid keskus, Papagoi Keskus Tartus, külastus, kinkekaart, broneeri, pered, koolid, lasteaiad, papagoidekeskus, Eesti',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Papagoi Keskus – Elu täis värve ja hääli',
    description: 'Eesti esimene papagoidekeskus Tartus. Broneeri külastus või kingi kinkekaart. Üle 50 papagoi.',
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  themeColor: '#039BE5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="et" className="scroll-smooth">
      <body className={`${nunito.variable} ${openSans.variable} font-sans flex flex-col min-h-screen`}>
        {FB_PIXEL_ID ? <MetaPixel pixelId={FB_PIXEL_ID} /> : null}
        {children}
      </body>
    </html>
  )
}
