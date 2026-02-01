import { Home, Users, Feather, Heart, Building, Sparkles, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'

import type { Metadata } from 'next'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata: Metadata = {
  title: 'Meist - Papagoi Keskus Tartus | Eesti esimene papagoidekeskus',
  description: 'Tutvuge Papagoi Keskusega Tartus: Eesti esimene papagoidekeskus alates 2015. Meie maja, üle 50 papagoid, umbes 40 puurivabalt lendavat lindu. Meie lugu ja visioon.',
  keywords: 'Papagoi Keskus meie lugu, Eesti esimene papagoidekeskus, Papagoi Keskus ajalugu, papagoidekeskus Tartus',
  alternates: {
    canonical: `${getSiteUrl()}/meist`,
  },
  openGraph: {
    title: 'Meist - Papagoi Keskus Tartus',
    description: 'Tutvuge Papagoi Keskusega Tartus: Eesti esimene papagoidekeskus alates 2015.',
    type: 'website',
    locale: 'et_EE',
    url: `${getSiteUrl()}/meist`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Meist - Papagoi Keskus Tartus',
    description: 'Tutvuge Papagoi Keskusega Tartus: Eesti esimene papagoidekeskus alates 2015.',
    images: ['/logo.png'],
  },
}

export default function MeistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-gray-50 via-white to-papagoi-green-50/50">
      <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Kes me oleme?</span>
            </h1>
            <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">
              Üks suur ja segane seltskond, üks suleliste ja karvaste PERE
            </p>
          </div>

          {/* Meie lugu */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meie lugu</h2>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite mb-6 first-letter:text-6xl first-letter:font-bold first-letter:text-papagoi-green first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                  Papagoi Keskus on kasvanud üle 50-liikmeliseks linnupereks, kus on esindatud 15+ erinevat papagoi liiki. Lisaks sibavad siin ringi kääbusküülikud ja merisead ning on akvaariumisein, kus ujuvad bettad, piraajad, gupid, klaassägad, põhjakoristajad, minivähjad, krevetid, teod jt. Loomulikult ei puudu ka kassid ja koer.
                </p>
                
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite mb-6">
                  "Üks pere" oleme sõna otseses mõttes, sest kõik meie karvased ja sulelised elavad pererahvaga ühises kodus, mitte õues aedikus või aiamajakestes. Meid külastades koged seda, mida igapäevane elu lemmikloomadega (ja veel sellises koguses!) toob: siutsumine, laulmine, kuskil keegi lendab üle pea, keegi (tavaliselt Millie, Mac või Robbie) tuleb õlale või laulab: "Palju õnne!" või ütleb: "I love you!", keegi kudrutab meie "linnupuul" või haugub koera häälega või hoopis haugubki meie pisike rõõmus perekoer ise 🙃
                </p>
                
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite">
                  Ja siis loomulikult veel need armsad merisead ja jänksud - karvapallid, kes kogu aeg pai lunivad. Igav ei ole meil kunagi!
                </p>
              </div>
            </div>
          </div>

          {/* Meie ruumid */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
              <div className="flex items-center justify-center space-x-3">
                <Home className="w-8 h-8" />
                <h2 className="text-3xl md:text-4xl font-bold">Meie ruumid</h2>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">Meie maja</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Kogu keskus asub meie perekodu ruumides. See on tõeline kodu, kus papagoid elavad koos perega, mitte eraldi hoone või aiamajake.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Feather className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">50 m² peamine papagoide tuba</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Suur, valgusrikas ruum, kus enamik papagoisid veedab oma aega. Siin on linnupuid, mänguasju ja palju ruumi lendamiseks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meie papagoid */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-8 text-white">
              <div className="flex items-center justify-center space-x-3">
                <Users className="w-8 h-8" />
                <h2 className="text-3xl md:text-4xl font-bold">Meie papagoid</h2>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
                  <div className="text-lg font-semibold text-gray-800">Papagoid</div>
                  <div className="text-sm text-gray-600 mt-1">meie peres</div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">~40</div>
                  <div className="text-lg font-semibold text-gray-800">Puurivabalt</div>
                  <div className="text-sm text-gray-600 mt-1">lendavad linnud</div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
                  <div className="text-lg font-semibold text-gray-800">Erinevat liiki</div>
                  <div className="text-sm text-gray-600 mt-1">papagoisid</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  Meie papagoide liigid:{' '}
                  <Link href="/papagoid" className="text-green-600 hover:underline font-semibold">
                    Meie papagoid
                  </Link>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p className="font-semibold mb-2">Suuremad papagoid:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Ara (Ara ararauna)</li>
                      <li>• Cockatoo (Cacatua spp.)</li>
                      <li>• Aafrika hall papagoi</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Keskmised ja väiksemad:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Viirpapagoid</li>
                      <li>• Nümfkakaduud</li>
                      <li>• Kaeluspapagoid</li>
                      <li>• Ja palju teisi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hügieen ja hooldus */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-600 p-8 text-white">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="w-8 h-8" />
                <h2 className="text-3xl md:text-4xl font-bold">Hügieen ja hooldus</h2>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Kuna papagoid elavad koos perega samas ruumis, on hügieen meie jaoks väga oluline. 
                Meie kodu on pidevalt puhas ja korras, et tagada nii meie kui ka papagoide tervis.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3">Igapäevane hooldus:</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Põrandate puhastamine mitu korda päevas</li>
                    <li>• Linnupuid ja mänguasjade koristamine</li>
                    <li>• Toitmisalade puhastamine</li>
                    <li>• Õhu kvaliteedi jälgimine</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3">Tervisekontrollid:</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Regulaarsed veterinaarvisiidid</li>
                    <li>• Linnude tervise jälgimine</li>
                    <li>• Karantiin uute lindude jaoks</li>
                    <li>• Tervislik toitumine ja liikumine</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Meie visioon */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="p-8 md:p-12">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <p className="text-gray-700">
                  <strong>Meie visioon:</strong> Luua Eesti parim papagoidekeskus, kus linnud saavad elada õnnelikku ja tervislikku elu, 
                  ja kus külastajad saavad kogeda midagi tõeliselt erilist. Kui soovid meid toetada, vaata meie 
                  <Link href="/ristiisa-programm" className="text-purple-600 hover:underline font-semibold"> ristiisa programmi</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Külastusprogramm */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Tule külasta meid!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Koge midagi erilist - tule meie kodusse ja tutvu meie suure perega!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/broneeri"
                className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-lg inline-flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Broneeri külastus
              </Link>
              <Link
                href="/teenused"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all text-lg inline-flex items-center justify-center"
              >
                Vaata teenuseid
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
