import ParrotsPageClient from './ParrotsPageClient'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const metadata = {
  title: 'Meie papagoid - Papagoi Keskus',
  description: 'Tutvuge meie papagoidega. Meie juures elab üle 50 papagoi. Iga papagoi on ainulaadne isiksus oma loo ja iseloomuga. Hakake ristiisaks!',
  keywords: 'papagoid Tartus, papagoid Eestis, kus saab papagoid näha Eestis, papagoidega fotod Tartu, papagoidekeskus Tartus',
  alternates: {
    canonical: `${getSiteUrl()}/papagoid`,
  },
  openGraph: {
    title: 'Meie papagoid - Papagoi Keskus',
    description: 'Tutvuge meie papagoidega. Meie juures elab üle 50 papagoi. Iga papagoi on ainulaadne isiksus oma loo ja iseloomuga. Hakake ristiisaks!',
    type: 'website',
    locale: 'et_EE',
    url: `${getSiteUrl()}/papagoid`,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Meie papagoid - Papagoi Keskus',
    description: 'Tutvuge meie papagoidega. Meie juures elab üle 50 papagoi. Iga papagoi on ainulaadne isiksus oma loo ja iseloomuga. Hakake ristiisaks!',
    images: ['/logo.png'],
  },
}

// Fallback andmed, kui Notion API ei tööta
const fallbackParrots = [
  {
    id: 1,
    name: 'Sinine ja Kuldne Ara',
    species: 'Ara ararauna', 
    image: 'https://cdn.abacus.ai/images/4844f1b4-b44f-4444-a1a4-413b9b35da3c.png',
    age: '15 aastat',
    personality: ['Sõbralik', 'Intelligentne', 'Armastab tähelepanu'],
    story: 'Meie kõige suurem ja muljetavaldavam papagoi. Ta on elanud meie juures juba 8 aastat ja on tõeline näitlejahingega lind, kes armastab külalistele esineda.',
    favorites: ['Päevalilleseemned', 'Pähklid', 'Klassikaline muusika'],
    sponsorship: {
      status: 'sponsored', // 'available' | 'sponsored' | 'pending'
      monthlyAmount: '45€',
      sponsorName: 'Maria ja Jaan P.',
      needs: 'Suur lind vajab rohkesti ruumi, kõrgekvaliteedilist toitu ja mentaalset stimulatsiooni'
    }
  },
  {
    id: 2,
    name: 'Bruno - Aafrika Hall Papagoi',
    species: 'Psittacus erithacus',
    image: 'https://cdn.abacus.ai/images/b51852fa-873e-48d9-bb1c-e524f2e1f149.png',
    age: '22 aastat',
    personality: ['Väga tark', 'Kõnekas', 'Armastab mõistatusi'],
    story: 'Meie kõige targem elanik, kes tunneb üle 200 sõna ja armastab külalistega vestleda. Ta suudab lausa nalju rääkida!',
    favorites: ['Õunad', 'Uued sõnad õppimine', 'Raadio kuulamine'],
    sponsorship: {
      status: 'available',
      monthlyAmount: '25€',
      needs: 'Vajab palju intellectuaalset stimulatsiooni, uusi sõnu õppimist ja kvaliteetset toitu'
    }
  },
  {
    id: 3,
    name: 'Luna - Aafrika Hall Papagoi',
    species: 'Psittacus erithacus',
    image: 'https://cdn.abacus.ai/images/b51852fa-873e-48d9-bb1c-e524f2e1f149.png',
    age: '18 aastat',
    personality: ['Muusikaline', 'Tundlik', 'Armastab laulda'],
    story: 'Luna on meie muusikaline hing, kes armastab muusikat kuulata ja sellele kaasa laulda. Ta tunneb erinevaid meloodiaid.',
    favorites: ['Klassikaline muusika', 'Laulmine', 'Vaikne keskkond'],
    sponsorship: {
      status: 'available',
      monthlyAmount: '25€',
      needs: 'Vajab muusikalist keskkonda, tundlikku lähenemist ja kvaliteetseid vitamiine'
    }
  },
  {
    id: 4,
    name: 'Korella',
    species: 'Nymphicus hollandicus',
    image: 'https://cdn.abacus.ai/images/fad37464-1d07-4c14-835d-33f9406cea42.png',
    age: '8 aastat',
    personality: ['Mänguhimuline', 'Sõbralik', 'Armastab vilistamist'],
    story: 'Väike kuid väga aktiivne lind, kes armastab kõikidega tutvuda. Ta oskab vilistada terveid meloodiaid.',
    favorites: ['Vilistamine', 'Peeglisse vaatamine', 'Hirss'],
    sponsorship: {
      status: 'sponsored',
      monthlyAmount: '15€',
      sponsorName: 'Anna K.',
      needs: 'Väike energiline lind, vajab mänguasju ja sotsiaalset suhtlust'
    }
  },
  {
    id: 5,
    name: 'Rohelispõseline Konuur',
    species: 'Pyrrhura molinae',
    image: 'https://cdn.abacus.ai/images/75e9f30e-86f5-4072-aeec-9301c1c833d2.png',
    age: '5 aastat',
    personality: ['Aktiivne', 'Mänguhimuline', 'Sotsiaalne'],
    story: 'Meie väike kiiksuja, kes armastab gruppides olla ja teiste papagoidega suhelda. Väga sotsiaalne lind.',
    favorites: ['Mänguasjad', 'Grupimängud', 'Värvilised esemed'],
    sponsorship: {
      status: 'available',
      monthlyAmount: '20€',
      needs: 'Sotsiaalne lind, vajab grupikaaslasi, värvilisi mänguasju ja aktiivset keskkonda'
    }
  },
  {
    id: 6,
    name: 'Punane Ara',
    species: 'Ara macao',
    image: 'https://cdn.abacus.ai/images/93a2d518-347d-4b32-bb69-efe58c1624b2.png',
    age: '18 aastat',
    personality: ['Uhke', 'Majesteetlik', 'Armastab esinema'],
    story: 'Meie kõige uhkem elanik, kes teab, et ta on ilus. Armastab poseerida fotodeks ja saada kiitust.',
    favorites: ['Poseerimne fotodel', 'Päikeseloojang', 'Egzootilised puuviljad'],
    sponsorship: {
      status: 'available',
      monthlyAmount: '45€',
      needs: 'Majesteetlik suur papagoi, vajab suurt ruumi, erilist tähelepanu ja premium toitu'
    }
  },
  {
    id: 7,
    name: 'Valge Kakadu',
    species: 'Cacatua alba',
    image: 'https://cdn.abacus.ai/images/9023bd87-5ff7-483c-bbf4-c10faa0bf282.png',
    age: '12 aastat',
    personality: ['Emotsionaalne', 'Armastab tantsimist', 'Väljendusrikas'],
    story: 'Meie kõige emotsionaalsem lind, kes reageerib muusikale tantsimisega. Tal on suurepärane tunded ja ta suudab aru saada inimeste meeleoludest.',
    favorites: ['Tantsimine', 'Muusika', 'Kaisutamine'],
    sponsorship: {
      status: 'pending',
      monthlyAmount: '35€',
      needs: 'Emotsionaalne lind, vajab palju tähelepanu, muusikalist keskkonda ja tundlikku hooldust'
    }
  },
  {
    id: 8,
    name: 'Max - Aafrika Hall Papagoi',
    species: 'Psittacus erithacus',
    image: 'https://cdn.abacus.ai/images/b51852fa-873e-48d9-bb1c-e524f2e1f149.png',
    age: '25 aastat',
    personality: ['Rahulik', 'Tark', 'Väga sõbralik'],
    story: 'Max on meie vanim aafrika hall papagoi, täis tarkust ja kogemusi. Ta on näinud palju ja on väga mõistlik.',
    favorites: ['Rahulik keskkond', 'Sügavad vestlused', 'Päikesevõtmine'],
    sponsorship: {
      status: 'available',
      monthlyAmount: '25€',
      needs: 'Vanem papagoi, vajab erilist hooldust, tervisekontolli ja rahulikku keskkonda'
    }
  },
  {
    id: 9,
    name: 'Päikesekonuur',
    species: 'Aratinga solstitialis',
    image: 'https://www.thesprucepets.com/thmb/q3dfVHkPmaGnITlnWpX-dyZ-x8w=/4500x0/filters:no_upscale():strip_icc()/GettyImages-545003266-58a6e9175f9b58a3c918f24c.jpg',
    age: '6 aastat',
    personality: ['Energiline', 'Särav', 'Armastab tähelepanu'],
    story: 'Särav kollane ja oranž konuur, kes toob päikest igasse nurka. Väga elava temperamendiga lind.',
    favorites: ['Päikesevalgus', 'Kõva muusika', 'Akrobatilised trikid'],
    sponsorship: {
      status: 'available',
      monthlyAmount: '20€',
      needs: 'Energiline lind, vajab palju aktiviteete, päikesevalgust ja sotsiaalselt stimulationt'
    }
  }
]

// Server-side funktsioon, mis toob andmed Notion'ist
async function getParrotsFromNotion() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/notion/parrots`, {
      next: { revalidate: 3600 }, // värskendame kord tunnis
    })
    
    if (!response.ok) {
      throw new Error('Notion API viga')
    }
    
    const data = await response.json()
    return data.parrots || []
  } catch (error) {
    console.error('Viga Notion API päringul:', error)
    return []
  }
}

export default async function ParrotsPage() {
  // Proovime võtta andmed Notion'ist
  const notionParrots = await getParrotsFromNotion()
  
  // Kui Notion'ist tuli andmeid, kasutame neid, muidu fallback
  const allParrots = notionParrots.length > 0 ? notionParrots : fallbackParrots
  
  return <ParrotsPageClient allParrots={allParrots} />
}