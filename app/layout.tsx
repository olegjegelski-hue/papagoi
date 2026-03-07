
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Toaster } from 'sonner'
import LocalBusinessSchema from '@/components/LocalBusinessSchema'
import TouristAttractionSchema from '@/components/TouristAttractionSchema'
import CookieBanner from '@/components/CookieBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  verification: {
    google: 'CPr-Db3uIhvMR38RI3_ligyrF_GVfUv6706fjQAWDpM',
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
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="et" className="scroll-smooth">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <LocalBusinessSchema />
        <TouristAttractionSchema />
        <Navigation />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
