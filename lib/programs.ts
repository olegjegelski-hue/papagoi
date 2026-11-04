/** Õppeprogrammid lehele /toetusega. Uus programm = üks rida siin + nimi messages/{et,en,ru}.json. */

export const PROGRAM_STAGES = ['lasteaed', 'i', 'ii', 'iii', 'gymnasium'] as const

export type ProgramStage = (typeof PROGRAM_STAGES)[number]

export type ProgramTheme = 'ringmajandus' | 'kliima'

export type LearningProgram = {
  id: string
  stage: ProgramStage
  durationMin: number
  url: string
  kultuuriranits: boolean
  murakamargis: boolean
  theme?: ProgramTheme
}

export const LEARNING_PROGRAMS: LearningProgram[] = [
  {
    id: 'hool',
    stage: 'lasteaed',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/papagoi-lind-kes-vajab-hoolt-lasteaed-60-min',
    kultuuriranits: false,
    murakamargis: true,
  },
  {
    id: 'uhesugused',
    stage: 'i',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kaks-papagoid-ei-ole-uhesugused-1-3-klass-i-kooliaste-60-min',
    kultuuriranits: false,
    murakamargis: true,
  },
  {
    id: 'varv-saab',
    stage: 'i',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kust-papagoi-oma-varvi-saab-1-3-klass-i-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'haal',
    stage: 'i',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/miks-papagoi-raagib-inimese-haalega-1-3-klass-i-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'rutm',
    stage: 'i',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kas-lind-tunneb-rutmi-1-3-klass-i-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'soob',
    stage: 'ii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kes-keda-soob-troopika-mets-ja-meie-mets-4-6-klass-ii-kooliaste-60-min',
    kultuuriranits: false,
    murakamargis: true,
  },
  {
    id: 'prugist',
    stage: 'ii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/papagoi-manguasi-prugist-4-6-klass-ii-kooliaste-60-min',
    kultuuriranits: false,
    murakamargis: true,
    theme: 'ringmajandus',
  },
  {
    id: 'varv-sules',
    stage: 'ii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/varv-mida-sules-ei-ole-4-6-klass-ii-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'vali',
    stage: 'ii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kui-vali-papagoi-4-6-klass-ii-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'muusika',
    stage: 'ii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kes-liigub-muusika-jargi-4-6-klass-ii-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'cites',
    stage: 'iii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/lemmikloom-voi-ohustatud-liik-papagoid-ja-cites-7-9-klass-iii-kooliaste-60-min',
    kultuuriranits: false,
    murakamargis: true,
  },
  {
    id: 'kliima',
    stage: 'iii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kliima-muutub-mis-saab-papagoide-kodudest-7-9-klass-iii-kooliaste-60-min',
    kultuuriranits: false,
    murakamargis: true,
    theme: 'kliima',
  },
  {
    id: 'varv-valguses',
    stage: 'iii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kas-varv-linnu-peal-voi-valguses-7-9-klass-iii-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'vali-tohib',
    stage: 'iii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kui-vali-tohib-olla-7-9-klass-iii-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'rutmitaju',
    stage: 'iii',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kas-rutmitaju-ainult-inimesel-7-9-klass-iii-kooliaste-60-min',
    kultuuriranits: true,
    murakamargis: false,
  },
  {
    id: 'kasvatab',
    stage: 'gymnasium',
    durationMin: 60,
    url: 'https://keskkonnaharidus.ee/et/oppeprogrammid/kes-keda-kasvatab-papagoi-kui-lemmikloom-gumnaasium-60-min',
    kultuuriranits: false,
    murakamargis: false,
  },
]

/**
 * Hilisemad rahastajad (KIK, fondid, omavalitsused).
 * Tühi nimekiri ei kuva lehel midagi. Uus allikas = üks rida + tekstid ToetusegaPage.funders alla.
 */
export type FundingSource = {
  id: string
}

export const FUNDING_SOURCES: FundingSource[] = []
