import { Shield, Cookie, Lock, Mail, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata: Metadata = {
  title: 'Privaatsus ja küpsised - Papagoi Keskus',
  description: 'Papagoi Keskuse privaatsuspoliitika ja küpsiste kasutamise tingimused. Lugege, kuidas me kaitstame teie isikuandmeid.',
  keywords: 'privaatsuspoliitika, küpsised, andmekaitse, GDPR, Papagoi Keskus',
  alternates: {
    canonical: `${getSiteUrl()}/privaatsus`,
  },
  openGraph: {
    title: 'Privaatsus ja küpsised - Papagoi Keskus',
    description: 'Papagoi Keskuse privaatsuspoliitika ja küpsiste kasutamise tingimused.',
    type: 'website',
    locale: 'et_EE',
    url: `${getSiteUrl()}/privaatsus`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Privaatsus ja küpsised - Papagoi Keskus',
    description: 'Papagoi Keskuse privaatsuspoliitika ja küpsiste kasutamise tingimused.',
    images: ['/logo.png'],
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-papagoi-beige-50 via-papagoi-beige to-papagoi-green-50/50">
      <main className="pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Privaatsus ja küpsised
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meie kohustus kaitsta teie isikuandmeid ja privaatsust
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Viimati uuendatud: {new Date().toLocaleDateString('et-EE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* 1. Sissejuhatus */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 text-green-600 mr-2" />
              1. Sissejuhatus
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Papagoi Keskus (Koduinfo OÜ, reg. nr. 11105156) väärtustab teie privaatsust ja kaitseb teie isikuandmeid vastavalt Eesti Vabariigi seadustele ja Euroopa Liidu üldisele andmekaitse määrusele (GDPR).
              </p>
              <p className="text-gray-700 leading-relaxed">
                See privaatsuspoliitika selgitab, kuidas me kogume, kasutame, säilitame ja kaitseme teie isikuandmeid, kui külastate meie veebilehte või kasutate meie teenuseid.
              </p>
            </div>
          </div>

          {/* 2. Andmekontroller */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              2. Andmekontroller
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Andmekontroller:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Koduinfo OÜ</li>
                <li>Registrikood: 11105156</li>
                <li>Aadress: Tartu mnt 80, Soinaste, Kambja vald, Tartumaa 61709, Eesti</li>
                <li>E-post: <a href="mailto:keskus@papagoi.ee" className="text-green-600 hover:underline">keskus@papagoi.ee</a></li>
                <li>Telefon: <a href="tel:+3725127938" className="text-green-600 hover:underline">+372 512 7938</a></li>
              </ul>
            </div>
          </div>

          {/* 3. Kogutavad andmed */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Lock className="w-6 h-6 text-purple-600 mr-2" />
              3. Milliseid isikuandmeid me kogume?
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1. Kontaktvormi kaudu</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kui saadate meile sõnumi kontaktvormi kaudu, kogume järgmisi andmeid:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Nimi</li>
                <li>E-posti aadress</li>
                <li>Telefoninumber</li>
                <li>Sõnumi sisu</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2. Broneeringu vormi kaudu</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kui broneerite külastust, kogume järgmisi andmeid:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Nimi</li>
                <li>E-posti aadress</li>
                <li>Telefoninumber</li>
                <li>Broneeringu kuupäev ja kellaaeg</li>
                <li>Grupi suurus</li>
                <li>Lisainfo (valikuline)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3. Veebilehe külastamise ajal</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Meie veebileht võib automaatselt koguda tehnilisi andmeid:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>IP-aadress</li>
                <li>Brauseri tüüp ja versioon</li>
                <li>Lehe külastamise aeg ja kestus</li>
                <li>Lingitud lehed</li>
              </ul>
            </div>
          </div>

          {/* 4. Andmete kasutamise eesmärgid */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              4. Milleks me teie andmeid kasutame?
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Teie isikuandmeid kasutame järgmistel eesmärkidel:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Kontaktile vastamine:</strong> Teie küsimustele ja päringutele vastamiseks</li>
                <li><strong>Broneeringute töötlemine:</strong> Külastuste planeerimiseks ja kinnitamiseks</li>
                <li><strong>Teenuste pakkumine:</strong> Meie teenuste osutamiseks ja täiustamiseks</li>
                <li><strong>Seaduslikud kohustused:</strong> Seaduslike nõuete täitmiseks</li>
                <li><strong>Veebilehe analüüs:</strong> Lehe kasutamise analüüsimiseks ja parandamiseks</li>
              </ul>
            </div>
          </div>

          {/* 5. Andmete säilitamine */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              5. Kui kaua me teie andmeid säilitame?
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Teie isikuandmeid säilitame ainult nii kaua, kui see on vajalik:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Kontaktvormi andmed:</strong> Kuni 3 aastat pärast viimast kontakti</li>
                <li><strong>Broneeringu andmed:</strong> Kuni 2 aastat pärast külastust</li>
                <li><strong>Tehnilised andmed:</strong> Kuni 1 aasta</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Pärast säilitamise tähtaega kustutame teie andmed turvaliselt.
              </p>
            </div>
          </div>

          {/* 6. Andmete jagamine */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              6. Kas me jagame teie andmeid kolmandate osapooltega?
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Me ei müü ega rendi teie isikuandmeid kolmandate osapooltega. Me võime jagada teie andmeid ainult järgmistel juhtudel:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Kui see on vajalik seaduslike kohustuste täitmiseks</li>
                <li>Kui me kasutame usaldusväärseid teenusepakkujaid (nt e-posti teenused), kes töötlevad andmeid meie nimel ja vastavalt meie juhistele</li>
                <li>Kui see on vajalik teie või teiste füüsilise isiku elu, tervise või vara kaitsmiseks</li>
              </ul>
            </div>
          </div>

          {/* 7. Teie õigused */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              7. Teie õigused
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Vastavalt GDPR-le on teil järgmised õigused:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>Õigus teabele:</strong> Saate teada, milliseid andmeid me teie kohta kogume</li>
                <li><strong>Õigus juurdepääsule:</strong> Saate küsida oma isikuandmete koopia</li>
                <li><strong>Õigus parandamisele:</strong> Saate nõuda oma andmete parandamist</li>
                <li><strong>Õigus kustutamisele:</strong> Saate nõuda oma andmete kustutamist</li>
                <li><strong>Õigus piirata töötlemist:</strong> Saate nõuda andmete töötlemise piirata</li>
                <li><strong>Õigus andmete ülekandmisele:</strong> Saate nõuda oma andmete ülekandmist</li>
                <li><strong>Õigus vastu vaidlustada:</strong> Saate vaidlustada oma andmete töötlemise</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Oma õiguste kasutamiseks võtke meiega ühendust: <a href="mailto:keskus@papagoi.ee" className="text-green-600 hover:underline">keskus@papagoi.ee</a> või <a href="tel:+3725127938" className="text-green-600 hover:underline">+372 512 7938</a>.
              </p>
            </div>
          </div>

          {/* 8. Küpsised (Cookies) */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Cookie className="w-6 h-6 text-yellow-600 mr-2" />
              8. Küpsised (Cookies)
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">8.1. Mis on küpsised?</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Küpsised on väikesed tekstifailid, mis salvestatakse teie seadmesse (arvutisse, tahvelarvutisse või nutitelefoni), kui te külastate veebilehte. Küpsised võimaldavad veebilehel meeles pidada teie valikuid ja parandada teie kasutajakogemust.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">8.2. Milliseid küpsiseid me kasutame?</h3>
              
              <div className="bg-blue-50 rounded-xl p-6 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Vajalikud küpsised</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Need küpsised on vajalikud veebilehe põhifunktsioonide töötamiseks:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li><strong>cookie-consent:</strong> Salvestab teie nõusoleku küpsiste kasutamiseks</li>
                  <li><strong>Seansiküpsised:</strong> Võimaldavad veebilehel navigeerimist ja vormide töötamist</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Analüütilised küpsised</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Need küpsised aitavad meil mõista, kuidas külastajad meie veebilehte kasutavad:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Külastuste arv ja kestus</li>
                  <li>Kõige populaarsemad lehed</li>
                  <li>Tehnilised andmed (brauser, seade)</li>
                </ul>
                <p className="text-gray-700 text-sm mt-2">
                  Me ei kasuta kolmandate osapoolte analüütilisi teenuseid (nt Google Analytics) ilma teie selgesõnalise nõusolekuta.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">8.3. Kuidas küpsiseid kontrollida?</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Te saate oma brauseri seadetes kontrollida ja kustutada küpsiseid. Palun pange tähele, et mõned küpsised on veebilehe töötamiseks vajalikud ja nende keelamine võib mõjutada lehe funktsionaalsust.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Teie küpsiste nõusolekut saate muuta või tühistada, kustutades brauseri seadetest küpsise <code className="bg-gray-100 px-2 py-1 rounded">papagoi-cookie-consent</code>.
              </p>
            </div>
          </div>

          {/* 9. Turvalisus */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              9. Andmete turvalisus
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Me rakendame sobivaid tehnilisi ja organisatsioonilisi meetmeid, et kaitsta teie isikuandmeid volitamata juurdepääsu, kaotamise, hävitamise või muutmise eest. See hõlmab:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Turvalist andmesideprotokolli (HTTPS)</li>
                <li>Regulaarseid turvauuendusi</li>
                <li>Piiratud juurdepääsu isikuandmetele</li>
                <li>Regulaarseid varukoopiaid</li>
              </ul>
            </div>
          </div>

          {/* 10. Muudatused privaatsuspoliitikas */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              10. Muudatused privaatsuspoliitikas
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Me võime aeg-ajalt uuendada seda privaatsuspoliitikat. Olulistest muudatustest teavitame teid veebilehel või e-posti teel. Soovitame teil perioodiliselt seda lehte vaadata, et olla kursis meie andmekaitse praktikaga.
              </p>
            </div>
          </div>

          {/* 11. Kontakt */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-2" />
              11. Kontakt
            </h2>
            <div className="prose prose-white max-w-none">
              <p className="text-white/90 leading-relaxed mb-4">
                Kui teil on küsimusi või muresid meie privaatsuspoliitika või andmete töötlemise kohta, võtke meiega ühendust:
              </p>
              <ul className="list-none space-y-2 text-white/90">
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  <a href="mailto:keskus@papagoi.ee" className="hover:underline">keskus@papagoi.ee</a>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 mr-2">📞</span>
                  <a href="tel:+3725127938" className="hover:underline">+372 512 7938</a>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 mr-2 mt-1">📍</span>
                  <span>Tartu mnt 80, Soinaste, Kambja vald, Tartumaa 61709, Eesti</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              ← Tagasi avalehele
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
