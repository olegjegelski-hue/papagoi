
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Toaster } from 'sonner'
import LocalBusinessSchema from '@/components/LocalBusinessSchema'
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
