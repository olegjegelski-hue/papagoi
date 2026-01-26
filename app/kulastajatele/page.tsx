import { Clock, MapPin, Euro, Users, Camera, Shield, AlertCircle, Phone, Calendar, CheckCircle, XCircle, Info, GraduationCap, Building, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Külastajatele - Papagoi Keskus',
  description: 'Kõik vajalik info Papagoi Keskuse külastamiseks. Lahtiolekuajad: E-P 12-18. Hinnad, reeglid ja soovitused.',
}

export default function VisitorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-gray-50 via-white to-papagoi-green-50/50">
      <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Külastajatele</span>
            </h1>
            <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">
              Kõik vajalik info meeldejäävaks kogemuseks meie papagoidekeskuses
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
                  <p>Asukoht teatakse broneeringu kinnitamisel.</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Lahtiolekuajad */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Clock className="w-6 h-6 text-green-600 mr-2" />
                Lahtiolekuajad
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Tavaline külastus</h3>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Aktiivne</span>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Nädalapäevad:</strong> Esmaspäev - Pühapäev</p>
                    <p><strong>Kellaaeg:</strong> 12:00 - 18:00</p>
                    <p><strong>Broneerimine:</strong> Igal täistunnil (12:00, 13:00, 14:00, 15:00, 16:00, 17:00)</p>
                    <p className="text-blue-600 font-medium mt-2">ℹ️ Tavakülastus on minimaalselt 3 inimese jaoks</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Laupäev ja Pühapäev</h3>
                    <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Kokkuleppel</span>
                  </div>
                  <p className="text-gray-700">
                    Nädalavahetused on võimalikud ainult erikokkuleppel. Võtke meiega ühendust!
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      <strong>Märkus:</strong> Kuna keskus asub meie kodus, siis külastused toimuvad ainult eelneval kokkuleppel. 
                      Palun helistage või broneerige aeg ette!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hinnad */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Euro className="w-6 h-6 text-yellow-600 mr-2" />
                Hinnad
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Tavaline külastus</h3>
                    <span className="text-2xl font-bold text-green-600">10€</span>
                  </div>
                  <p className="text-gray-600 text-sm">inimene kohta</p>
                  <p className="text-gray-600 text-sm mt-2">ca 1 tund, kuni 20 inimest</p>
                  <p className="text-blue-600 text-sm mt-2 font-medium">ℹ️ Minimaalselt 3 inimest</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Grupikülastused</h3>
                    <span className="text-xl font-semibold text-blue-600">Kokkuleppel</span>
                  </div>
                  <p className="text-gray-600 text-sm">Koolid, lasteaiad, ettevõtted</p>
                </div>

                <div className="bg-pink-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Sünnipäev</h3>
                    <span className="text-2xl font-bold text-pink-600">350€</span>
                  </div>
                  <p className="text-gray-600 text-sm">2.5 tundi</p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Vihje:</strong> Suuremate gruppide ja erisoovide korral lepime külastuse detailid kokku. 
                    Võtke meiega ühendust!
                  </p>
                </div>
              </div>
            </div>
          </div>

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
          </div>

          {/* Mida oodata */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Mida külastuse ajal oodata?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Tere tulemast</h3>
                <p className="text-gray-600">
                  Tutvustame teid keskusega ja räägime meie papagoidest, nende iseloomust ja hooldusest
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Tutvumine</h3>
                <p className="text-gray-600">
                  Saate aega veeta papagoidega, toita neid oma käest (loa korral) ja teha ilusaid pilte
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Õppimine</h3>
                <p className="text-gray-600">
                  Räägime papagoidest, nende käitumisest, hooldusest ja vastame kõigile küsimustele
                </p>
              </div>
            </div>
          </div>

          {/* Grupikülastused Section */}
          <div className="my-20">
            <div className="text-center mb-16">
              <div className="w-24 h-1 bg-gradient-to-r from-papagoi-green to-papagoi-blue mx-auto mb-6"></div>
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
                      <p className="text-sm font-semibold">60-90 min</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">Kokkuleppel</p>
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
                      <p className="text-sm font-semibold">8-40 inimest</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Kestus</p>
                      <p className="text-sm font-semibold">Kokkuleppel</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">Kokkuleppel</p>
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
                      <p className="text-sm font-semibold">10-25 inimest</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Kestus</p>
                      <p className="text-sm font-semibold">45-75 min</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">Kokkuleppel</p>
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
                      <p className="text-sm font-semibold">4-15 inimest</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Kestus</p>
                      <p className="text-sm font-semibold">Individuaalne</p>
                    </div>
                    <div className="text-center">
                      <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs opacity-80">Hind</p>
                      <p className="text-sm font-semibold">Kokkuleppel</p>
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

            {/* How Group Visits Work */}
            <div className="bg-gradient-to-r from-papagoi-green/10 to-papagoi-blue/10 rounded-2xl p-12 mb-16">
              <h3 className="text-2xl font-bold text-deep-anthracite mb-8 text-center">
                Kuidas grupikülastus toimib?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-papagoi-green text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                  <h4 className="font-semibold text-deep-anthracite mb-2">Võtke ühendust</h4>
                  <p className="text-deep-anthracite/80">Täitke broneeringuvaorm või helistage otse</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-papagoi-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                  <h4 className="font-semibold text-deep-anthracite mb-2">Lepime kokku</h4>
                  <p className="text-deep-anthracite/80">Räägime läbi programmi ja aja</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-papagoi-orange text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                  <h4 className="font-semibold text-deep-anthracite mb-2">Kinnitame</h4>
                  <p className="text-deep-anthracite/80">Saate kinnituse ja täpse asukoha</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-papagoi-red text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                  <h4 className="font-semibold text-deep-anthracite mb-2">Nautige</h4>
                  <p className="text-deep-anthracite/80">Kogete unustamatut seiklust meie papagoidega</p>
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
