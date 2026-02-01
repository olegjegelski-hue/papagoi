
import Image from 'next/image'
import { Heart, Gift, Calendar, Camera, Users, Phone, Mail, Euro, Check, Star, Clock } from 'lucide-react'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata = {
  title: 'Ristiisa Programm - Papagoi Keskus',
  description: 'Hakka meie papagoi ristiisaks! Toeta sümboolselt oma lemmikpapagoid ja saa osa tema igapäevaelust kvartaalsete privaatsete kohtumistega.',
  alternates: {
    canonical: `${getSiteUrl()}/ristiisa-programm`,
  },
  openGraph: {
    title: 'Ristiisa Programm - Papagoi Keskus',
    description: 'Hakka meie papagoi ristiisaks! Toeta sümboolselt oma lemmikpapagoid ja saa osa tema igapäevaelust kvartaalsete privaatsete kohtumistega.',
    url: `${getSiteUrl()}/ristiisa-programm`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Ristiisa Programm - Papagoi Keskus',
    description: 'Hakka meie papagoi ristiisaks! Toeta sümboolselt oma lemmikpapagoid ja saa osa tema igapäevaelust kvartaalsete privaatsete kohtumistega.',
    images: ['/logo.png'],
  },
}

const benefits = [
  {
    icon: Heart,
    title: 'Personaalne emotsionaalne side',
    description: 'Loodke eriline ja tugev emotsionaalne side oma valitud papagaiga, kes hakkab teid ootama ja tundma ära.',
    details: ['Papagoi õpib teid tundma', 'Eriline tervitus kohtumistel', 'Personaalne suhtlus']
  },
  {
    icon: Calendar,
    title: 'Kvartaalsed privaatsed kohtumised',
    description: 'Igal kvartali lõpus saate veeta 30 minutit privaatselt oma ristilapesega ilma teiste külastajateta.',
    details: ['30-minutiline privaatne kohtumise', 'Spetsiaalne söötmine ja mängimine', 'Rahulik keskkond kahekesi']
  },
  {
    icon: Camera,
    title: 'Regulaarsed foto- ja videouudised',
    description: 'Saate kuus kord aastas fotosid ja videoid oma ristilapses igapäevaelust ja arengust.',
    details: ['Kuukordne fotoreport', 'Lühikesed videod papagoi tegemistest', 'Uudised tema tervise ja heaolu kohta']
  },
  {
    icon: Gift,
    title: 'Eriline tunnustus ja soodused',
    description: 'Teie nimi ilmub papagoi elukoha juures ja saate erilisi soodusi meie keskuse külastamisel.',
    details: ['Nimesilt papagoi juures', 'Tasuta sissepääs regulaarsetele külastustele', 'Eriline tänutunnus sotsiaalmeedias']
  },
  {
    icon: Users,
    title: 'Liitumine ristivanema perekonnaga',
    description: 'Saate osa meie ristivanema kogukonnast ja kutseid erilisterle üritustele.',
    details: ['Ristivanema kogunemiset', 'Eriliste ürituste kuttsed', 'Kogemusten jagamine teiste ristivanematega']
  },
  {
    icon: Star,
    title: 'Aidate päriselt kaasa heaolule',
    description: 'Teie toetus läheb otse papagoi hoolduse, toidu ja meditsiinilise järelevalve peale.',
    details: ['Kvaliteetne toit ja vitamiinid', 'Veterinaarabi ja tervisekonrollid', 'Mänguasjad ja tegevused']
  }
]

const sponsorshipTiers = [
  {
    name: 'Väike Papagoi',
    species: ['Korella', 'Kakariki', 'Lovebird'],
    monthlyAmount: '15€',
    benefits: ['Kvartaalsed kohtumised', 'Foto-uudised', 'Nimesilt'],
    popular: false
  },
  {
    name: 'Keskmine Papagoi',
    species: ['Aafrika Hall', 'Konuur', 'Kaeluspikagoi'],
    monthlyAmount: '25€',
    benefits: ['Kõik eelnevad', 'Video-uudised', 'Erilised üritused', 'Tasuta külastused'],
    popular: true
  },
  {
    name: 'Suur Papagoi',
    species: ['Ara', 'Kakadu', 'Amazon'],
    monthlyAmount: '45€',
    benefits: ['Kõik eelnevad', 'Kuukordne kohtumised', 'Eriline tunnustus', 'VIP eelised'],
    popular: false
  }
]

const faqItems = [
  {
    question: 'Kuidas ristiisa programm täpselt toimib?',
    answer: 'Peale registreerimist valite endale sobiva papagoi meie saadaolevate seast. Maksate kuumaksu, mis läheb otse papagoi hoolduse peale. Igal kvartalis võtame teiega ühendust privaatse kohtumise kokkuleppimiseks.'
  },
  {
    question: 'Kas saan papagoid koju viia?',
    answer: 'Ei, tegemist on sümboolse adopteerimisega. Papagoid jäävad meie keskusesse, kus nad on harjunud ja saavad professionaalset hooldust. Te saate neid regulaarselt külastada.'
  },
  {
    question: 'Kas saan valida konkreetse papagoi?',
    answer: 'Jah! Meie veebilehel näete kõiki papagoid ja nende sponsorluse staatust. Võite valida oma südamele lähedase papagoi, kui ta pole juba toetatav.'
  },
  {
    question: 'Mis saab, kui tahan programmat lõpetada?',
    answer: 'Programmi saab lõpetada igal ajal 30-päevase etteteatamisega. Ei ole mingeid lisatasusid või kohustusi.'
  },
  {
    question: 'Kas saan mitu papagoid toetada?',
    answer: 'Muidugi! Paljud meie ristivanemad toetavad mitut papagoid. Iga papagoi kohta tehakse eraldi leping.'
  },
  {
    question: 'Kuidas maksed toimuvad?',
    answer: 'Saadame igakuise arve e-mailile, mille saate maksta pangaülekandega. Võimalik on ka automaatne kordusmakse seadistada.'
  }
]

export default function SponsorshipProgramPage() {
  const baseUrl = getSiteUrl()
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/ristiisa-programm`,
    },
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Hero Section */}
      <section className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Papagoi Ristiisa Programm</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Ristivanema programm pakub palju rohkemat kui lihtsalt toetust - see on emotsionaalne reis ja eriline side.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 mb-6">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.details.map((detail, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Toetuse <span className="text-blue-600">Tasemed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Valige endale sobiv toetustase olenevalt papagoi suurusest ja vajadusest
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sponsorshipTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 transform hover:scale-105 ${
                tier.popular ? 'ring-4 ring-blue-500 scale-110' : ''
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Populaarseim
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-green-600 mb-4">{tier.monthlyAmount}</div>
                  <p className="text-gray-600">kuus</p>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-3">Sobib papagoidele:</h4>
                  <div className="flex flex-wrap gap-2">
                    {tier.species.map((species, i) => (
                      <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {species}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">Eelised:</h4>
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}>
                  Vali see tase
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Kuidas see <span className="text-purple-600">toimib?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Valige papagoi</h3>
              <p className="text-gray-600">Tutvuge meie papagoidega ja valige endale südamele lähedane lind</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Registreeruge</h3>
              <p className="text-gray-600">Täitke lihtne vorm ja valige sobiv toetustase</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Alustage toetamist</h3>
              <p className="text-gray-600">Teeme lepingu ja saadame esimese foto-raporti teie ristilapsest</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Nautige suhtlust</h3>
              <p className="text-gray-600">Kohtuge regulaarselt oma ristilapsega ja jälgige tema arengut</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Korduma Kippuvad <span className="text-green-600">Küsimused</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Valmis oma papagoi ristiisaks hakkama?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Liituge meie võimsa ristivanema perekonnaga juba täna ja looge eriline side mõne meie imelise papagaiga!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <Phone className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Helistage</h3>
              <p className="text-lg">+372 51 27 938</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Kirjutage</h3>
              <p className="text-lg">keskus@papagoi.ee</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/papagoid"
              className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Vaata kõiki papagoie
            </a>
            <a
              href="/kontakt"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-green-600 transition-all duration-300"
            >
              Võta ühendust
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
