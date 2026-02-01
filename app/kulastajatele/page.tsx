import { Clock, MapPin, Euro, Users, Camera, Shield, AlertCircle, Phone, Calendar, CheckCircle, XCircle, Info, GraduationCap, Building, Heart, Car, Baby } from 'lucide-react'
import Link from 'next/link'
import VisitProcess from '@/components/VisitProcess'

import type { Metadata } from 'next'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata: Metadata = {
  title: 'Külastajatele - Papagoi Keskus Tartus | Info, reeglid, hinnad',
  description: 'Kõik vajalik info Papagoi Keskuse külastamiseks Tartus. Lahtiolekuajad: E-P 12-18. Hinnad, reeglid, parkimine ja praktiline info külastuseks. Külastus broneerimisega.',
  keywords: 'Papagoi Keskus külastajatele, külastus broneerimisega Tartus, papagoide külastus info, Papagoi Keskus reeglid, perepuhkus Tartu, lapsesõbralik tegevus Tartu, kus saab papagoid näha Eestis, papagoidega fotod Tartu',
  alternates: {
    canonical: `${getSiteUrl()}/kulastajatele`,
  },
  openGraph: {
    title: 'Külastajatele - Papagoi Keskus Tartus',
    description: 'Kõik vajalik info Papagoi Keskuse külastamiseks Tartus. Lahtiolekuajad: E-P 12-18.',
    type: 'website',
    locale: 'et_EE',
    url: `${getSiteUrl()}/kulastajatele`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Külastajatele - Papagoi Keskus Tartus',
    description: 'Kõik vajalik info Papagoi Keskuse külastamiseks Tartus.',
    images: ['/logo.png'],
  },
}

export default function VisitorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-gray-50 via-white to-papagoi-green-50/50">
      <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Külastajatele - Papagoi Keskus Tartus</span>
            </h1>
            <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">
              Kõik vajalik info meeldejäävaks kogemuseks meie papagoidekeskuses. See on lapsesõbralik tegevus Tartus ja tore
              perepuhkus Tartus. Külastus broneerimisega – broneeri külastus juba täna!
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-8 mb-12 shadow-lg">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-4">⚠️ OLULINE!</h3>
                <div className="text-amber-800 space-y-3 text-lg">
                  <p><strong>Külastused toimuvad AINULT eelneval kokkuleppel!</strong></p>
                  <p>Meie keskus asub eraomanduses ja ilma broneeringuta ei ole külastused võimalikud.</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <a href="tel:+3725127938" className="font-semibold hover:underline">+372 512 7938</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-t-4 border-green-500">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Lahtiolekuajad</h3>
              <p className="text-gray-600 font-medium">E-P 12-18</p>
              <p className="text-sm text-gray-500 mt-1">igal täistunnil</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-t-4 border-blue-500">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Grupi suurus</h3>
              <p className="text-gray-600 font-medium">kuni 20 inimest</p>
              <p className="text-sm text-gray-500 mt-1">min 3 inimest</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-t-4 border-yellow-500">
              <Euro className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Hind</h3>
              <p className="text-gray-600 font-medium">10€ inimene</p>
              <p className="text-sm text-gray-500 mt-1">ca 1 tund</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-t-4 border-purple-500">
              <Camera className="w-8 h-8 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Fotod</h3>
              <p className="text-gray-600 font-medium">Lubatud</p>
              <p className="text-sm text-gray-500 mt-1">ja soovitatud!</p>
            </div>
          </div>

          {/* Külastuse käik */}
          <VisitProcess />

          {/* Reeglid ja juhised */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              Reeglid ja juhised
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">✅ Lubatud:</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Fotode ja videote tegemine</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Papagoidega suhtlemine järelevalve all</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Küsimuste esitamine</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Rahulik käitumine</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Papagoide toitmine (ainult loa korral)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center mb-4">
                  <XCircle className="w-6 h-6 text-red-600 mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">❌ Keelatud:</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Liiga vali käitumine</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Papagoidele stressseisukordade tekitamine</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Puude vastu koputamine</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Papagoidele toidu andmine ilma loata</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 font-bold mt-1">•</span>
                    <span>Loomade tõrjumine või hirmutamine</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Info className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">🎒 Soovitused:</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Kandke mugavaid riideid</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Vältige teravaid ehteid</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Võtke kaasa fotoaparaat</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Tulge avatud meelega</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Külastus on ca 1 tund</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Väikelapsed ja ohutus */}
            <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center mb-4">
                <Baby className="w-6 h-6 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-gray-800 text-lg">👶 Väikelapsed ja ohutus:</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600 font-bold mt-1">•</span>
                  <span>Vanemad peavad jälgima oma lapsi kogu külastuse ajal</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600 font-bold mt-1">•</span>
                  <span>Ohutus nii lindudele kui lastele on meie prioriteet</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600 font-bold mt-1">•</span>
                  <span>Väikelapsed peavad käituma rahulikult ja järgima juhiseid</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Praktiline info külastuseks */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Info className="w-6 h-6 text-green-600 mr-2" />
              Praktiline info külastuseks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Parkimine */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <Car className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">🚗 Parkimine:</h3>
                </div>
                <p className="text-gray-700">
                  Parkimine maja ees. Palun järgige parkimisjuhiseid ja jätke piisavalt ruumi teiste külastajate jaoks.
                </p>
              </div>

              {/* Hilinemine */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">⏰ Hilinemine:</h3>
                </div>
                <p className="text-gray-700">
                  Kui teate, et hilinete, palun andke meile teada telefoni teel: <a href="tel:+3725127938" className="text-orange-600 font-semibold hover:underline">+372 512 7938</a>
                </p>
              </div>

              {/* Maksmine */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Euro className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">💳 Maksmine:</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Maksmine toimub peale üritust</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Makseviisid: sularaha (pangaterminal puudub)</span>
                  </li>
                </ul>
              </div>

              {/* Tühistamine */}
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center mb-4">
                  <XCircle className="w-6 h-6 text-red-600 mr-2" />
                  <h3 className="font-semibold text-gray-800 text-lg">❌ Tühistamine:</h3>
                </div>
                <p className="text-gray-700">
                  Tühistamiseks palun teatage vähemalt <strong>24 tundi ette</strong> telefoni teel: <a href="tel:+3725127938" className="text-red-600 font-semibold hover:underline">+372 512 7938</a>
                </p>
              </div>

            </div>
          </div>


          {/* Grupikülastused Section */}
          <div className="my-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-deep-anthracite mb-4">
                <span className="papagoi-text-gradient">Grupikülastused</span>
              </h2>
              <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">
                Pakume spetsiaalseid programme koolidele, ettevõtetele ja suurematele gruppidele. 
                Iga programm on kohandatud teie vajaduste järgi.
              </p>
            </div>

            {/* Group Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Koolid & Lasteaiad */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-papagoi-green/10">
                <div className="bg-papagoi-green p-6 text-white">
                  <div className="flex items-center space-x-4 mb-4">
                    <GraduationCap className="w-8 h-8" />
                    <div>
                      <h3 className="text-xl font-bold">Koolid & Lasteaiad</h3>
                      <p className="text-lg opacity-90">Haridusprogramm</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Grupi suurus</p>
                      <p className="text-sm font-semibold">kuni 30 last</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Kestus</p>
                      <p className="text-sm font-semibold">ca 60 min</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">10 eur inimene</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-deep-anthracite mb-4">Programm sisaldab:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Interaktiivne õppeprogramm</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Teaduslikud faktid papagoidest</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Õppematerjalid kaasa</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Võimalus küsimusi esitada</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Sobib kõigile vanusegruppidele</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Ettevõtted */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-papagoi-blue/10">
                <div className="bg-papagoi-blue p-6 text-white">
                  <div className="flex items-center space-x-4 mb-4">
                    <Building className="w-8 h-8" />
                    <div>
                      <h3 className="text-xl font-bold">Ettevõtted</h3>
                      <p className="text-lg opacity-90">Meeskonnaüritused</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Grupi suurus</p>
                      <p className="text-sm font-semibold">kuni 25 inimest</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Kestus</p>
                      <p className="text-sm font-semibold">ca 60 min</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">10 eur inimene</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-deep-anthracite mb-4">Programm sisaldab:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-blue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Privaatne külastus</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-blue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Paindlik ajakava</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-blue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Catering võimalus</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-blue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Fotosessioon</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-blue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Personaalne teejuht</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Suured perekonnad */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-papagoi-orange/10">
                <div className="bg-papagoi-orange p-6 text-white">
                  <div className="flex items-center space-x-4 mb-4">
                    <Users className="w-8 h-8" />
                    <div>
                      <h3 className="text-xl font-bold">Suured perekonnad</h3>
                      <p className="text-lg opacity-90">Kogunemised & Sünnipäevad</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Grupi suurus</p>
                      <p className="text-sm font-semibold">kuni 25 inimest</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Kestus</p>
                      <p className="text-sm font-semibold">ca 60 min</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">10 eur inimene</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-deep-anthracite mb-4">Programm sisaldab:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-orange rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Pühendatud aeg teile</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-orange rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Sünnipäevaprogramm</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-orange rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Grupiaktiviteedid</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-orange rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Fotovõimalused</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-orange rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Erivajaduste arvestamine</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Erivajadused */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-papagoi-red/10">
                <div className="bg-papagoi-red p-6 text-white">
                  <div className="flex items-center space-x-4 mb-4">
                    <Heart className="w-8 h-8" />
                    <div>
                      <h3 className="text-xl font-bold">Erivajadused</h3>
                      <p className="text-lg opacity-90">Kohandatud programmid</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Grupi suurus</p>
                      <p className="text-sm font-semibold">kuni 25 inimest</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Kestus</p>
                      <p className="text-sm font-semibold">ca 60 min</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">10 eur inimene</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-deep-anthracite mb-4">Programm sisaldab:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-red rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Rahulik tempo</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-red rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Kohandatud programm</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-red rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Individuaalne lähenemine</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-red rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Terapeutiline efekt</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-papagoi-red rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-deep-anthracite/80">Turvaline keskkond</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Valmis meie pere külastama?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Broneerige külastus juba täna ja kogege midagi erilist!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/broneeri"
                className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-lg inline-flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Broneeri külastus
              </Link>
              <a
                href="tel:+3725127938"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all text-lg inline-flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Helista: +372 512 7938
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
