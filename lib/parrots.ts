
import { Parrot } from './types';

export const parrots: Parrot[] = [
  // Suured papagoid
  {
    id: 'mac',
    name: 'Mac',
    species: 'Blue and Gold Macaw',
    speciesEst: 'Sinine-kuldne ara',
    description: 'Meie suurim ja kõige populaarsem ara, kes on tõeline keskuse täht. Mac on sõbralik ja armastab suhelda külastajatega.',
    personality: 'Sõbralik, intelligentne ja väga suhtlemisaldis',
    imageUrl: 'https://images.pexels.com/photos/6796544/pexels-photo-6796544.jpeg',
    category: 'suur'
  },
  {
    id: 'robbie',
    name: 'Robbie',
    species: 'African Grey Parrot',
    speciesEst: 'Žako papagoi',
    description: 'Üks meie arukamaid papagoisid. Robbie oskab rääkida paljusid sõnu ja on väga sotsiaalne.',
    personality: 'Intelligentne, kõnekas, õppimisaldis',
    imageUrl: 'https://static.vecteezy.com/system/resources/previews/049/196/179/large_2x/portrait-studiograph-of-african-gray-parrot-photo.jpg',
    category: 'suur'
  },
  {
    id: 'millie',
    name: 'Millie',
    species: 'African Grey Parrot',
    speciesEst: 'Žako papagoi',
    description: 'Robbie elukaaslane, samuti väga tark ja sõbralik. Millie armastab tähelepanu ja on väga uudishimulik.',
    personality: 'Tark, tähelepanelik, armastab suhelda',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/African_Grey_Parrot_-_head_and_face.jpg',
    category: 'suur'
  },

  // Keskmise suurusega papagoid
  {
    id: 'lucky',
    name: 'Lucky',
    species: 'Sun Conure',
    speciesEst: 'Aratinga papagoi',
    description: 'Erkkollane ja oranž väike päikesepapagoi, kes toob alati head meeleolu oma eredate värvidega.',
    personality: 'Energiline, värvikas, rõõmsameelne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Birds_Sun_Conure.jpg',
    category: 'keskmine'
  },
  {
    id: 'lucas',
    name: 'Lucas',
    species: 'Indian Ringneck',
    speciesEst: 'Kaeluspapagoi',
    description: 'Ilus roheline papagoi iseloomuliku kaelaga. Lucas on elegantne ja graatsiline.',
    personality: 'Elegantne, rahulik, sõbralik',
    imageUrl: 'https://images.pexels.com/photos/1972531/pexels-photo-1972531.jpeg',
    category: 'keskmine'
  },
  {
    id: 'roosi',
    name: 'Roosi',
    species: 'Eastern Rosella',
    speciesEst: 'Rosella papagoi',
    description: 'Kaunis värviline papagoi Austraaliast. Roosi on üks meie kaunimaid linde.',
    personality: 'Kaunis, graatsiline, sõbralik',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Platycercus_eximius_diemenensis_male.jpg',
    category: 'keskmine'
  },
  {
    id: 'bowie',
    name: 'Bowie',
    species: 'Crimson Rosella',
    speciesEst: 'Punane rosella',
    description: 'Ilus punane rosella papagoi, kellel on eriline isiksus ja karakter.',
    personality: 'Eriline, artistlik, värvikirev',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Platycercus_elegans_Wilsons_Prom.jpg',
    category: 'keskmine'
  },
  {
    id: 'ruby',
    name: 'Ruby',
    species: 'Eastern Rosella',
    speciesEst: 'Rosella papagoi',
    description: 'Roosi sõber, samuti väga kaunis ja värvikas rosella papagoi.',
    personality: 'Mänguline, sõbralik, värvikas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Platycercus_eximius_diemenensis_male.jpg',
    category: 'keskmine'
  },
  {
    id: 'tutti',
    name: 'Tutti',
    species: 'Cockatiel',
    speciesEst: 'Nümfkakaduud',
    description: 'Üks meie armsatest korellpapagoidest kollase kimbuga. Tutti armastab laulda.',
    personality: 'Musikaalne, sõbralik, lauluhimuline',
    imageUrl: 'https://images.pexels.com/photos/17566601/pexels-photo-17566601.jpeg',
    category: 'keskmine'
  },
  {
    id: 'frutti',
    name: 'Frutti',
    species: 'Cockatiel',
    speciesEst: 'Nümfkakaduud',
    description: 'Tutti parim sõber, samuti väga sõbralik ja musikaalne korellpapagoi.',
    personality: 'Sõbralik, mänguline, musikaalne',
    imageUrl: 'https://images.pexels.com/photos/13511241/pexels-photo-13511241.jpeg',
    category: 'keskmine'
  },
  {
    id: 'tips',
    name: 'Tips',
    species: 'Cockatiel',
    speciesEst: 'Nümfkakaduud',
    description: 'Kolmas korellpapagoi meie peres, samuti väga armas ja sõbralik.',
    personality: 'Armas, tähelepanelik, rahulik',
    imageUrl: 'https://images.pexels.com/photos/17566601/pexels-photo-17566601.jpeg',
    category: 'keskmine'
  },
  {
    id: 'taps',
    name: 'Täps',
    species: 'Cockatiel',
    speciesEst: 'Nümfkakaduud',
    description: 'Neljas korellpapagoi, kes täiendab meie korellperede rõõmsalt.',
    personality: 'Rõõmus, aktiivne, seltskondlik',
    imageUrl: 'https://images.pexels.com/photos/13511241/pexels-photo-13511241.jpeg',
    category: 'keskmine'
  },
  {
    id: 'ricky',
    name: 'Ricky',
    species: 'Red-crowned Parakeet',
    speciesEst: 'Kakariki',
    description: 'Roheline Uus-Meremaa papagoi punase päaga. Ricky on väga aktiivne ja mänguline.',
    personality: 'Aktiivne, akrobaatlik, mänguline',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Kakariki_perched_on_a_branch%2C_looking.jpg',
    category: 'keskmine'
  },
  {
    id: 'ruts',
    name: 'Ruts',
    species: 'Senegal Parrot',
    speciesEst: 'Senegali papagoi',
    description: 'Kaunis Aafrika papagoi rohelise pea ja kollase kõhuga. Ruts on väga sõbralik.',
    personality: 'Sõbralik, rahulik, uudishimulik',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Papagei_Mohrkopfpapagei_0509182.jpg/1200px-Papagei_Mohrkopfpapagei_0509182.jpg',
    category: 'keskmine'
  },

  // Väikesed papagoid ja lembelinnud
  {
    id: 'lumi',
    name: 'Lumi',
    species: 'Fischer\'s Lovebird',
    speciesEst: 'Lembelind',
    description: 'Üks meie armsatest lembelindudest. Lumi on väike aga väga temperamentne.',
    personality: 'Temperamentne, aktiivne, seltskondlik',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Agapornis_fischeri_-Ueno_Zoo%2C_Japan_-three-8a-4c.jpg/960px-Agapornis_fischeri_-Ueno_Zoo%2C_Japan_-three-8a-4c.jpg',
    category: 'väike'
  },
  {
    id: 'mango',
    name: 'Mango',
    species: 'Peach-faced Lovebird',
    speciesEst: 'Lembelind',
    description: 'Kaunis lembelind kollaste ja oranžide toonidega. Mango on väga sõbralik.',
    personality: 'Sõbralik, värvikas, mänguline',
    imageUrl: 'https://i.pinimg.com/736x/08/96/de/0896de8639b93197c4f85c8309d4e714.jpg',
    category: 'väike'
  },
  {
    id: 'pipi',
    name: 'Pipi',
    species: 'Fischer\'s Lovebird',
    speciesEst: 'Lembelind',
    description: 'Kolmas lembelind meie peres, samuti väga aktiivne ja sõbralik.',
    personality: 'Aktiivne, uudishimulik, mänguline',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Agapornis_fischeri_-Ueno_Zoo%2C_Japan_-three-8a-4c.jpg/960px-Agapornis_fischeri_-Ueno_Zoo%2C_Japan_-three-8a-4c.jpg',
    category: 'väike'
  },
  {
    id: 'brian',
    name: 'Brian',
    species: 'Peach-faced Lovebird',
    speciesEst: 'Lembelind',
    description: 'Neljas lembelind, kes täiendab meie väikeste lindude pere.',
    personality: 'Rõõmsameelne, sõbralik, sotsiaalne',
    imageUrl: 'https://i.pinimg.com/736x/08/96/de/0896de8639b93197c4f85c8309d4e714.jpg',
    category: 'väike'
  },
  {
    id: 'joy',
    name: 'Joy',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Üks meie paljudest viirpapagoidest. Joy on alati rõõmsameelne.',
    personality: 'Rõõmsameelne, kiire, seltskondlik',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Budgies%2C_aka_Parakeets_or_Small_parrots.jpg',
    category: 'väike'
  },
  {
    id: 'luna',
    name: 'Luna',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Kaunis valge ja sinine viirpapagoi, kes armastab lennata.',
    personality: 'Graatsiline, vaikne, ilus',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Budgerigar-male-strzelecki-qld.jpg/960px-Budgerigar-male-strzelecki-qld.jpg',
    category: 'väike'
  },
  {
    id: 'lemon',
    name: 'Lemon',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Kollane viirpapagoi, kes on väga aktiivne ja mänguline.',
    personality: 'Energiline, kollane nagu päike, mänguline',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Budgies%2C_aka_Parakeets_or_Small_parrots.jpg',
    category: 'väike'
  },
  {
    id: 'star',
    name: 'Star',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Eriline viirpapagoi täppidega, kes paistab silma oma mustriga.',
    personality: 'Eriline, tähelepanu tõmbav, särav',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Budgerigar-male-strzelecki-qld.jpg/960px-Budgerigar-male-strzelecki-qld.jpg',
    category: 'väike'
  },
  {
    id: 'ken',
    name: 'Ken',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Roheline viirpapagoi, kes on väga sõbralik ja sotsiaalne.',
    personality: 'Sõbralik, sotsiaalne, aktiivne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Budgies%2C_aka_Parakeets_or_Small_parrots.jpg',
    category: 'väike'
  },
  {
    id: 'jack',
    name: 'Jack',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Sinine viirpapagoi, kes armastab laulda teiste lindudega.',
    personality: 'Lauluhimuline, sinine, rõõmsameelne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Budgerigar-male-strzelecki-qld.jpg/960px-Budgerigar-male-strzelecki-qld.jpg',
    category: 'väike'
  },
  {
    id: 'ian',
    name: 'Ian',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Valge viirpapagoi, kes on väga rahulik ja armas.',
    personality: 'Rahulik, armas, valge nagu pilv',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Budgies%2C_aka_Parakeets_or_Small_parrots.jpg',
    category: 'väike'
  },
  {
    id: 'roi',
    name: 'Roi',
    species: 'Budgerigar',
    speciesEst: 'Viirpapagoi',
    description: 'Viimane meie viirpapagoidest, kes täiendab suurepäraselt parve.',
    personality: 'Täiendav, ühiskondlik, rõõmus',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Budgerigar-male-strzelecki-qld.jpg/960px-Budgerigar-male-strzelecki-qld.jpg',
    category: 'väike'
  }
];

export const getParrotsByCategory = (category: 'suur' | 'keskmine' | 'väike') => {
  return parrots.filter(parrot => parrot.category === category);
};

export const getParrotById = (id: string) => {
  return parrots.find(parrot => parrot.id === id);
};

export const totalParrots = parrots.length;
export const totalSpecies = new Set(parrots.map(p => p.species)).size;

// Hinnakirjad
export const pricing = {
  visit: {
    basePrice: 10,
    minimumAmount: 30,
    description: 'Külastus (min 30 EUR)'
  },
  mobileService: {
    basePrice: 250,
    description: 'Papagoid üritusele (250 EUR)'
  },
  centerEvent: {
    basePrice: 350,
    description: 'Üritus keskuses (350 EUR)'
  },
  birdHotel: {
    basePrice: 5,
    description: 'Linnuhotell (alates 5 EUR/päev)'
  }
};

// Gruppide tüübid
export const groupTypes = {
  family: {
    key: 'perevisit',
    name: 'Perevisit',
    description: 'Ideaalne peredele lastega',
    icon: 'Users'
  },
  school: {
    key: 'kool',
    name: 'Kool/Lasteaed',
    description: 'Hariduslik programm lastele',
    icon: 'GraduationCap'
  },
  company: {
    key: 'ettevote',
    name: 'Ettevõte',
    description: 'Meeskonnasündmus või klienditeenindus',
    icon: 'Building'
  },
  other: {
    key: 'muu',
    name: 'Muu',
    description: 'Muud grupid ja sündmused',
    icon: 'Star'
  }
};
