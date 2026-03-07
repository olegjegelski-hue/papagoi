import Link from 'next/link'
import { Gift, QrCode, Calendar } from 'lucide-react'
import GiftCardForm from '@/components/GiftCardForm'
import type { Metadata } from 'next'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata: Metadata = {
  title: 'Kinkekaart - Papagoi Keskus Tartus | Kingi külastus',
  description: 'Osta Papagoi Keskuse digitaalne kinkekaart. 10 € = 1 külastus. Vali summa 10 € sammuga. Ideaalse kingituseks sünnipäevaks või juubeliks. Kiire tellimine ja kinnitus e-kirjaga.',
  keywords: 'kinkekaart Papagoi Keskus, kingi külastus, papagoidekeskus kinkekaart, Tartu kinkekaart, digitaalne kinkekaart, kingi elamus',
  alternates: {
    canonical: `${getSiteUrl()}/kinkekaart`,
  },
  openGraph: {
    title: 'Kinkekaart - Papagoi Keskus Tartus',
    description: 'Kingi külastus Papagoi Keskuses. Digitaalne kinkekaart 10 € sammuga. Sünnipäevaks või juubeliks.',
    type: 'website',
    locale: 'et_EE',
    url: `${getSiteUrl()}/kinkekaart`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Kinkekaart - Papagoi Keskus Tartus',
    description: 'Kingi külastus Papagoi Keskuses. Digitaalne kinkekaart 10 € sammuga.',
    images: ['/logo.png'],
  },
}

export default function KinkekaartPage() {
  return (
    <div className="min-h-screen bg-papagoi-beige-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">
              Kinkekaart
            </span>
          </h1>
          <p className="text-xl text-deep-anthracite-700 max-w-3xl mx-auto">
            Kingi lähedasele külastus Papagoi Keskuses. Digitaalne kinkekaart on ideaalne sünnipäevaks,
            juubeliks või lihtsalt hea meele tegemiseks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main: gift card offer + form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-papagoi-green/10">
              <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue p-8 text-white text-center">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl md:text-3xl font-bold">Digitaalne kinkekaart</h2>
              </div>
              <div className="p-8">
                <GiftCardForm />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Kuidas see töötab */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-papagoi-green/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">Kuidas see töötab?</h3>
              <ol className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-papagoi-green/20 text-papagoi-green font-bold flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-deep-anthracite">Vali summa</p>
                    <p className="text-warm-gray-600 text-sm">10 €, 20 €, 30 € jne – iga 10 € = üks külastus</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-papagoi-blue/20 text-papagoi-blue font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-deep-anthracite">Täida vorm</p>
                    <p className="text-warm-gray-600 text-sm">Võtame ühendust kinkekaardi vormistamise ja maksmise osas</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-papagoi-orange/20 text-papagoi-orange font-bold flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-deep-anthracite">Saad kinkekaardi</p>
                    <p className="text-warm-gray-600 text-sm">Digitaalne kaart QR-koodiga; saaja broneerib külastuse endale sobival ajal</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* QR-kood ja kasutamine */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-papagoi-blue/10">
              <div className="flex items-center space-x-3 mb-4">
                <QrCode className="w-6 h-6 text-papagoi-blue" />
                <h3 className="text-xl font-bold text-deep-anthracite">QR-kood</h3>
              </div>
              <p className="text-warm-gray-700 text-sm">
                Igal kinkekaardil on unikaalne kood. Külastuse ajal tuvastame kaardi kiiresti ja märgime kasutatuks.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-papagoi-green/10">
              <h3 className="text-xl font-bold text-deep-anthracite mb-4">Küsimused?</h3>
              <div className="space-y-3">
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-green">Telefon:</strong>{' '}
                  <a href="tel:+3725127938" className="hover:underline">+372 512 7938</a>
                </p>
                <p className="text-warm-gray-700">
                  <strong className="text-papagoi-blue">E-post:</strong> keskus@papagoi.ee
                </p>
              </div>
            </div>

            {/* CTA Broneeri */}
            <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-2xl p-6 text-white text-center">
              <p className="font-semibold mb-4">Kinkekaardi saaja soovib aega broneerida?</p>
              <Link
                href="/broneeri"
                className="papagoi-cta-white inline-flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Broneeri külastus
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
