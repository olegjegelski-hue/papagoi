import type { VisitMailLocale } from '@/lib/visit-language'

export type { VisitMailLocale }

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
  }
  return map[groupType]?.[locale] ?? map.muu[locale]
}

export function visitLanguageLabelForEmail(locale: VisitMailLocale, code: VisitMailLocale): string {
  const labels: Record<VisitMailLocale, Record<VisitMailLocale, string>> = {
    et: { et: 'eesti keel', en: 'inglise keel', ru: 'vene keel' },
    en: { et: 'Estonian', en: 'English', ru: 'Russian' },
    ru: { et: 'эстонский', en: 'английский', ru: 'русский' },
  }
  return labels[locale][code]
}

export function calendarStrings(locale: VisitMailLocale) {
  const t = {
    et: {
      title: 'Broneering Papagoi Keskuses',
      description:
        'Külastus Papagoi Keskuses. Külastuse kestus: 45–60 min. Palume olla kohal 5–10 min varem.',
    },
    en: {
      title: 'Booking — Papagoi Centre',
      description:
        'Visit at Papagoi Centre. Duration: about 45–60 min. Please arrive 5–10 minutes early.',
    },
    ru: {
      title: 'Бронирование — центр попугаев Papagoi',
      description:
        'Визит в центр попугаев Papagoi. Длительность: около 45–60 мин. Просим приехать за 5–10 минут до начала.',
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
    const base = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papagoi.ee').replace(/\/$/, '')
    return `${base}${path}`
  }
  const rulesHref = visitorsUrl(
    locale === 'en' ? '/en/kulastajatele#reeglid-ja-juhised' : locale === 'ru' ? '/ru/kulastajatele#reeglid-ja-juhised' : '/kulastajatele#reeglid-ja-juhised'
  )
  const rulesLabelShort = {
    et: 'www.papagoi.ee/kulastajatele',
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
