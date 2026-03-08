import { Home, Feather, Heart, Building, Sparkles, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'

import type { Metadata } from 'next'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata: Metadata = {
  title: 'Meist - Papagoi Keskus Tartus | Eesti esimene papagoidekeskus',
  description: 'Papagoi Keskus on üle 50 papagoi pere Tartus. Meie lugu, 50m² papagoide tuba, 15+ liiki, hügieen ja hooldus. Külastus ja kinkekaart. Eesti esimene papagoidekeskus alates 2015.',
  keywords: 'Papagoi Keskus meie lugu, Eesti esimene papagoidekeskus, Papagoi Keskus ajalugu, papagoidekeskus Tartus, kinkekaart',
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
    <div className="min-h-screen bg-gradient-to-b from-papagoi-beige-50 via-papagoi-beige to-papagoi-green-50/50">
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
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meie lugu</h2>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite mb-6 first-letter:text-6xl first-letter:font-bold first-letter:text-papagoi-green first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                  Papagoi Keskus asutati aastal 2015 Raplamaal esimese omaniku Katarina poolt. 2017.a külastasime perega seda imelist kohta, tegime pilti peategelase Mac&apos;uga, kuulasime, kuidas Robbie &quot;Tšau!&quot; ja &quot;Hallo!&quot; ütleb ning lahkusime vaimustatud külalistena. Kes oleks võinud siis arvata, et Mac ja Robbie saavad kunagi meie pereliikmeteks. Covid sulges meie perel mitmed uksed ning ka tollane Papagoi Keskus oli raskustes. 2022.a otsustasime Papagoi Keskuse üle võtta ja sellest ajast oleme tegutsenud Tartus oma eramajas ning kõik linnud on saanud võrdseteks pereliikmeteks nii nagu meie koer, küülikud, merisead, kameeleonid või kassid.
                </p>
                
                <p className="text-lg md:text-xl leading-relaxed text-deep-anthracite mb-6">
                  Kuigi Papagoi Keskuse lugu algas kolme peategelasega – hetkel 11-aastase aara Maci, 23-aastase aafrika hallpapagoi Robbie ja 23-aastase kaeluspapagoi Lucasega –, on sellest tänaseks kasvanud üle 50-liikmeline papagoipere. Esindatud on ligi 15 erinevat liiki.
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
          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-12">
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
                    Kogu keskus asub meie perekodu ruumides. See on tõeline kodu, kus papagoid elavad koos perega, mitte eraldi hoones või aiamajakeses.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Feather className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">50 m² papagoituba</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Suur, valgusrikas spetsiaalsete UV valgustitega ruum, kus lindudel on ronimisalad erinevate okstega, mänguasjad ja palju ruumi lendamiseks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {false && (
            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl overflow-hidden mb-12">
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
          )}

          {/* Külastusprogramm */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Külasta meid!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Tule külla ja tutvu meie suure perega!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/broneeri"
                className="papagoi-cta-white inline-flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Broneeri külastus
              </Link>
              <Link
                href="/teenused"
                className="papagoi-cta-outline inline-flex items-center justify-center"
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
