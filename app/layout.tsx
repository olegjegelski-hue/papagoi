
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
  title: 'Papagoi Keskus – Elu täis värve ja hääli',
  description: 'Tule külasta Papagoi Keskust! Meie juures elab üle 50 papagoi. Broneeri külastus – räägime papagoidest, teeme koos pilti ja võimalusel saad neid ka käest toita.',
  keywords: 'papagoi, papagoid keskus, külastus, pered, koolid, lasteaiad, lemmikloomad, Eesti, broneerida',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Papagoi Keskus – Elu täis värve ja hääli',
    description: 'Tule külasta Papagoi Keskust! Broneeri külastus juba täna.',
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
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="et">
      <body className={inter.className}>
        <LocalBusinessSchema />
        <TouristAttractionSchema />
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
