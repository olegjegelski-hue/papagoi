import { RISTIISA_ENABLED } from '@/lib/features'
import {
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  BIRTHDAY_PRICE_EUR,
  CLOSES,
  EMAIL,
  GEO_LATITUDE,
  GEO_LONGITUDE,
  GIFT_CARD_UNIT_EUR,
  LEGAL_NAME,
  OPENS,
  PHONE,
  POSTAL_CODE,
  REG_CODE,
  STREET_ADDRESS,
  VISIT_PRICE_EUR,
  vipPriceBounds,
} from '@/lib/site-facts'
import { VIP_PRICE_TIERS } from '@/lib/vip-visit'

function localeUrl(base: string, locale: string, path = ''): string {
  const clean = path.replace(/^\//, '')
  return clean ? `${base}/${locale}/${clean}` : `${base}/${locale}`
}

function vipTiersLine(): string {
  return VIP_PRICE_TIERS.map(
    (tier) => `${tier.min}–${tier.max} inimest ${tier.price} €`,
  ).join('; ')
}

function pageLinks(base: string): string {
  const locales = ['et', 'en', 'ru'] as const
  const paths: Array<{ label: string; path: string }> = [
    { label: 'Avaleht / Home / Главная', path: '' },
    { label: 'Teenused / Services / Услуги', path: 'teenused' },
    { label: 'Broneeri / Book / Бронировать', path: 'broneeri' },
    { label: 'Kinkekaart / Gift card / Подарочная карта', path: 'kinkekaart' },
    { label: 'Külastajatele / Visitors / Посетителям', path: 'kulastajatele' },
    { label: 'Kontakt / Contact / Контакты', path: 'kontakt' },
    { label: 'Meist / About / О нас', path: 'meist' },
    { label: 'Papagoid / Parrots / Попугаи', path: 'papagoid' },
    { label: 'Toetused / Funding / Поддержка', path: 'toetused' },
    { label: 'Blogi / Blog / Блог', path: 'blogi' },
    { label: 'Privaatsus / Privacy / Конфиденциальность', path: 'privaatsus' },
  ]
  if (RISTIISA_ENABLED) {
    paths.splice(9, 0, {
      label: 'Ristiisa / Godparent / Крёстный',
      path: 'ristiisa-programm',
    })
  }

  const lines: string[] = []
  for (const item of paths) {
    const urls = locales.map((locale) => localeUrl(base, locale, item.path)).join(' | ')
    lines.push(`- ${item.label}: ${urls}`)
  }
  return lines.join('\n')
}

export function buildLlmsTxt(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const vip = vipPriceBounds()
  const book = localeUrl(base, 'et', 'broneeri')
  const services = localeUrl(base, 'et', 'teenused')
  const gift = localeUrl(base, 'et', 'kinkekaart')
  const support = localeUrl(base, 'et', 'toetused')
  const donate = `${support}#anneta`

  return `# Papagoi Keskus

> Eesti esimene papagoidekeskus Tartu lähedal Soinastes (alates 2015). Külastus ainult broneerimisega.

${LEGAL_NAME}, registrikood ${REG_CODE}.
Aadress: ${STREET_ADDRESS}, ${ADDRESS_LOCALITY}, ${ADDRESS_REGION} ${POSTAL_CODE}, Eesti.
Koordinaadid: ${GEO_LATITUDE}, ${GEO_LONGITUDE} (~8 km Tartu kesklinnast, sõiduaeg ~15 min).
Kontakt: ${PHONE}, ${EMAIL}.
Lahtiolekuajad: E–P ${OPENS}–${CLOSES}. Külastus ainult eelneval kokkuleppel.

## Eesti

Papagoi Keskus on Eesti esimene papagoidekeskus. Asutatud 2015; tegutseb Tartu lähedal Soinastes (Kambja vald). Üle 50 papagoi elab puurivabalt keskuse 50 m² toas koos pererahvaga.

Külastus kestab ca 1 tund, hind ${VISIT_PRICE_EUR} € inimese kohta (tavakülastus min 3 inimest; 0–2-aastased tasuta). Broneeri: ${book}. Giid ja külastus eesti, inglise või vene keeles.

Sobib peredele, lasteaedadele ja koolidele (lasteaiad/koolid kuni 30, täiskasvanud kuni 20), ettevõtetele. Kooli 1.–9. klass saab tasuda Kultuuriranitsast: ${support}.

Sünnipäev keskuses: 2,5 tundi, ${BIRTHDAY_PRICE_EUR} €. VIP külastus: privaatne, 1–20 inimest, 45–60 min, ${vip.low}–${vip.high} € (${vipTiersLine()}). Tööpäeviti 10:00–18:00; nädalavahetusel ja riigipühadel 10:00, 11:00 või 18:00. Teenused: ${services}.

Kinkekaart: ${GIFT_CARD_UNIT_EUR} € = 1 külastus, summa 10 € sammuga. ${gift}

Annetused (kingi külastus, loomade toit, üldine; 10–1000 €, 10 € samm): ${donate}

Giidi juhendamisel saab papagoisid käest toita. Parkimine tasuta maja ees.

## English

Papagoi Keskus (Parrot Centre) is Estonia’s first parrot centre, open since 2015 near Tartu in Soinaste (Kambja parish). Over 50 parrots live cage-free in a 50 m² room with the family.

A visit lasts about 1 hour and costs €${VISIT_PRICE_EUR} per person (regular visit minimum 3 people; children 0–2 free). Book: ${localeUrl(base, 'en', 'broneeri')}. Guiding in Estonian, English or Russian.

For families, kindergartens and schools (kindergartens/schools up to 30, adults up to 20), and companies. Grades 1–9 can pay with the Culture Backpack (Kultuuriranits): ${localeUrl(base, 'en', 'toetused')}.

Birthday programme on site: 2.5 hours, €${BIRTHDAY_PRICE_EUR}. VIP visit: private, 1–20 guests, 45–60 min, €${vip.low}–€${vip.high}. Services: ${localeUrl(base, 'en', 'teenused')}.

Gift card: €${GIFT_CARD_UNIT_EUR} = 1 visit. ${localeUrl(base, 'en', 'kinkekaart')}
Donations: ${localeUrl(base, 'en', 'toetused')}#anneta
Contact: ${PHONE}, ${EMAIL}. Open Mon–Sun ${OPENS}–${CLOSES}, by appointment only.

## Русский

Papagoi Keskus (Центр попугаев) — первый в Эстонии центр попугаев, с 2015 года, рядом с Тарту в Сойнасте (волость Камбья). Более 50 попугаев живут без клеток в зале 50 м² вместе с семьёй.

Визит около 1 часа, ${VISIT_PRICE_EUR} € с человека (обычный визит минимум 3 человека; дети 0–2 лет бесплатно). Бронь: ${localeUrl(base, 'ru', 'broneeri')}. Гид на эстонском, английском или русском.

Для семей, детских садов и школ (сады/школы до 30, взрослые до 20), компаний. 1–9 класс может оплатить из Kultuuriranits: ${localeUrl(base, 'ru', 'toetused')}.

День рождения в центре: 2,5 часа, ${BIRTHDAY_PRICE_EUR} €. VIP-визит: частный, 1–20 человек, 45–60 мин, ${vip.low}–${vip.high} €. Услуги: ${localeUrl(base, 'ru', 'teenused')}.

Подарочная карта: ${GIFT_CARD_UNIT_EUR} € = 1 визит. ${localeUrl(base, 'ru', 'kinkekaart')}
Пожертвования: ${localeUrl(base, 'ru', 'toetused')}#anneta
Контакт: ${PHONE}, ${EMAIL}. Пн–Вс ${OPENS}–${CLOSES}, только по записи.

## Lingid / Links / Ссылки

${pageLinks(base)}
`
}

export function buildLlmsFullTxt(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const vip = vipPriceBounds()
  return `${buildLlmsTxt(baseUrl).trim()}

## Täpsemalt / Details (saidil olev fakt)

- Tavakülastus sisaldab: giidi jutt papagoidest, tutvumine liikidega, toitmine käest, pildistamine; merisigade toitmine; soovi korral aara käe peale pildiks.
- Üritus papagoidega väljas: 250 € + kohalesõidutasu, ca 1 tund (Teenused).
- Grupid: koolid, lasteaiad, ettevõtted, suured perekonnad; 10 € / inimene.
- Ligipääs: ratastooliga võimalik, sissepääsul üks aste. Parkimine tasuta maja ees.
- Tartust: Tartu–Võru mnt (E263) Ülenurme suunas, ~8 km pärast paremale Soinaste suunas.
- Annetuse sihtotstarbed: kingi külastus, loomade toit, üldine. MTÜ ei ole TMIN nimekirjas; maksusoodustust ei lubata.
- VIP hinnatabel: ${vipTiersLine()} (vahemik ${vip.low}–${vip.high} €).
- Kinkekaart lunastatakse keskuses; 10 € samm 10–1000 €.
`
}
