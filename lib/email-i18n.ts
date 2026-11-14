import type { DonationPurpose } from '@/lib/donation'
import { DONATION_PURPOSE_NOTION } from '@/lib/donation'
import type { VisitMailLocale } from '@/lib/visit-language'
import { VIP_GROUP_TYPE, isVipGroupType } from '@/lib/vip-visit'

export type { VisitMailLocale }

/** MTÜ arveldusarve — toetuste läbipaistvusplokk jm. Kinkekaart ja annetus käivad Montonio pangalingiga. */
export const PAPAGOI_IBAN = 'EE432200221095075670'

const localeTag = (l: VisitMailLocale) => (l === 'en' ? 'en-GB' : l === 'ru' ? 'ru-RU' : 'et-EE')

/** Kuupäeva kuvatekst (pikk) külastuse ajaks Europe/Tallinn */
export function formatVisitDateLong(dateValue: string, locale: VisitMailLocale): string {
  return new Date(dateValue).toLocaleDateString(localeTag(locale), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Tallinn',
  })
}

export function formatVisitDateLongFromDate(d: Date, locale: VisitMailLocale): string {
  return d.toLocaleDateString(localeTag(locale), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Tallinn',
  })
}

/** Lühike kuupäev + kellaaeg teema reale */
/** Lühike kuupäev meilis (kehtiv kuni jms), keele järgi. */
export function formatMailDate(dateValue: string, locale: VisitMailLocale): string {
  const raw = (dateValue || '').trim()
  if (!raw) return ''
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  const ee = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  let isoDate = ''
  if (iso) isoDate = `${iso[1]}-${iso[2]}-${iso[3]}`
  else if (slash) isoDate = `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`
  else if (ee) isoDate = `${ee[3]}-${ee[2].padStart(2, '0')}-${ee[1].padStart(2, '0')}`
  if (!isoDate) return raw
  return new Date(`${isoDate}T12:00:00+02:00`).toLocaleDateString(localeTag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Tallinn',
  })
}

export function formatVisitDateForSubject(
  dateValue: string,
  timeSlot: string | undefined,
  locale: VisitMailLocale
): string {
  const short = new Date(dateValue).toLocaleDateString(localeTag(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Tallinn',
  })
  if (!timeSlot) return short
  if (locale === 'en') return `${short} at ${timeSlot}`
  if (locale === 'ru') return `${short} в ${timeSlot}`
  return `${short} kell ${timeSlot}`
}

export function bookingGroupTypeLabel(
  locale: VisitMailLocale,
  groupType?: string
): string | undefined {
  if (!groupType) return undefined
  const map: Record<string, Record<VisitMailLocale, string>> = {
    perevisit: { et: 'Perevisit', en: 'Family visit', ru: 'Семейный визит' },
    kool: { et: 'Kool/Lasteaed', en: 'School / kindergarten', ru: 'Школа / детский сад' },
    ettevote: { et: 'Ettevõte', en: 'Company', ru: 'Компания' },
    muu: { et: 'Muu', en: 'Other', ru: 'Другое' },
    'vip-kulastus': { et: 'VIP külastus', en: 'VIP visit', ru: 'VIP-визит' },
  }
  return map[groupType]?.[locale] ?? map.muu[locale]
}

/** Vormi `groupType` → Külastajad Select „Grupi tüüp“. Tühi → ära kirjuta; tundmatu → „Muu“. */
export function groupTypeToNotionSelect(groupType?: string | null): string | undefined {
  if (!groupType?.trim()) return undefined
  if (isVipGroupType(groupType)) return 'VIP külastus'
  const n = groupType.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '')
  return bookingGroupTypeLabel('et', n === VIP_GROUP_TYPE ? VIP_GROUP_TYPE : n)
}

export type CanonicalReviewGroupType =
  | 'Perevisit'
  | 'Kool/Lasteaed'
  | 'Ettevõte'
  | 'Muu'
  | 'VIP külastus'

export type ReviewFundingVariant = 'parent' | 'school'
export type ReviewDonateVariant = 'default' | 'company'
export type ReviewInviteBoxKind = 'parent' | 'school' | 'company' | 'plain'

function canonicalReviewGroupType(groupType?: string | null): CanonicalReviewGroupType | null {
  if (!groupType?.trim()) return null
  const raw = groupType.trim()
  if (raw === 'Kool/Lasteaed') return 'Kool/Lasteaed'
  if (raw === 'Perevisit') return 'Perevisit'
  if (raw === 'Ettevõte') return 'Ettevõte'
  if (raw === 'Muu') return 'Muu'
  if (raw === 'VIP külastus') return 'VIP külastus'
  if (isVipGroupType(raw)) return 'VIP külastus'
  const n = raw.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '')
  if (n === 'kool') return 'Kool/Lasteaed'
  if (n === 'perevisit') return 'Perevisit'
  if (n === 'ettevote') return 'Ettevõte'
  if (n === 'muu') return 'Muu'
  if (n === VIP_GROUP_TYPE) return 'VIP külastus'
  return null
}

/** Annetuse rida arvustuskirjas: Perevisit / Ettevõte / Muu / VIP. Kool/Lasteaed ja tühi → ei. */
export function shouldShowReviewDonationLine(groupType?: string | null): boolean {
  return reviewDonateVariant(groupType) !== null
}

/** Annetuse teksti variant: tavaline (Perevisit/Muu/VIP) või ettevõtte (C). */
export function reviewDonateVariant(groupType?: string | null): ReviewDonateVariant | null {
  const g = canonicalReviewGroupType(groupType)
  if (g === 'Ettevõte') return 'company'
  if (g === 'Perevisit' || g === 'Muu' || g === 'VIP külastus') return 'default'
  return null
}

/** Toetuste rida arvustuskirjas: A lapsevanemale, B õpetajale, muul juhul puudub. */
export function reviewFundingVariant(groupType?: string | null): ReviewFundingVariant | null {
  const g = canonicalReviewGroupType(groupType)
  if (g === 'Perevisit' || g === 'Muu' || g === 'VIP külastus') return 'parent'
  if (g === 'Kool/Lasteaed') return 'school'
  return null
}

export function reviewInviteBoxKind(groupType?: string | null): ReviewInviteBoxKind {
  const funding = reviewFundingVariant(groupType)
  if (funding === 'parent') return 'parent'
  if (funding === 'school') return 'school'
  if (reviewDonateVariant(groupType) === 'company') return 'company'
  return 'plain'
}

export function visitLanguageLabelForEmail(locale: VisitMailLocale, code: VisitMailLocale): string {
  const labels: Record<VisitMailLocale, Record<VisitMailLocale, string>> = {
    et: { et: 'eesti keel', en: 'inglise keel', ru: 'vene keel' },
    en: { et: 'Estonian', en: 'English', ru: 'Russian' },
    ru: { et: 'эстонский', en: 'английский', ru: 'русский' },
  }
  return labels[locale][code]
}

export function calendarStrings(locale: VisitMailLocale, vip = false) {
  const t = {
    et: {
      title: vip ? 'VIP külastus Papagoi Keskuses' : 'Broneering Papagoi Keskuses',
      description: vip
        ? 'Privaatne VIP külastus Papagoi Keskuses. Kestus 45–60 min. Slot on ainult teie seltskonnale. Palume olla kohal 5–10 min varem.'
        : 'Külastus Papagoi Keskuses. Külastuse kestus: 45–60 min. Palume olla kohal 5–10 min varem.',
    },
    en: {
      title: vip ? 'VIP visit — Papagoi Centre' : 'Booking — Papagoi Centre',
      description: vip
        ? 'Private VIP visit at Papagoi Centre. Duration 45–60 min. The slot is reserved for your party only. Please arrive 5–10 minutes early.'
        : 'Visit at Papagoi Centre. Duration: about 45–60 min. Please arrive 5–10 minutes early.',
    },
    ru: {
      title: vip ? 'VIP-визит — центр попугаев Papagoi' : 'Бронирование — центр попугаев Papagoi',
      description: vip
        ? 'Приватный VIP-визит в центре Papagoi. Длительность 45–60 мин. Слот только для вашей компании. Просим приехать за 5–10 минут.'
        : 'Визит в центр попугаев Papagoi. Длительность: около 45–60 мин. Просим приехать за 5–10 минут до начала.',
    },
  }
  return t[locale]
}

export function getBookingEmailCopy(locale: VisitMailLocale) {
  const c = {
    et: {
      title: 'Broneeringu päring',
      nbHtml: `NB! Tegemist on broneeringu päringuga. Broneering jõustub pärast meie kinnituskirja.<br><br>Kinnitame päringu esimesel võimalusel (tavaliselt 24 h jooksul).<br><em>Kui kinnitust ei tule 24 h jooksul, palume vastata sellele kirjale või helistada.</em>`,
      clientTitle: 'Kliendi andmed:',
      name: 'Nimi:',
      email: 'E-post:',
      phone: 'Telefon:',
      visitLang: 'Soovitud keel külastusel:',
      detailsTitle: 'Broneeringu üksikasjad:',
      id: 'ID:',
      date: 'Kuupäev:',
      time: 'Kellaaeg:',
      timeSlotSuffix:
        ' Alustame täistunnil. Palume olla kohal 5–10 min varem, kutsume teid ise sisse.',
      duration: 'Külastuse kestus:',
      durationVal: '45–60 min',
      groupSize: 'Grupi suurus:',
      groupSizeNote: ' inimest (paneme gruppe kokku, võivad veel liituda teised külastajad)',
      groupType: 'Grupi tüüp:',
      price: 'Hind:',
      payment: 'Maksmine:',
      paymentVal: 'pärast külastust kohapeal, ainult sularaha (pangaterminal puudub)',
      extraTitle: 'Lisainfo:',
      regards: 'Lugupidamisega',
      centre: 'Papagoi Keskus',
      tel: 'Tel +372 51 27 938',
      sent: 'Saadetud:',
      subjectPrefix: 'Broneeringu päring:',
      textHeader: 'BRONEERINGU PÄRING',
      textNb: `NB! Tegemist on broneeringu päringuga. Broneering jõustub pärast meie kinnituskirja.\n\nKinnitame päringu esimesel võimalusel (tavaliselt 24 h jooksul).\nKui kinnitust ei tule 24 h jooksul, palume vastata sellele kirjale või helistada.`,
      textClient: 'Kliendi andmed:',
      textDetails: 'Broneeringu üksikasjad:',
    },
    en: {
      title: 'Booking request',
      nbHtml: `This is a <strong>booking request</strong>. Your booking is confirmed only after our confirmation email.<br><br>We will confirm as soon as possible (usually within 24 hours).<br><em>If you do not hear from us within 24 hours, please reply to this email or call us.</em>`,
      clientTitle: 'Your details:',
      name: 'Name:',
      email: 'Email:',
      phone: 'Phone:',
      visitLang: 'Preferred language for the visit:',
      detailsTitle: 'Booking details:',
      id: 'ID:',
      date: 'Date:',
      time: 'Time:',
      timeSlotSuffix:
        ' Visits start on the hour. Please arrive 5–10 minutes early; we will invite you in.',
      duration: 'Visit duration:',
      durationVal: '45–60 min',
      groupSize: 'Group size:',
      groupSizeNote: ' people (we may combine groups; others may join)',
      groupType: 'Group type:',
      price: 'Price:',
      payment: 'Payment:',
      paymentVal: 'after your visit, on site, cash only (no card terminal)',
      extraTitle: 'Additional notes:',
      regards: 'Best regards',
      centre: 'Papagoi Centre',
      tel: 'Tel +372 51 27 938',
      sent: 'Sent:',
      subjectPrefix: 'Booking request:',
      textHeader: 'BOOKING REQUEST',
      textNb: `This is a booking request. Your booking is confirmed only after our confirmation email.\n\nWe will confirm as soon as possible (usually within 24 hours).\nIf you do not hear from us within 24 hours, please reply to this email or call us.`,
      textClient: 'Your details:',
      textDetails: 'Booking details:',
    },
    ru: {
      title: 'Запрос на бронирование',
      nbHtml: `Это <strong>запрос на бронирование</strong>. Бронирование действует только после нашего письма с подтверждением.<br><br>Мы подтвердим как можно скорее (обычно в течение 24 часов).<br><em>Если ответа нет в течение 24 часов, ответьте на это письмо или позвоните нам.</em>`,
      clientTitle: 'Ваши данные:',
      name: 'Имя:',
      email: 'Эл. почта:',
      phone: 'Телефон:',
      visitLang: 'Желаемый язык экскурсии:',
      detailsTitle: 'Детали бронирования:',
      id: 'ID:',
      date: 'Дата:',
      time: 'Время:',
      timeSlotSuffix:
        ' Начало в начале часа. Просим прибыть за 5–10 минут; мы сами пригласим вас войти.',
      duration: 'Длительность визита:',
      durationVal: '45–60 мин',
      groupSize: 'Размер группы:',
      groupSizeNote: ' чел. (группы могут объединяться; возможны другие гости)',
      groupType: 'Тип группы:',
      price: 'Цена:',
      payment: 'Оплата:',
      paymentVal: 'после визита на месте, только наличными (терминала нет)',
      extraTitle: 'Дополнительно:',
      regards: 'С уважением',
      centre: 'Центр Papagoi',
      tel: 'Тел. +372 51 27 938',
      sent: 'Отправлено:',
      subjectPrefix: 'Запрос на бронирование:',
      textHeader: 'ЗАПРОС НА БРОНИРОВАНИЕ',
      textNb: `Это запрос на бронирование. Бронирование действует только после нашего письма с подтверждением.\n\nМы подтвердим как можно скорее (обычно в течение 24 часов).\nЕсли ответа нет в течение 24 часов, ответьте на это письмо или позвоните.`,
      textClient: 'Ваши данные:',
      textDetails: 'Детали бронирования:',
    },
  }
  return c[locale]
}

export function getConfirmationEmailCopy(locale: VisitMailLocale) {
  const visitorsUrl = (path: string) => {
    const base = (process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee').replace(/\/$/, '')
    return `${base}${path}`
  }
  const rulesHref = visitorsUrl(
    locale === 'en' ? '/en/kulastajatele#reeglid-ja-juhised' : locale === 'ru' ? '/ru/kulastajatele#reeglid-ja-juhised' : '/kulastajatele#reeglid-ja-juhised'
  )
  const rulesLabelShort = {
    et: 'papagoi.ee/kulastajatele',
    en: 'Visitors info (rules)',
    ru: 'Информация для посетителей',
  }[locale]

  const c = {
    et: {
      title: 'Papagoi Keskuse broneeringu kinnitus',
      greeting: 'Tere',
      bookingBlockTitle: 'Broneeringu andmed',
      location: 'Asukoht:',
      locationLine:
        'Papagoi Keskus – Tartu mnt 80, Soinaste, Kambja vald',
      date: 'Kuupäev:',
      time: 'Kellaaeg:',
      timeSlotSuffix:
        ' Alustame täistunnil. Palume olla kohal 5–10 min varem, kutsume teid ise sisse.',
      duration: 'Külastuse kestus:',
      durationVal: '45–60 min',
      groupSize: 'Grupi suurus:',
      groupSizeNote: ' inimest (paneme gruppe kokku, võivad veel liituda teised külastajad)',
      price: 'Hind:',
      payment: 'Maksmine:',
      paymentVal: 'pärast külastust kohapeal, ainult sularaha (pangaterminal puudub)',
      calendarTitle: 'Lisa broneering kalendrisse',
      google: 'Lisa Google Calendrisse',
      outlook: "Lisa Outlook'i",
      ics: 'Laadi alla .ics',
      icsNote: '(sobib enamustele kalendritele)',
      changeHint:
        'Kui soovid aega muuta või ei saa tulla, vasta palun sellele kirjale või helista tel ',
      infoTitle: 'Infoks',
      infoTreat:
        'Kui soovite, võite papagoidele ja merisigadele kaasa tuua midagi värsket – see on igati teretulnud. Sobivad näiteks paprika, kurk, salat, brokoli, õun ja viinamarjad. Külakost ei ole ootus, vaid soovi korral väike lisarõõm.',
      infoNoise:
        'Papagoid lendavad vabalt ringi ja teevad palju hääli. Kui tulete lastega, valmistage nad veidi ette.',
      infoGuide:
        'Külastusel palume järgida juhendaja juhiseid (lindude ja külastajate turvalisuse tagamiseks).',
      infoSocksBold: 'Soovitame kanda tumedamaid sokke (mitte valgeid).',
      infoSocksRest:
        ' Põrand on enne külastust pestud, kuid külastuse ajal võivad papagoid söömise käigus pudistada pähkleid ja värsket toitu, mida anname koos teiega. Seetõttu võib põrand külastuse lõpuks olla veidi pudine ning heledad sokid võivad määrduda.',
      rulesLead: 'Reeglid, ohutus ja praktiline info',
      rulesRest: '– kõik oluline enne külastust:',
      regards: 'Lugupidamisega',
      centre: 'Papagoi Keskus',
      tel: 'Tel +372 51 27 938',
      sent: 'Saadetud:',
      subjectNormal: 'Broneeringu kinnitus – Papagoi Keskus',
      subjectAdmin: '[Admin] Broneeringu kinnitus – puudub kliendi e-post:',
      textTitle: 'PAPAGOI KESKUSE BRONEERINGU KINNITUS',
      textBooking: 'Broneeringu andmed',
      textLocation: 'Asukoht:',
      textMaps: 'Google Maps:',
      textChangeBlock:
        'Kui soovid aega muuta või ei saa tulla, vasta palun sellele kirjale või helista tel +372 512 7938.',
      textInfo: 'Infoks',
      textRules: 'Reeglid, ohutus ja praktiline info – kõik oluline enne külastust:',
      calendarTextIntro: 'Lisa broneering kalendrisse:',
    },
    en: {
      title: 'Your booking is confirmed — Papagoi Centre',
      greeting: 'Hello',
      bookingBlockTitle: 'Booking details',
      location: 'Location:',
      locationLine: 'Papagoi Centre – Tartu mnt 80, Soinaste, Kambja vald',
      date: 'Date:',
      time: 'Time:',
      timeSlotSuffix:
        ' Visits start on the hour. Please arrive 5–10 minutes early; we will invite you in.',
      duration: 'Visit duration:',
      durationVal: '45–60 min',
      groupSize: 'Group size:',
      groupSizeNote: ' people (we may combine groups; others may join)',
      price: 'Price:',
      payment: 'Payment:',
      paymentVal: 'after your visit, on site, cash only (no card terminal)',
      calendarTitle: 'Add to your calendar',
      google: 'Google Calendar',
      outlook: 'Outlook',
      ics: 'Download .ics',
      icsNote: '(works with most calendar apps)',
      changeHint:
        'To change the time or if you cannot come, please reply to this email or call ',
      infoTitle: 'Good to know',
      infoTreat:
        'You are welcome to bring fresh treats for the parrots and guinea pigs if you like — e.g. bell pepper, cucumber, lettuce, broccoli, apple, grapes. Treats are optional, not expected.',
      infoNoise:
        'Parrots fly freely and can be noisy. If you visit with children, please prepare them a little.',
      infoGuide:
        'Please follow the guide’s instructions during the visit (for everyone’s safety).',
      infoSocksBold: 'We recommend darker socks (not white).',
      infoSocksRest:
        ' The floor is cleaned before visits, but during the visit parrots may scatter nuts and fresh food we share with you, so the floor may get a bit messy and light socks may stain.',
      rulesLead: 'Rules, safety & practical info',
      rulesRest: '— everything important before your visit:',
      regards: 'Best regards',
      centre: 'Papagoi Centre',
      tel: 'Tel +372 51 27 938',
      sent: 'Sent:',
      subjectNormal: 'Booking confirmation — Papagoi Centre',
      subjectAdmin: '[Admin] Booking confirmation — missing guest email:',
      textTitle: 'BOOKING CONFIRMATION — PAPAGOI CENTRE',
      textBooking: 'Booking details',
      textLocation: 'Location:',
      textMaps: 'Google Maps:',
      textChangeBlock:
        'To change the time or if you cannot come, reply to this email or call +372 512 7938.',
      textInfo: 'Good to know',
      textRules: 'Rules, safety & practical info:',
      calendarTextIntro: 'Add to calendar:',
    },
    ru: {
      title: 'Бронирование подтверждено — центр Papagoi',
      greeting: 'Здравствуйте',
      bookingBlockTitle: 'Детали бронирования',
      location: 'Адрес:',
      locationLine: 'Центр Papagoi — Tartu mnt 80, Soinaste, Kambja vald',
      date: 'Дата:',
      time: 'Время:',
      timeSlotSuffix:
        ' Начало в начале часа. Просим прибыть за 5–10 минут; мы сами пригласим вас войти.',
      duration: 'Длительность:',
      durationVal: '45–60 мин',
      groupSize: 'Размер группы:',
      groupSizeNote: ' чел. (группы могут объединяться; возможны другие гости)',
      price: 'Цена:',
      payment: 'Оплата:',
      paymentVal: 'после визита на месте, только наличными (терминала нет)',
      calendarTitle: 'Добавить в календарь',
      google: 'Google Календарь',
      outlook: 'Outlook',
      ics: 'Скачать .ics',
      icsNote: '(подходит для большинства календарей)',
      changeHint:
        'Чтобы изменить время или отменить визит, ответьте на это письмо или позвоните ',
      infoTitle: 'Полезно знать',
      infoTreat:
        'По желанию можно принести попугаям и морским свинкам что-нибудь свежее — например перец, огурец, салат, брокколи, яблоко, виноград. Это не обязательно, а просто приятный жест.',
      infoNoise:
        'Попугаи летают свободно и могут быть шумными. Если вы с детьми, немного подготовьте их.',
      infoGuide:
        'Во время визита просим следовать указаниям гида (ради безопасности птиц и гостей).',
      infoSocksBold: 'Рекомендуем тёмные носки (не белые).',
      infoSocksRest:
        ' Пол мы моем перед визитами, но во время экскурсии попугаи могут рассыпать орехи и свежую еду — пол может стать немного грязным, светлые носки могут испачкаться.',
      rulesLead: 'Правила, безопасность и практическая информация',
      rulesRest: '— всё важное перед визитом:',
      regards: 'С уважением',
      centre: 'Центр Papagoi',
      tel: 'Тел. +372 51 27 938',
      sent: 'Отправлено:',
      subjectNormal: 'Подтверждение бронирования — центр Papagoi',
      subjectAdmin: '[Админ] Подтверждение — нет email гостя:',
      textTitle: 'ПОДТВЕРЖДЕНИЕ БРОНИРОВАНИЯ — ЦЕНТР PAPAGOI',
      textBooking: 'Детали бронирования',
      textLocation: 'Адрес:',
      textMaps: 'Google Карты:',
      textChangeBlock:
        'Чтобы изменить время или отменить визит, ответьте на это письмо или позвоните +372 512 7938.',
      textInfo: 'Полезно знать',
      textRules: 'Правила, безопасность и практическая информация:',
      calendarTextIntro: 'Добавить в календарь:',
    },
  }
  const block = c[locale]
  return { ...block, rulesHref, rulesLabelShort }
}

export function getVipBookingEmailCopy(locale: VisitMailLocale) {
  const base = getBookingEmailCopy(locale)
  const v = {
    et: {
      title: 'VIP külastuse päring',
      nbHtml: `NB! Tegemist on <strong>privaatse VIP külastuse</strong> päringuga. Broneering jõustub pärast meie kinnituskirja (kinnitus tuleb eraldi).<br><br>Slot on ainult teie seltskonnale — teisi gruppe samale ajale ei lisata.<br>Kestus 45–60 min. Ettemaksu ei ole; tasumine kohapeal või ülekandega.<br><em>Kui kinnitust ei tule 24 h jooksul, palume vastata sellele kirjale või helistada.</em>`,
      durationVal: '45–60 min',
      groupSizeNote: ' inimest (privaatne VIP külastus — slot on ainult teile)',
      paymentVal: 'kohapeal või ülekandega (ettemaksu ei ole)',
      subjectPrefix: '👑 VIP külastus:',
      textHeader: 'VIP KÜLASTUSE PÄRING',
      textNb: `NB! Tegemist on privaatse VIP külastuse päringuga. Broneering jõustub pärast meie kinnituskirja (kinnitus tuleb eraldi).\n\nSlot on ainult teie seltskonnale — teisi gruppe samale ajale ei lisata.\nKestus 45–60 min. Ettemaksu ei ole; tasumine kohapeal või ülekandega.\nKui kinnitust ei tule 24 h jooksul, palume vastata sellele kirjale või helistada.`,
    },
    en: {
      title: 'VIP visit request',
      nbHtml: `This is a <strong>private VIP visit</strong> request. Your booking is confirmed only after our confirmation email (sent separately).<br><br>The slot is reserved for your party only — no other groups will be added at this time.<br>Duration 45–60 min. No prepayment; pay on site or by bank transfer.<br><em>If you do not hear from us within 24 hours, please reply to this email or call us.</em>`,
      durationVal: '45–60 min',
      groupSizeNote: ' people (private VIP visit — the slot is yours only)',
      paymentVal: 'on site or by bank transfer (no prepayment)',
      subjectPrefix: '👑 VIP visit:',
      textHeader: 'VIP VISIT REQUEST',
      textNb: `This is a private VIP visit request. Your booking is confirmed only after our confirmation email (sent separately).\n\nThe slot is reserved for your party only — no other groups will be added at this time.\nDuration 45–60 min. No prepayment; pay on site or by bank transfer.\nIf you do not hear from us within 24 hours, please reply to this email or call us.`,
    },
    ru: {
      title: 'Запрос на VIP-визит',
      nbHtml: `Это запрос на <strong>приватный VIP-визит</strong>. Бронирование действует только после нашего письма с подтверждением (придёт отдельно).<br><br>Слот только для вашей компании — другие группы в это время не добавляются.<br>Длительность 45–60 мин. Предоплаты нет; оплата на месте или переводом.<br><em>Если ответа нет в течение 24 часов, ответьте на это письмо или позвоните нам.</em>`,
      durationVal: '45–60 мин',
      groupSizeNote: ' чел. (приватный VIP-визит — слот только для вас)',
      paymentVal: 'на месте или банковским переводом (предоплаты нет)',
      subjectPrefix: '👑 VIP-визит:',
      textHeader: 'ЗАПРОС НА VIP-ВИЗИТ',
      textNb: `Это запрос на приватный VIP-визит. Бронирование действует только после нашего письма с подтверждением (придёт отдельно).\n\nСлот только для вашей компании — другие группы в это время не добавляются.\nДлительность 45–60 мин. Предоплаты нет; оплата на месте или переводом.\nЕсли ответа нет в течение 24 часов, ответьте на это письмо или позвоните.`,
    },
  }
  return { ...base, ...v[locale] }
}

export function getVipConfirmationEmailCopy(locale: VisitMailLocale) {
  const base = getConfirmationEmailCopy(locale)
  const v = {
    et: {
      title: 'VIP külastus on kinnitatud — Papagoi Keskus',
      durationVal: '45–60 min',
      groupSizeNote: ' inimest (privaatne VIP külastus — slot on ainult teile)',
      paymentVal: 'kohapeal või ülekandega (ettemaksu ei ole)',
      subjectNormal: '👑 VIP külastus kinnitatud – Papagoi Keskus',
      subjectAdmin: '[Admin] 👑 VIP külastus kinnitus – puudub kliendi e-post:',
      textTitle: 'VIP KÜLASTUS ON KINNITATUD — PAPAGOI KESKUS',
    },
    en: {
      title: 'Your VIP visit is confirmed — Papagoi Centre',
      durationVal: '45–60 min',
      groupSizeNote: ' people (private VIP visit — the slot is yours only)',
      paymentVal: 'on site or by bank transfer (no prepayment)',
      subjectNormal: '👑 VIP visit confirmed — Papagoi Centre',
      subjectAdmin: '[Admin] 👑 VIP visit confirmation — missing guest email:',
      textTitle: 'VIP VISIT CONFIRMED — PAPAGOI CENTRE',
    },
    ru: {
      title: 'VIP-визит подтверждён — центр Papagoi',
      durationVal: '45–60 мин',
      groupSizeNote: ' чел. (приватный VIP-визит — слот только для вас)',
      paymentVal: 'на месте или банковским переводом (предоплаты нет)',
      subjectNormal: '👑 VIP-визит подтверждён — центр Papagoi',
      subjectAdmin: '[Админ] 👑 VIP-визит — нет email гостя:',
      textTitle: 'VIP-ВИЗИТ ПОДТВЕРЖДЁН — ЦЕНТР PAPAGOI',
    },
  }
  return { ...base, ...v[locale] }
}

export function getGiftCardOrderEmailCopy(locale: VisitMailLocale) {
  const c = {
    et: {
      subject: (amountEur: number) => `Kinkekaardi päring – Papagoi Keskus (${amountEur} €)`,
      title: 'Kinkekaardi päring',
      greeting: (name: string) => `Tere, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Tere, ${name}!`,
      thanks: 'Täname teid kinkekaardi päringu eest.',
      customerPhone: 'Kliendi telefon:',
      questions:
        'Kui teil on küsimusi, võtke ühendust: +372 512 7938 või keskus@papagoi.ee.',
      transferLead: 'Palume teha ülekanne:',
      recipient: 'Saaja:',
      recipientValue: 'Papagoi Keskus MTÜ',
      iban: 'IBAN:',
      ibanValue: PAPAGOI_IBAN,
      reference: 'Selgitus:',
      referenceValue: (code: string) => `Kinkekaart ${code}`,
      afterTransfer:
        'Andke meile teada kui ülekanne tehtud, saadame teile kinkekaardi mailile.',
      detailsTitle: 'Kinkekaardi andmed',
      value: 'Väärtus:',
      visits: (n: number) => `${n} külastust`,
      once: 'Kinkekaart on ühekordne ning kogu summa tuleb kasutada ühe korraga.',
      validity: 'Kinkekaardi kehtivus on 1 aasta.',
      regards: 'Lugupidamisega',
      centre: 'Papagoi Keskus',
      tel: 'Tel +372 51 27 938',
    },
    en: {
      subject: (amountEur: number) => `Gift card enquiry – Papagoi Centre (${amountEur} €)`,
      title: 'Gift card enquiry',
      greeting: (name: string) => `Hello, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Hello, ${name}!`,
      thanks: 'Thank you for your gift card enquiry.',
      customerPhone: 'Customer phone:',
      questions:
        'If you have any questions, please contact us: +372 512 7938 or keskus@papagoi.ee.',
      transferLead: 'Please make a bank transfer:',
      recipient: 'Recipient:',
      recipientValue: 'Papagoi Keskus MTÜ',
      iban: 'IBAN:',
      ibanValue: PAPAGOI_IBAN,
      reference: 'Payment reference:',
      referenceValue: (code: string) => `Gift card ${code}`,
      afterTransfer:
        'Please let us know once the transfer has been made, and we will send the gift card to your email.',
      detailsTitle: 'Gift card details',
      value: 'Value:',
      visits: (n: number) => `${n} visits`,
      once: 'The gift card is single-use and the full amount must be used in one visit.',
      validity: 'The gift card is valid for 1 year.',
      regards: 'Kind regards',
      centre: 'Papagoi Centre',
      tel: 'Tel +372 51 27 938',
    },
    ru: {
      subject: (amountEur: number) =>
        `Запрос подарочной карты – центр Papagoi (${amountEur} €)`,
      title: 'Запрос подарочной карты',
      greeting: (name: string) => `Здравствуйте, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Здравствуйте, ${name}!`,
      thanks: 'Спасибо за ваш запрос подарочной карты.',
      customerPhone: 'Телефон клиента:',
      questions:
        'Если у вас есть вопросы, свяжитесь с нами: +372 512 7938 или keskus@papagoi.ee.',
      transferLead: 'Просим сделать перевод:',
      recipient: 'Получатель:',
      recipientValue: 'Papagoi Keskus MTÜ',
      iban: 'IBAN:',
      ibanValue: PAPAGOI_IBAN,
      reference: 'Назначение платежа:',
      referenceValue: (code: string) => `Подарочная карта ${code}`,
      afterTransfer:
        'Сообщите нам, когда перевод будет сделан — мы отправим подарочную карту на вашу почту.',
      detailsTitle: 'Данные подарочной карты',
      value: 'Сумма:',
      visits: (n: number) => `${n} посещений`,
      once: 'Подарочная карта одноразовая — вся сумма должна быть использована за один визит.',
      validity: 'Срок действия подарочной карты — 1 год.',
      regards: 'С уважением',
      centre: 'Центр Papagoi',
      tel: 'Тел. +372 51 27 938',
    },
  }
  return c[locale]
}

export function getGiftCardIssuedEmailCopy(locale: VisitMailLocale) {
  const c = {
    et: {
      subject: (amountEur: number) => `Papagoi Keskuse kinkekaart (${amountEur} €) – valmis`,
      title: 'Kinkekaart on valmis',
      greeting: (name: string) => `Tere, <strong>${name}</strong>!`,
      greetingFallback: 'Tere!',
      greetingText: (name: string) => `Tere, ${name}!`,
      greetingFallbackText: 'Tere!',
      value: 'Väärtus:',
      validUntil: 'Kehtiv kuni:',
      code: 'Kood:',
      attachmentsHtml:
        'Manused: <strong>PNG</strong> ja <strong>PDF</strong> formaadis kinkekaart. Saate QR-koodi skännida ja valida endale sobiva aja.',
      attachmentsText: 'Manused: PNG ja PDF',
      redeemLink: 'Lunastamise link:',
      questions: 'Kui tekib küsimusi, võtke ühendust: +372 512 7938 või keskus@papagoi.ee.',
      centre: 'Papagoi Keskus',
      address: 'Tartu mnt 80, Soinaste',
    },
    en: {
      subject: (amountEur: number) => `Papagoi Centre gift card (${amountEur} €) – ready`,
      title: 'Your gift card is ready',
      greeting: (name: string) => `Hello, <strong>${name}</strong>!`,
      greetingFallback: 'Hello!',
      greetingText: (name: string) => `Hello, ${name}!`,
      greetingFallbackText: 'Hello!',
      value: 'Value:',
      validUntil: 'Valid until:',
      code: 'Code:',
      attachmentsHtml:
        'Attachments: a gift card in <strong>PNG</strong> and <strong>PDF</strong> format. You can scan the QR code and choose a time that suits you.',
      attachmentsText: 'Attachments: PNG and PDF',
      redeemLink: 'Redemption link:',
      questions: 'If you have any questions, please contact us: +372 512 7938 or keskus@papagoi.ee.',
      centre: 'Papagoi Centre',
      address: 'Tartu mnt 80, Soinaste',
    },
    ru: {
      subject: (amountEur: number) => `Подарочная карта центра Papagoi (${amountEur} €) — готова`,
      title: 'Подарочная карта готова',
      greeting: (name: string) => `Здравствуйте, <strong>${name}</strong>!`,
      greetingFallback: 'Здравствуйте!',
      greetingText: (name: string) => `Здравствуйте, ${name}!`,
      greetingFallbackText: 'Здравствуйте!',
      value: 'Сумма:',
      validUntil: 'Действительна до:',
      code: 'Код:',
      attachmentsHtml:
        'Вложения: подарочная карта в форматах <strong>PNG</strong> и <strong>PDF</strong>. Вы можете отсканировать QR-код и выбрать удобное время.',
      attachmentsText: 'Вложения: PNG и PDF',
      redeemLink: 'Ссылка для погашения:',
      questions:
        'Если у вас есть вопросы, свяжитесь с нами: +372 512 7938 или keskus@papagoi.ee.',
      centre: 'Центр Papagoi',
      address: 'Tartu mnt 80, Soinaste',
    },
  }
  return c[locale]
}

export function donationAdminSubject(code: string, amountEur: number, purpose: DonationPurpose) {
  return `💛 Annetus laekus: ${code} — ${amountEur} € — ${DONATION_PURPOSE_NOTION[purpose]}`
}

export function getDonationEmailCopy(locale: VisitMailLocale) {
  const c = {
    et: {
      subject: (code: string) => `Aitäh toetuse eest — Annetus ${code}`,
      title: 'Aitäh annetuse eest',
      greeting: (name: string) => `Tere, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Tere, ${name}!`,
      thanks: 'Täname teid annetuse eest. Makse on laekunud.',
      purpose: 'Sihtotstarve:',
      purposes: {
        kingi: 'Kingi külastus',
        toit: 'Loomade toit',
        uldine: 'Üldine',
      },
      amount: 'Summa:',
      code: 'Annetuse nr:',
      impact: {
        kingi:
          'Teie annetus läheb külastuse kinkimiseks lapsele või grupile, kellel muidu see võimalus puuduks. Iga 10 € = üks külastus.',
        toit: 'Teie annetus läheb papagoide ja merisigade toiduks.',
        uldine: 'Teie annetus toetab keskuse igapäevast tööd ja lindude heaolu.',
      },
      questions: 'Kui teil on küsimusi, võtke ühendust: +372 512 7938 või keskus@papagoi.ee.',
      regards: 'Lugupidamisega',
      centre: 'Papagoi Keskus',
      tel: 'Tel +372 51 27 938',
    },
    en: {
      subject: (code: string) => `Thank you for your support — Donation ${code}`,
      title: 'Thank you for your donation',
      greeting: (name: string) => `Hello, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Hello, ${name}!`,
      thanks: 'Thank you for supporting Papagoi Centre. Your payment has been received.',
      purpose: 'Purpose:',
      purposes: {
        kingi: 'Gift a visit',
        toit: 'Animal food',
        uldine: 'General',
      },
      amount: 'Amount:',
      code: 'Donation no.:',
      impact: {
        kingi:
          'Your donation goes towards gifting a visit to a child or group who otherwise wouldn’t have the chance. Every €10 = one visit.',
        toit: 'Your donation goes towards food for the parrots and guinea pigs.',
        uldine: 'Your donation supports the centre’s daily work and the birds’ wellbeing.',
      },
      questions: 'If you have any questions, please contact us: +372 512 7938 or keskus@papagoi.ee.',
      regards: 'Kind regards',
      centre: 'Papagoi Centre',
      tel: 'Tel +372 51 27 938',
    },
    ru: {
      subject: (code: string) => `Спасибо за поддержку — пожертвование ${code}`,
      title: 'Спасибо за пожертвование',
      greeting: (name: string) => `Здравствуйте, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Здравствуйте, ${name}!`,
      thanks: 'Благодарим вас за поддержку центра Papagoi. Платёж получен.',
      purpose: 'Назначение:',
      purposes: {
        kingi: 'Подарить визит',
        toit: 'Корм для животных',
        uldine: 'Общее',
      },
      amount: 'Сумма:',
      code: 'Номер пожертвования:',
      impact: {
        kingi:
          'Ваше пожертвование пойдёт на подарочный визит для ребёнка или группы, у которых иначе не было бы такой возможности. Каждые 10 € = один визит.',
        toit: 'Ваше пожертвование пойдёт на корм для попугаев и морских свинок.',
        uldine: 'Ваше пожертвование поддерживает ежедневную работу центра и благополучие птиц.',
      },
      questions:
        'Если у вас есть вопросы, свяжитесь с нами: +372 512 7938 или keskus@papagoi.ee.',
      regards: 'С уважением',
      centre: 'Центр Papagoi',
      tel: 'Тел. +372 51 27 938',
    },
  }
  return c[locale]
}

export function getReviewInviteEmailCopy(locale: VisitMailLocale) {
  const c = {
    et: {
      subject: 'Aitäh külastuse eest! Jäta palun meile Google’i arvustus',
      greetingFallback: 'Papagoi sõber',
      greetingHtml: (name: string) => `Tere, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Tere, ${name}!`,
      introHtml:
        'Aitäh, et käisite täna <strong>Papagoi Keskuses</strong> külas. Loodame, et külastus pakkus teile rõõmu ja häid elamusi.',
      introText:
        'Aitäh, et käisite täna Papagoi Keskuses külas. Loodame, et külastus pakkus teile rõõmu ja häid elamusi.',
      askHtml:
        'Kui teil on hetk aega, oleksime väga tänulikud, kui jätaksite meile <strong>Google’is lühikese arvustuse</strong>. See aitab teistel külastajatel meid leida ja meil papagoide eest hoolitseda.',
      askText:
        'Kui teil on hetk aega, oleksime väga tänulikud, kui jätaksite meile Google’is lühikese arvustuse. See aitab teistel külastajatel meid leida ja meil papagoide eest hoolitseda.',
      button: 'Jäta arvustus siia',
      photosHtml:
        '<strong>Võite vabalt lisada ka pilte oma külastusest – see rõõmustab meid väga.</strong>',
      photosText: 'Võite vabalt lisada ka pilte oma külastusest – see rõõmustab meid väga.',
      boxTitle: 'Kui külastus teile meeldis, saate seda elamust edasi kinkida:',
      giftHtml:
        '<strong>Kinkekaardiga</strong> sõbrale, tuttavale või pereliikmele — kingisaaja valib ise sobiva aja.',
      giftText:
        'Kinkekaardiga sõbrale, tuttavale või pereliikmele — kingisaaja valib ise sobiva aja.',
      donateHtml:
        'Või <strong>annetusega</strong>, mis aitab külla tulla lapsel või grupil, kellel muidu see võimalus puuduks. Toetada saab ka lindude toitu. Annetada saab mugavalt pangalingiga.',
      donateText:
        'Või annetusega, mis aitab külla tulla lapsel või grupil, kellel muidu see võimalus puuduks. Toetada saab ka lindude toitu. Annetada saab mugavalt pangalingiga.',
      donateCompanyHtml:
        'Või <strong>kinkige külastus mõnele lasteaiarühmale või erivajadustega laste grupile</strong>, kellel muidu see võimalus puuduks.',
      donateCompanyText:
        'Või kinkige külastus mõnele lasteaiarühmale või erivajadustega laste grupile, kellel muidu see võimalus puuduks.',
      fundingParentHtml:
        '<strong>Tuleks teie lapse klassiga?</strong> 1.–9. klassi külastuse saab kool tasuda Kultuuriranitsast. Andke julgelt õpetajale teada – <a href="https://papagoi.ee/et/toetused" style="color: #ea580c; font-weight: 600; text-decoration: underline;">vaata lähemalt</a>.',
      fundingParentText:
        'Tuleks teie lapse klassiga? 1.–9. klassi külastuse saab kool tasuda Kultuuriranitsast. Andke julgelt õpetajale teada – vaata lähemalt.',
      fundingSchoolHtml:
        '<strong>Järgmisel korral:</strong> 1.–9. klassi külastuse saab tasuda Kultuuriranitsast, lasteaia või väiksema rühma külastust võib toetada ka kohalik omavalitsus. <a href="https://papagoi.ee/et/toetused" style="color: #ea580c; font-weight: 600; text-decoration: underline;">Kuidas see käib</a>',
      fundingSchoolText:
        'Järgmisel korral: 1.–9. klassi külastuse saab tasuda Kultuuriranitsast, lasteaia või väiksema rühma külastust võib toetada ka kohalik omavalitsus. Kuidas see käib',
      giftHref: 'https://papagoi.ee/et/kinkekaart',
      donateHref: 'https://papagoi.ee/et/toetused#anneta',
      fundingHref: 'https://papagoi.ee/et/toetused',
      feedback: 'Kui teil on tagasisidet või küsimusi, vastake julgelt sellele kirjale.',
      signOff: 'Papagoid tänavad Teid.',
      centre: 'Papagoi Keskus',
    },
    en: {
      subject: 'Thank you for visiting! Please leave us a Google review',
      greetingFallback: 'Parrot friend',
      greetingHtml: (name: string) => `Hello, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Hello, ${name}!`,
      introHtml:
        'Thank you for visiting the <strong>Papagoi Centre</strong> today. We hope the visit brought you joy and great experiences.',
      introText:
        'Thank you for visiting the Papagoi Centre today. We hope the visit brought you joy and great experiences.',
      askHtml:
        'If you have a moment, we would be very grateful if you left us a <strong>short Google review</strong>. It helps other visitors find us and helps us take care of the parrots.',
      askText:
        'If you have a moment, we would be very grateful if you left us a short Google review. It helps other visitors find us and helps us take care of the parrots.',
      button: 'Leave a review',
      photosHtml:
        '<strong>Feel free to add photos from your visit – it makes us very happy.</strong>',
      photosText: 'Feel free to add photos from your visit – it makes us very happy.',
      boxTitle: 'If you enjoyed your visit, you can pass the experience on:',
      giftHtml:
        'With a <strong>gift card</strong> for a friend, acquaintance or family member — they choose the time themselves.',
      giftText:
        'With a gift card for a friend, acquaintance or family member — they choose the time themselves.',
      donateHtml:
        'Or with a <strong>donation</strong> that helps a child or group visit who otherwise wouldn’t have the chance. You can also support the birds’ food. You can donate easily via bank link.',
      donateText:
        'Or with a donation that helps a child or group visit who otherwise wouldn’t have the chance. You can also support the birds’ food. You can donate easily via bank link.',
      donateCompanyHtml:
        'Or <strong>gift a visit to a kindergarten group or a group of children with special needs</strong> who otherwise wouldn’t have the chance.',
      donateCompanyText:
        'Or gift a visit to a kindergarten group or a group of children with special needs who otherwise wouldn’t have the chance.',
      fundingParentHtml:
        '<strong>Coming back with your child’s class?</strong> Schools can pay for visits of grades 1–9 from the Culture Backpack (Kultuuriranits). Feel free to let the teacher know – <a href="https://papagoi.ee/en/toetused" style="color: #ea580c; font-weight: 600; text-decoration: underline;">read more</a>.',
      fundingParentText:
        'Coming back with your child’s class? Schools can pay for visits of grades 1–9 from the Culture Backpack (Kultuuriranits). Feel free to let the teacher know – read more.',
      fundingSchoolHtml:
        '<strong>Next time:</strong> visits for grades 1–9 can be paid from the Culture Backpack, and the local municipality may also support a kindergarten or smaller group visit. <a href="https://papagoi.ee/en/toetused" style="color: #ea580c; font-weight: 600; text-decoration: underline;">How it works</a>',
      fundingSchoolText:
        'Next time: visits for grades 1–9 can be paid from the Culture Backpack, and the local municipality may also support a kindergarten or smaller group visit. How it works',
      giftHref: 'https://papagoi.ee/en/kinkekaart',
      donateHref: 'https://papagoi.ee/en/toetused#anneta',
      fundingHref: 'https://papagoi.ee/en/toetused',
      feedback: 'If you have feedback or questions, just reply to this email.',
      signOff: 'The parrots thank you.',
      centre: 'Papagoi Centre',
    },
    ru: {
      subject: 'Спасибо за визит! Пожалуйста, оставьте нам отзыв в Google',
      greetingFallback: 'Друг попугаев',
      greetingHtml: (name: string) => `Здравствуйте, <strong>${name}</strong>!`,
      greetingText: (name: string) => `Здравствуйте, ${name}!`,
      introHtml:
        'Спасибо, что вы сегодня побывали в <strong>Центре попугаев</strong>. Надеемся, визит подарил вам радость и яркие впечатления.',
      introText:
        'Спасибо, что вы сегодня побывали в Центре попугаев. Надеемся, визит подарил вам радость и яркие впечатления.',
      askHtml:
        'Если у вас найдётся минутка, мы будем очень благодарны за <strong>короткий отзыв в Google</strong>. Это помогает другим посетителям найти нас, а нам — заботиться о попугаях.',
      askText:
        'Если у вас найдётся минутка, мы будем очень благодарны за короткий отзыв в Google. Это помогает другим посетителям найти нас, а нам — заботиться о попугаях.',
      button: 'Оставить отзыв',
      photosHtml:
        '<strong>Можете добавить и фото с визита – нам будет очень приятно.</strong>',
      photosText: 'Можете добавить и фото с визита – нам будет очень приятно.',
      boxTitle: 'Если визит вам понравился, вы можете подарить это впечатление дальше:',
      giftHtml:
        '<strong>Подарочной картой</strong> другу, знакомому или члену семьи — получатель сам выберет удобное время.',
      giftText:
        'Подарочной картой другу, знакомому или члену семьи — получатель сам выберет удобное время.',
      donateHtml:
        'Или <strong>пожертвованием</strong>, которое поможет прийти к нам ребёнку или группе, у которых иначе не было бы такой возможности. Можно поддержать и корм для птиц. Пожертвовать можно удобно через банковскую ссылку.',
      donateText:
        'Или пожертвованием, которое поможет прийти к нам ребёнку или группе, у которых иначе не было бы такой возможности. Можно поддержать и корм для птиц. Пожертвовать можно удобно через банковскую ссылку.',
      donateCompanyHtml:
        'Или <strong>подарите визит группе детского сада или группе детей с особыми потребностями</strong>, у которых иначе не было бы такой возможности.',
      donateCompanyText:
        'Или подарите визит группе детского сада или группе детей с особыми потребностями, у которых иначе не было бы такой возможности.',
      fundingParentHtml:
        '<strong>Придёте с классом вашего ребёнка?</strong> Визит 1–9 классов школа может оплатить из «Культурного рюкзака» (Kultuuriranits). Смело расскажите об этом учителю – <a href="https://papagoi.ee/ru/toetused" style="color: #ea580c; font-weight: 600; text-decoration: underline;">подробнее</a>.',
      fundingParentText:
        'Придёте с классом вашего ребёнка? Визит 1–9 классов школа может оплатить из «Культурного рюкзака» (Kultuuriranits). Смело расскажите об этом учителю – подробнее.',
      fundingSchoolHtml:
        '<strong>В следующий раз:</strong> визит 1–9 классов можно оплатить из «Культурного рюкзака», а визит детского сада или небольшой группы может поддержать и местное самоуправление. <a href="https://papagoi.ee/ru/toetused" style="color: #ea580c; font-weight: 600; text-decoration: underline;">Как это работает</a>',
      fundingSchoolText:
        'В следующий раз: визит 1–9 классов можно оплатить из «Культурного рюкзака», а визит детского сада или небольшой группы может поддержать и местное самоуправление. Как это работает',
      giftHref: 'https://papagoi.ee/ru/kinkekaart',
      donateHref: 'https://papagoi.ee/ru/toetused#anneta',
      fundingHref: 'https://papagoi.ee/ru/toetused',
      feedback: 'Если у вас есть отзывы или вопросы, просто ответьте на это письмо.',
      signOff: 'Попугаи благодарят вас.',
      centre: 'Papagoi Keskus',
    },
  }
  return c[locale]
}
