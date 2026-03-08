import ParrotsPageClient from './ParrotsPageClient'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu ? 'Наши попугаи - Центр попугаев в Тарту' : isEn ? 'Our parrots - Parrot Centre Tartu' : 'Meie papagoid - Papagoi Keskus Tartus'
  const description = isRu
    ? 'Познакомьтесь с нашими попугаями. Более 50 попугаев. Каждый уникален. Станьте крёстным или подарите подарочную карту на визит!'
    : isEn
      ? 'Meet our parrots. Over 50 parrots. Each one is unique. Become a sponsor or give a gift card for a visit!'
      : 'Tutvuge meie papagoidega. Üle 50 papagoi. Iga papagoi on ainulaadne isiksus oma loo ja iseloomuga. Hakake ristiisaks või kingi kinkekaart külastuseks!'
  const keywords = isRu
    ? 'попугаи Тарту, попугаи Эстония, Центр попугаев, программа крёстных, где посмотреть попугаев Эстония'
    : isEn
      ? 'parrots Tartu, parrots Estonia, Parrot Centre parrots, sponsor programme, where to see parrots Estonia, parrot photos Tartu'
      : 'papagoid Tartus, papagoid Eestis, Papagoi Keskus papagoid, ristiisa programm, kus saab papagoid näha Eestis, papagoidega fotod Tartu, papagoidekeskus Tartus'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `${base}/${locale}/papagoid` },
    openGraph: {
      title: isRu ? 'Наши попугаи - Центр попугаев в Тарту' : isEn ? 'Our parrots - Parrot Centre Tartu' : 'Meie papagoid - Papagoi Keskus Tartus',
      description: isRu ? 'Познакомьтесь с нашими попугаями. Более 50 попугаев. Станьте крёстным или подарите подарочную карту.' : isEn ? 'Meet our parrots. Over 50 parrots. Become a sponsor or give a gift card.' : 'Tutvuge meie papagoidega. Üle 50 papagoi. Hakake ristiisaks või kingi kinkekaart.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/papagoid`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title: isRu ? 'Наши попугаи - Центр попугаев в Тарту' : isEn ? 'Our parrots - Parrot Centre Tartu' : 'Meie papagoid - Papagoi Keskus Tartus',
      description: isRu ? 'Познакомьтесь с нашими попугаями. Более 50 попугаев. Станьте крёстным или подарите подарочную карту.' : isEn ? 'Meet our parrots. Over 50 parrots. Become a sponsor or give a gift card.' : 'Tutvuge meie papagoidega. Üle 50 papagoi. Hakake ristiisaks või kingi kinkekaart.',
      images: ['/logo.png'],
    },
  }
}

// Server-side function to fetch from Notion
async function getParrotsFromNotion() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000'
    const url = baseUrl.endsWith('/') ? `${baseUrl.slice(0, -1)}/api/notion/parrots` : `${baseUrl}/api/notion/parrots`
    const response = await fetch(url, {
      next: { revalidate: 300 },
    })
    if (!response.ok) throw new Error('Notion API viga')
    const data = await response.json()
    return data.parrots || []
  } catch (error) {
    console.error('Viga Notion API päringul:', error)
    return []
  }
}

// Fallback data when Notion API is unavailable
const fallbackParrots = [
  { id: 1, name: 'Sinine ja Kuldne Ara', species: 'Ara ararauna', image: 'https://cdn.abacus.ai/images/4844f1b4-b44f-4444-a1a4-413b9b35da3c.png', age: '15 aastat', personality: ['Sõbralik', 'Intelligentne', 'Armastab tähelepanu'], story: 'Meie kõige suurem ja muljetavaldavam papagoi. Ta on elanud meie juures juba 8 aastat ja on tõeline näitlejahingega lind, kes armastab külalistele esineda.', favorites: ['Päevalilleseemned', 'Pähklid', 'Klassikaline muusika'], sponsorship: { status: 'sponsored', monthlyAmount: '45€', sponsorName: 'Maria ja Jaan P.', needs: 'Suur lind vajab rohkesti ruumi, kõrgekvaliteedilist toitu ja mentaalset stimulatsiooni' } },
  { id: 2, name: 'Bruno - Aafrika Hall Papagoi', species: 'Psittacus erithacus', image: 'https://cdn.abacus.ai/images/b51852fa-873e-48d9-bb1c-e524f2e1f149.png', age: '22 aastat', personality: ['Väga tark', 'Kõnekas', 'Armastab mõistatusi'], story: 'Meie kõige targem elanik, kes tunneb üle 200 sõna ja armastab külalistega vestleda. Ta suudab lausa nalju rääkida!', favorites: ['Õunad', 'Uued sõnad õppimine', 'Raadio kuulamine'], sponsorship: { status: 'available', monthlyAmount: '25€', needs: 'Vajab palju intellectuaalset stimulatsiooni, uusi sõnu õppimist ja kvaliteetset toitu' } },
  { id: 3, name: 'Luna - Aafrika Hall Papagoi', species: 'Psittacus erithacus', image: 'https://cdn.abacus.ai/images/b51852fa-873e-48d9-bb1c-e524f2e1f149.png', age: '18 aastat', personality: ['Muusikaline', 'Tundlik', 'Armastab laulda'], story: 'Luna on meie muusikaline hing, kes armastab muusikat kuulata ja sellele kaasa laulda.', favorites: ['Klassikaline muusika', 'Laulmine', 'Vaikne keskkond'], sponsorship: { status: 'available', monthlyAmount: '25€', needs: 'Vajab muusikalist keskkonda ja tundlikku lähenemist' } },
  { id: 4, name: 'Korella', species: 'Nymphicus hollandicus', image: 'https://cdn.abacus.ai/images/fad37464-1d07-4c14-835d-33f9406cea42.png', age: '8 aastat', personality: ['Mänguhimuline', 'Sõbralik', 'Armastab vilistamist'], story: 'Väike kuid väga aktiivne lind, kes armastab kõikidega tutvuda.', favorites: ['Vilistamine', 'Peeglisse vaatamine', 'Hirss'], sponsorship: { status: 'sponsored', monthlyAmount: '15€', sponsorName: 'Anna K.', needs: 'Väike energiline lind, vajab mänguasju ja sotsiaalset suhtlust' } },
  { id: 5, name: 'Rohelispõseline Konuur', species: 'Pyrrhura molinae', image: 'https://cdn.abacus.ai/images/75e9f30e-86f5-4072-aeec-9301c1c833d2.png', age: '5 aastat', personality: ['Aktiivne', 'Mänguhimuline', 'Sotsiaalne'], story: 'Meie väike kiiksuja, kes armastab gruppides olla.', favorites: ['Mänguasjad', 'Grupimängud', 'Värvilised esemed'], sponsorship: { status: 'available', monthlyAmount: '20€', needs: 'Sotsiaalne lind, vajab grupikaaslasi ja värvilisi mänguasju' } },
  { id: 6, name: 'Punane Ara', species: 'Ara macao', image: 'https://cdn.abacus.ai/images/93a2d518-347d-4b32-bb69-efe58c1624b2.png', age: '18 aastat', personality: ['Uhke', 'Majesteetlik', 'Armastab esinema'], story: 'Meie kõige uhkem elanik, kes teab, et ta on ilus.', favorites: ['Poseerimine fotodel', 'Päikeseloojang', 'Egzootilised puuviljad'], sponsorship: { status: 'available', monthlyAmount: '45€', needs: 'Majesteetlik suur papagoi, vajab suurt ruumi ja premium toitu' } },
  { id: 7, name: 'Valge Kakadu', species: 'Cacatua alba', image: 'https://cdn.abacus.ai/images/9023bd87-5ff7-483c-bbf4-c10faa0bf282.png', age: '12 aastat', personality: ['Emotsionaalne', 'Armastab tantsimist', 'Väljendusrikas'], story: 'Meie kõige emotsionaalsem lind, kes reageerib muusikale tantsimisega.', favorites: ['Tantsimine', 'Muusika', 'Kaisutamine'], sponsorship: { status: 'pending', monthlyAmount: '35€', needs: 'Emotsionaalne lind, vajab palju tähelepanu ja muusikalist keskkonda' } },
  { id: 8, name: 'Max - Aafrika Hall Papagoi', species: 'Psittacus erithacus', image: 'https://cdn.abacus.ai/images/b51852fa-873e-48d9-bb1c-e524f2e1f149.png', age: '25 aastat', personality: ['Rahulik', 'Tark', 'Väga sõbralik'], story: 'Max on meie vanim aafrika hall papagoi, täis tarkust ja kogemusi.', favorites: ['Rahulik keskkond', 'Sügavad vestlused', 'Päikesevõtmine'], sponsorship: { status: 'available', monthlyAmount: '25€', needs: 'Vanem papagoi, vajab erilist hooldust ja rahulikku keskkonda' } },
  { id: 9, name: 'Päikesekonuur', species: 'Aratinga solstitialis', image: 'https://www.thesprucepets.com/thmb/q3dfVHkPmaGnITlnWpX-dyZ-x8w=/4500x0/filters:no_upscale():strip_icc()/GettyImages-545003266-58a6e9175f9b58a3c918f24c.jpg', age: '6 aastat', personality: ['Energiline', 'Särav', 'Armastab tähelepanu'], story: 'Särav kollane ja oranž konuur, kes toob päikest igasse nurka.', favorites: ['Päikesevalgus', 'Kõva muusika', 'Akrobatilised trikid'], sponsorship: { status: 'available', monthlyAmount: '20€', needs: 'Energiline lind, vajab palju aktiviteete ja päikesevalgust' } }
]

export default async function ParrotsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const notionParrots = await getParrotsFromNotion()
  const allParrots = notionParrots.length > 0 ? notionParrots : fallbackParrots

  return <ParrotsPageClient allParrots={allParrots} />
}
