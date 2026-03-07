import { Clock, Euro, Users, GraduationCap, Building, Heart, PartyPopper, Utensils, Feather, ExternalLink, Calendar, Phone } from 'lucide-react'
import Link from 'next/link'
import ServiceSchema from '@/components/ServiceSchema'
import GiftCardCTA from '@/components/GiftCardCTA'
import type { Metadata } from 'next'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata: Metadata = {
  title: 'Teenused - Papagoi Keskus Tartus | Külastus, kinkekaart, sünnipäev, grupikülastused',
  description: 'Papagoi Keskuse teenused: külastus 10€, digitaalne kinkekaart, sünnipäev 350€, VIP külastus, üritused papagoidega väljas, grupikülastused koolidele ja ettevõtetele. Broneeri või osta kinkekaart!',
  keywords: 'Papagoi Keskus teenused, kinkekaart, papagoid sünnipäevale, külastus broneerimisega, grupikülastused Tartus, VIP külastus, ekskursioon papagoidega, kooli ekskursioon Tartu, laste tegevused Tartu',
  alternates: {
    canonical: `${getSiteUrl()}/teenused`,
  },
  openGraph: {
    title: 'Teenused - Papagoi Keskus Tartus',
    description: 'Külastus 10€, kinkekaart, sünnipäevad, VIP külastus, grupikülastused. Broneeri või kingi kinkekaart.',
    type: 'website',
    locale: 'et_EE',
    url: `${getSiteUrl()}/teenused`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Teenused - Papagoi Keskus Tartus',
    description: 'Külastus 10€, kinkekaart, sünnipäevad, grupikülastused. Broneeri või kingi kinkekaart.',
    images: ['/logo.png'],
  },
}

export default function TeenusedPage() {
  return (
    <>
      <ServiceSchema />
      <div className="min-h-screen bg-gradient-to-b from-warm-gray-50 via-white to-papagoi-green-50/50">
        <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Teenused</span>
            </h1>
            <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">
              Kõik külastused toimuvad ainult eelneval kokkuleppel.
            </p>
          </div>

          {/* 1. PÕHITEENUS: Külastus Papagoi Keskuses */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">🦜 Külastus Papagoi Keskuses</h2>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-xl font-semibold">ca 1 tund</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6" />
                  <span className="text-xl font-semibold">10€ inimene</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6" />
                  <span className="text-xl font-semibold">kuni 20 inimest</span>
                </div>
              </div>
              <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                <p className="text-white text-sm font-medium">
                  ℹ️ Tavakülastus on minimaalselt 3 inimese jaoks
                </p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Mida külastus sisaldab?</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Peremees räägib papagoidest, nende iseloomust ja hooldusest</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Tutvumine erinevate liikidega (kohapeal 13 erinevat liiki)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Papagoide toitmine oma käest</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Pildistamine papagoidega</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Merisigade toitmine ja paitamine, tutvumine eri tõugudega (kohapeal üle 50 tõumerisea)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>Huvi korral saate näha ka pere kameeleoni või küülikuid</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Sobib kõigile:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">Eraisikud</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <GraduationCap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">Koolid</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">Lasteaiad</p>
                    <p className="text-sm text-gray-600">(kuni 30 last)</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800">Erivajadustega</p>
                    <p className="text-sm text-gray-600">asutused</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Lahtiolekuajad:</h4>
                    <p className="text-gray-700">E-P (esmaspäevast pühapäevani) kell 12-18, algusega täistunnil</p>
                    <p className="text-sm text-gray-600 mt-2">⚠️ Külastus ainult ette helistades: <a href="tel:+3725127938" className="text-blue-600 hover:underline">+372 512 7938</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. VIP KÜLASTUS */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">⭐ VIP külastus</h2>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="text-lg font-semibold">👥 3-8 külalist</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-semibold">⏱️ ca 45 min</span>
                </div>
              </div>
              <p className="text-xl opacity-90">Eksklusiivne õhtuelamus</p>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-semibold text-gray-800">📅 Privaatselt pärast sulgemisaega</span>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold mb-4 text-indigo-700 text-lg">✨ Elamus sisaldab:</h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span>Peremehe professionaalne juhendamine</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span>Papagoide käest toitmine värskete puuviljadega</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span>Privaatne ja rahulik keskkond</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-indigo-600 font-bold mt-1">•</span>
                      <span>Ainulaadne lähedus meie lindudega</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-gray-700">
                    <strong>Hind:</strong> al 50 EUR
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kinkekaart CTA */}
          <GiftCardCTA variant="service" />

          {/* 3. SÜNNIPÄEV KESKUSES */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">🎉 Sünnipäev Papagoi Keskuses</h2>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-xl font-semibold">2.5 tundi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6" />
                  <span className="text-xl font-semibold">350€</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Programm sisaldab:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-pink-600 font-bold mt-1">•</span>
                    <span><strong>2.5 tunnine programm:</strong> tutvustame papagoisid, merisigu, küülikuid ning kameeleone</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-pink-600 font-bold mt-1">•</span>
                    <span><strong>Õppimine:</strong> põnevad faktid eri liikide ja lemmikloomade kohta</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-pink-600 font-bold mt-1">•</span>
                    <span><strong>Interaktsioon:</strong> pildistamine, paitamine, küsimused</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-pink-600 font-bold mt-1">•</span>
                    <span><strong>Üllatusprogramm &quot;Laps mullis&quot;:</strong> lapsed pannakse suure seebimulli sisse ja saab teha vahvaid pilte</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-pink-600 font-bold mt-1">•</span>
                    <span><strong>Sünnipäevalaud:</strong> kasutamiseks söögituba ja köök (12 istumiskohta lauas); kaasa võtta oma toit, joogid ja ühekordsed nõud</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. ÜRITUS PAPAGOIDEGA VÄLJAS */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">🪶 Üritus papagoidega väljas</h2>
              <p className="text-xl opacity-90">Papagoid tulevad teie juurde</p>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sünnipäev, perega koosistumine, firmapidu vm sündmus</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Üllatage oma peolisi unikaalsete külalistega - elevus ja vahvad emotsioonid garanteeritud!
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-4 text-green-700 text-lg">🎭 Programm sisaldab:</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span><strong>Peremees tutvustab</strong> papagoi maailma ja räägib palju põnevat nendest imelistest sulelistest</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span><strong>Kaasas on kaks-kolm papagoid:</strong> põhitegelased aara Mac ja aafrika hall Millie 🥰</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span><strong>Papagoide interaktiivset suhtlust ning trikkide näitamist</strong></span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span><strong>Kui seltskonnas on lapsi,</strong> võtame kindlasti kaasa ka mõned kääbusküülikud ja merisead, kes ootavad paitamist</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-gray-700">
                  <strong>Hind:</strong> 250 EUR (lisandub kohalesõidutasu). Kestus ca 1 tund.
                </p>
              </div>
            </div>
          </div>

          {/* 5. GRUPIKÜLASTUSED */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">👥 Grupikülastused</h2>
              <p className="text-xl opacity-90">Koolid, lasteaiad, ettevõtted</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">Koolid & Lasteaiad</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Hariduslik programm</li>
                    <li>• Kuni 30-liikmelised grupid</li>
                    <li>• Interaktiivne õppeprogramm</li>
                    <li>• Teaduslikud faktid papagoidest</li>
                    <li>• Saatja õpetaj tasuta</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-8 h-8 text-purple-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">Ettevõtted</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Meeskonnaüritused</li>
                    <li>• Klientide meelelahutus</li>
                    <li>• Privaatne külastus</li>
                    <li>• Paindlik ajakava</li>
                    <li>• Pildistamine papagoidega</li>
                    <li>• Kuni 20-liikmelised grupid</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">
                  <strong>Hind:</strong> 10€ inimene
                </p>
              </div>
            </div>
          </div>

          {/* 6. PAPAGOIDE MÜÜK */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">🦜 Papagoide müük</h2>
              <p className="text-lg opacity-90">Võta meiega ühendust, kui soovid endale papagoid soetada</p>
            </div>
            
            <div className="p-8">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border border-orange-200 text-center">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Kui otsite papagoide või merisigade müügipakkumisi ning kasvatuse infot, vaadake meie teist kodulehte.
                  Papagoi Keskus on eelkõige koht, kuhu tulla külla ja kogeda papagoisid kohapeal.
                </p>
                <a
                  href="https://petsvilla.ee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Ava PetsVilla.ee
                </a>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Valmis külastama?
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
    </>
  )
}
