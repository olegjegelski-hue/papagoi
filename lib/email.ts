
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type { VisitMailLocale } from '@/lib/visit-language'
import {
  bookingGroupTypeLabel,
  calendarStrings,
  formatVisitDateLongFromDate,
  formatVisitDateLong,
  formatVisitDateForSubject,
  getBookingEmailCopy,
  getConfirmationEmailCopy,
  visitLanguageLabelForEmail,
} from '@/lib/email-i18n'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papagoi.ee'
const CALENDAR_LOCATION = 'Tartu mnt 80, Soinaste, Kambja vald'

function buildCalendarUrls(startIso: string, endIso: string, locale: VisitMailLocale = 'et') {
  const cal = calendarStrings(locale)
  const start = new Date(startIso)
  const end = new Date(endIso)
  const toGoogleFormat = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const startStr = toGoogleFormat(start)
  const endStr = toGoogleFormat(end)

  const googleUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(cal.title)}` +
    `&dates=${startStr}/${endStr}` +
    `&location=${encodeURIComponent(CALENDAR_LOCATION)}` +
    `&details=${encodeURIComponent(cal.description)}`

  const outlookUrl =
    'https://outlook.live.com/calendar/0/action/compose' +
    `?subject=${encodeURIComponent(cal.title)}` +
    `&startdt=${encodeURIComponent(startIso)}` +
    `&enddt=${encodeURIComponent(endIso)}` +
    `&location=${encodeURIComponent(CALENDAR_LOCATION)}` +
    `&body=${encodeURIComponent(cal.description)}`

  const icsUrl =
    `${SITE_URL.replace(/\/$/, '')}/api/calendar/event` +
    `?start=${encodeURIComponent(startIso)}` +
    `&end=${encodeURIComponent(endIso)}` +
    `&title=${encodeURIComponent(cal.title)}` +
    `&location=${encodeURIComponent(CALENDAR_LOCATION)}` +
    `&description=${encodeURIComponent(cal.description)}`

  return { googleUrl, outlookUrl, icsUrl }
}

// Create reusable transporter with error handling – identne PetsVillaga
export const createTransporter = (): Transporter => {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS

  if (!host || !user || !password) {
    throw new Error(
      'SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD (or SMTP_PASS) environment variables.'
    )
  }

  try {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465 (SSL), false for other ports (TLS)
      auth: {
        user,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
        minVersion: 'TLSv1.2', // Minimum TLS version
      },
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    })
  } catch (error) {
    console.error('Failed to create email transporter:', error)
    throw new Error(`SMTP configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Send contact form email – keskusele ja kliendile (klient saab koopia oma kirjast)
export async function sendContactFormEmail(data: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  formType?: string
}) {
  try {
    const transporter = createTransporter()

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
        Uus kontaktvormi päring
      </h2>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>Nimi:</strong> ${data.name}</p>
        <p style="margin: 10px 0;"><strong>E-post:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        ${data.phone ? `<p style="margin: 10px 0;"><strong>Telefon:</strong> ${data.phone}</p>` : ''}
        ${data.subject ? `<p style="margin: 10px 0;"><strong>Teema:</strong> ${data.subject}</p>` : ''}
        ${data.formType ? `<p style="margin: 10px 0;"><strong>Vormi tüüp:</strong> ${data.formType}</p>` : ''}
      </div>
      
      <div style="background-color: #fff; padding: 20px; border-left: 4px solid #43A047; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Sõnum:</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
      </div>
      
      <div style="color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p>Saadetud: ${new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })}</p>
        <p>Papagoi Keskus - papagoi.ee</p>
      </div>
    </div>
  `

    const mailOptions = {
      from: `"Papagoi Keskus Koduleht" <${process.env.SMTP_USER}>`,
      to: `${data.email}, keskus@papagoi.ee`,
      replyTo: data.email,
      subject: `Kontaktvorm: ${data.subject || 'Uus päring'} - ${data.name}`,
      html: htmlContent,
      text: `
Uus kontaktvormi päring

Nimi: ${data.name}
E-post: ${data.email}
${data.phone ? `Telefon: ${data.phone}` : ''}
${data.subject ? `Teema: ${data.subject}` : ''}
${data.formType ? `Vormi tüüp: ${data.formType}` : ''}

Sõnum:
${data.message}

Saadetud: ${new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })}
      `.trim(),
    }

    await transporter.sendMail(mailOptions)
    console.log(`Contact form email sent to ${data.email} and keskus@papagoi.ee`)
  } catch (error) {
    console.error('Failed to send contact form email:', error)
    throw new Error(
      `Email saatmine ebaõnnestus: ${error instanceof Error ? error.message : 'Tundmatu viga'}. ` +
      'Palun kontrollige SMTP seadeid või proovige hiljem uuesti.'
    )
  }
}

// Broneeringu email – saadab nii kliendile kui keskusele (nagu PetsVilla heinatellimus)
export async function sendBookingEmail(data: {
  name: string
  email: string
  phone: string
  groupSize: number
  date?: Date
  timeSlot?: string
  groupType?: string
  message?: string
  totalPrice: number
  bookingId: string
  visitLanguage?: VisitMailLocale
}) {
  try {
    const transporter = createTransporter()
    const locale = data.visitLanguage ?? 'et'
    const copy = getBookingEmailCopy(locale)
    const tsLocale = locale === 'en' ? 'en-GB' : locale === 'ru' ? 'ru-RU' : 'et-EE'

    const formattedDate = data.date ? formatVisitDateLongFromDate(data.date, locale) : ''

    const groupTypeLabel = bookingGroupTypeLabel(locale, data.groupType)

    const visitLangCode = data.visitLanguage ?? 'et'
    const visitLangHuman = visitLanguageLabelForEmail(locale, visitLangCode)

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
        ${copy.title}
      </h2>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; font-weight: 600;">
        ${copy.nbHtml}
      </div>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #43A047;">
        <h3 style="color: #059669; margin-top: 0;">${copy.clientTitle}</h3>
        <p style="margin: 10px 0;"><strong>${copy.name}</strong> ${data.name}</p>
        <p style="margin: 10px 0;"><strong>${copy.email}</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p style="margin: 10px 0;"><strong>${copy.phone}</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
        <p style="margin: 10px 0;"><strong>${copy.visitLang}</strong> ${visitLangHuman}</p>
      </div>
      
      <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
        <h3 style="color: #d97706; margin-top: 0;">${copy.detailsTitle}</h3>
        <p style="margin: 10px 0;"><strong>${copy.id}</strong> ${data.bookingId}</p>
        ${data.date ? `<p style="margin: 10px 0;"><strong>${copy.date}</strong> ${formattedDate}</p>` : ''}
        ${data.timeSlot ? `<p style="margin: 10px 0;"><strong>${copy.time}</strong> ${data.timeSlot}${copy.timeSlotSuffix}</p>` : ''}
        <p style="margin: 10px 0;"><strong>${copy.duration}</strong> ${copy.durationVal}</p>
        <p style="margin: 10px 0;"><strong>${copy.groupSize}</strong> ${data.groupSize}${copy.groupSizeNote}</p>
        ${data.groupType && groupTypeLabel ? `<p style="margin: 10px 0;"><strong>${copy.groupType}</strong> ${groupTypeLabel}</p>` : ''}
        <p style="margin: 10px 0; font-size: 18px;"><strong>${copy.price}</strong> <span style="color: #d97706;">${data.totalPrice.toFixed(2)}€</span></p>
        <p style="margin: 10px 0;"><strong>${copy.payment}</strong> ${copy.paymentVal}</p>
      </div>
      
      ${data.message ? `
      <div style="background-color: #fff; padding: 20px; border-left: 4px solid #43A047; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">${copy.extraTitle}</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
      </div>
      ` : ''}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;">${copy.regards}</p>
        <p style="margin: 5px 0; font-weight: 600;">${copy.centre}</p>
        <p style="margin: 5px 0;">${copy.tel}</p>
        <p style="margin: 15px 0 5px 0;"><a href="https://www.papagoi.ee">www.papagoi.ee</a></p>
        <p style="margin: 5px 0;">${locale === 'ru' ? 'Эл. почта:' : locale === 'en' ? 'Email:' : 'E-post:'} <a href="mailto:keskus@papagoi.ee">keskus@papagoi.ee</a></p>
        <p style="margin: 5px 0;"><a href="https://www.facebook.com/PapagoiKeskus">https://www.facebook.com/PapagoiKeskus</a></p>
      </div>
      
      <div style="color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <p>${copy.sent} ${new Date().toLocaleString(tsLocale, { timeZone: 'Europe/Tallinn' })}</p>
      </div>
    </div>
  `

    const mailOptions = {
      from: `"Papagoi Keskus Broneering" <${process.env.SMTP_USER}>`,
      to: `${data.email}, keskus@papagoi.ee`,
      replyTo: data.email,
      subject: `${copy.subjectPrefix} ${data.name}${formattedDate ? ` - ${formattedDate}` : ''}${data.timeSlot ? ` ${data.timeSlot}` : ''}`,
      html: htmlContent,
      text: `
${copy.textHeader}
__________________________________

${copy.textNb}

${copy.textClient}
- ${copy.name} ${data.name}
- ${copy.email} ${data.email}
- ${copy.phone} ${data.phone}
- ${copy.visitLang} ${visitLangHuman}

${copy.textDetails}
- ${copy.id} ${data.bookingId}
${data.date ? `- ${copy.date} ${formattedDate}\n` : ''}${data.timeSlot ? `- ${copy.time} ${data.timeSlot}${copy.timeSlotSuffix}\n` : ''}- ${copy.duration} ${copy.durationVal}
- ${copy.groupSize} ${data.groupSize}${copy.groupSizeNote}
${data.groupType && groupTypeLabel ? `- ${copy.groupType} ${groupTypeLabel}\n` : ''}- ${copy.price} ${data.totalPrice.toFixed(2)}€
- ${copy.payment} ${copy.paymentVal}

${data.message ? `${copy.extraTitle}\n${data.message}\n\n` : ''}

${copy.regards}
${copy.centre}
${copy.tel}

www.papagoi.ee
keskus@papagoi.ee
https://www.facebook.com/PapagoiKeskus

---
${copy.sent} ${new Date().toLocaleString(tsLocale, { timeZone: 'Europe/Tallinn' })}
      `.trim(),
    }

    await transporter.sendMail(mailOptions)
    console.log(`Booking email sent successfully to ${data.email} and keskus@papagoi.ee`)
  } catch (error) {
    console.error('Failed to send booking email:', error)
    throw new Error(
      `Email saatmine ebaõnnestus: ${error instanceof Error ? error.message : 'Tundmatu viga'}. ` +
      'Palun kontrollige SMTP seadeid või proovige hiljem uuesti.'
    )
  }
}

// Kinnituskiri – saadetakse kliendile pärast broneeringu kinnitamist Notionis
export async function sendConfirmationEmail(data: {
  name: string
  email: string
  date: string
  timeSlot?: string
  groupSize?: number
  price?: number
  dateForSubject?: string
  calendarStartIso?: string
  calendarEndIso?: string
  cc?: string
  adminOnly?: boolean
  /** Külastuse keel Notionist / broneeringust – määrab meili keele */
  locale?: VisitMailLocale
}) {
  try {
    const transporter = createTransporter()
    const locale = data.locale ?? 'et'
    const cr = getConfirmationEmailCopy(locale)
    const tsLocale = locale === 'en' ? 'en-GB' : locale === 'ru' ? 'ru-RU' : 'et-EE'

    const guestName =
      data.name?.trim() ||
      (locale === 'en' ? 'Guest' : locale === 'ru' ? 'Гость' : 'Külastaja')

    const groupSizeLine =
      data.groupSize != null
        ? `<p style="margin: 10px 0;"><strong>${cr.groupSize}</strong> ${data.groupSize}${cr.groupSizeNote}</p>`
        : ''
    const priceLine =
      data.price != null
        ? `<p style="margin: 10px 0;"><strong>${cr.price}</strong> ${data.price.toFixed(2)} €</p>`
        : ''
    const timeSlotLine = data.timeSlot
      ? `<p style="margin: 10px 0;"><strong>${cr.time}</strong> ${data.timeSlot}${cr.timeSlotSuffix}</p>`
      : ''

    const calendarUrls =
      data.calendarStartIso && data.calendarEndIso
        ? buildCalendarUrls(data.calendarStartIso, data.calendarEndIso, locale)
        : null
    const calendarSection = calendarUrls
      ? `
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; font-weight: 600;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">${cr.calendarTitle}</p>
        <p style="margin: 0; font-size: 14px; font-weight: 500;">
          <a href="${calendarUrls.googleUrl}" style="color: #d97706; text-decoration: underline;">${cr.google}</a> &nbsp;|&nbsp;
          <a href="${calendarUrls.outlookUrl}" style="color: #d97706; text-decoration: underline;">${cr.outlook}</a> &nbsp;|&nbsp;
          <a href="${calendarUrls.icsUrl}" style="color: #d97706; text-decoration: underline;">${cr.ics}</a> ${cr.icsNote}
        </p>
      </div>`
      : ''

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
        ${cr.title}
      </h2>
      
      <p style="font-size: 16px; line-height: 1.6;">${cr.greeting}, ${guestName}!</p>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #43A047;">
        <h3 style="color: #059669; margin-top: 0;">${cr.bookingBlockTitle}</h3>
        <p style="margin: 10px 0;"><strong>${cr.location}</strong> ${cr.locationLine} <a href="https://www.google.com/maps/search/?api=1&query=Tartu+mnt+80,+Soinaste,+Kambja+vald">Google Maps</a></p>
        <p style="margin: 10px 0;"><strong>${cr.date}</strong> ${data.date}</p>
        ${timeSlotLine}
        <p style="margin: 10px 0;"><strong>${cr.duration}</strong> ${cr.durationVal}</p>
        ${groupSizeLine}
        ${priceLine}
        <p style="margin: 10px 0;"><strong>${cr.payment}</strong> ${cr.paymentVal}</p>
      </div>
      ${calendarSection}
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #43A047;">
        <p style="margin: 0; font-weight: 600; color: #059669;">${cr.changeHint}<a href="tel:+3725127938" style="color: #059669;">+372 512 7938</a>.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">${cr.infoTitle}</h3>
        <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
          <li>${cr.infoTreat}</li>
          <li>${cr.infoNoise}</li>
          <li>${cr.infoGuide}</li>
          <li><strong style="color: #059669;">${cr.infoSocksBold}</strong>${cr.infoSocksRest}</li>
        </ul>
        <p style="margin: 15px 0 0 0;"><strong>${cr.rulesLead}</strong> ${cr.rulesRest} <a href="${cr.rulesHref}" style="color: #059669; text-decoration: underline;">${cr.rulesLabelShort}</a></p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;">${cr.regards}</p>
        <p style="margin: 5px 0; font-weight: 600;">${cr.centre}</p>
        <p style="margin: 5px 0;">${cr.tel}</p>
        <p style="margin: 15px 0 5px 0;"><a href="https://www.papagoi.ee">https://www.papagoi.ee/</a></p>
        <p style="margin: 5px 0;">keskus@papagoi.ee</p>
        <p style="margin: 5px 0;"><a href="https://www.facebook.com/PapagoiKeskus">https://www.facebook.com/PapagoiKeskus</a></p>
      </div>
      
      <div style="color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <p>${cr.sent} ${new Date().toLocaleString(tsLocale, { timeZone: 'Europe/Tallinn' })}</p>
      </div>
    </div>
  `

    const baseDate = data.dateForSubject || data.date
    const subjectDate =
      data.timeSlot && !baseDate.match(/\d{1,2}:\d{2}/)
        ? locale === 'en'
          ? `${baseDate} at ${data.timeSlot}`
          : locale === 'ru'
            ? `${baseDate} в ${data.timeSlot}`
            : `${baseDate} kell ${data.timeSlot}`
        : baseDate

    const mailOptions: Record<string, unknown> = {
      from: `"Papagoi Keskus" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: data.adminOnly
        ? `${cr.subjectAdmin} ${data.name}`
        : `${cr.subjectNormal} (${subjectDate})`,
      html: htmlContent,
    }
    if (data.cc && !data.adminOnly) {
      mailOptions.cc = data.cc
    }

    const timeSlotText = data.timeSlot
      ? `* ${cr.time} ${data.timeSlot}${cr.timeSlotSuffix}\n`
      : ''
    const groupSizeText =
      data.groupSize != null
        ? `* ${cr.groupSize} ${data.groupSize}${cr.groupSizeNote}\n`
        : ''
    const priceText = data.price != null ? `* ${cr.price} ${data.price.toFixed(2)} €\n` : ''
    const calendarText =
      data.calendarStartIso && data.calendarEndIso
        ? (() => {
            const urls = buildCalendarUrls(data.calendarStartIso, data.calendarEndIso, locale)
            return `\n${cr.calendarTextIntro}\n* Google Calendar: ${urls.googleUrl}\n* Outlook: ${urls.outlookUrl}\n* ${cr.ics}: ${urls.icsUrl}\n`
          })()
        : ''

    const textContent = [
      cr.textTitle,
      '',
      `${cr.greeting}, ${guestName}!`,
      '',
      cr.textBooking,
      `* ${cr.textLocation} ${cr.locationLine}`,
      `  ${cr.textMaps} https://www.google.com/maps/search/?api=1&query=Tartu+mnt+80,+Soinaste,+Kambja+vald`,
      `* ${cr.date} ${data.date}`,
      timeSlotText.trimEnd(),
      `* ${cr.duration} ${cr.durationVal}`,
      groupSizeText.trimEnd(),
      priceText.trimEnd(),
      `* ${cr.payment} ${cr.paymentVal}`,
      calendarText.trimEnd(),
      '',
      cr.textChangeBlock,
      '',
      cr.textInfo,
      `* ${cr.infoTreat}`,
      `* ${cr.infoNoise}`,
      `* ${cr.infoGuide}`,
      `* ${cr.infoSocksBold}${cr.infoSocksRest}`,
      '',
      `${cr.textRules} ${cr.rulesHref}`,
      '',
      `${cr.regards}\n${cr.centre}\n${cr.tel}\nhttps://www.papagoi.ee/\nkeskus@papagoi.ee\nhttps://www.facebook.com/PapagoiKeskus`,
      '',
      `---\n${cr.sent} ${new Date().toLocaleString(tsLocale, { timeZone: 'Europe/Tallinn' })}`,
    ]
      .filter((line) => line !== '')
      .join('\n')

    mailOptions.text = textContent

    await transporter.sendMail(mailOptions as Parameters<typeof transporter.sendMail>[0])
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    throw new Error(
      `Kinnituskirja saatmine ebaõnnestus: ${error instanceof Error ? error.message : 'Tundmatu viga'}`
    )
  }
}

// Kinkekaardi päringu kinnitus – tellijale ja koopia Papagoi Keskusele
export async function sendGiftCardOrderEmail(data: {
  to: string
  buyerName: string
  amountEur: number
  code: string
}) {
  const transporter = createTransporter()
  const fromAddress = process.env.SMTP_USER || 'keskus@papagoi.ee'
  const centerEmail = process.env.CENTER_EMAIL || 'keskus@papagoi.ee'
  const subject = `Kinkekaardi päring – Papagoi Keskus (${data.amountEur} €)`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
        Kinkekaardi päring
      </h2>
      <p style="font-size: 16px; line-height: 1.6;">Tere, <strong>${data.buyerName}</strong>!</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Täname teid kinkekaardi päringu eest. Oleme päringu kätte saanud ja võtame peagi ühendust maksmise ja kinkekaardi vormistamise osas.
      </p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #43A047;">
        <h3 style="color: #059669; margin-top: 0;">Kinkekaardi andmed</h3>
        <p style="margin: 10px 0;"><strong>Väärtus:</strong> ${data.amountEur} € (${data.amountEur / 10} külastust)</p>
        <p style="margin: 10px 0;">Kinkekaart on ühekordne ning kogu summa tuleb kasutada ühe korraga.</p>
        <p style="margin: 10px 0;">Kinkekaardi kehtivus on 1 aasta.</p>
      </div>
      <p style="font-size: 14px; color: #4b5563;">
        Kui teil on küsimusi, võtke ühendust: <a href="tel:+3725127938">+372 512 7938</a> või <a href="mailto:keskus@papagoi.ee">keskus@papagoi.ee</a>.
      </p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;">Lugupidamisega</p>
        <p style="margin: 5px 0; font-weight: 600;">Papagoi Keskus</p>
        <p style="margin: 5px 0;">Tel +372 51 27 938</p>
        <p style="margin: 5px 0;"><a href="https://www.papagoi.ee/">https://www.papagoi.ee/</a></p>
      </div>
    </div>
  `

  const text = `
Tere, ${data.buyerName}!

Täname teid kinkekaardi päringu eest. Oleme päringu kätte saanud ja võtame peagi ühendust maksmise ja kinkekaardi vormistamise osas.

Kinkekaardi andmed:
- Väärtus: ${data.amountEur} € (${data.amountEur / 10} külastust)
- Kinkekaart on ühekordne ning kogu summa tuleb kasutada ühe korraga.
- Kinkekaardi kehtivus on 1 aasta.

Kui teil on küsimusi, võtke ühendust: +372 512 7938 või keskus@papagoi.ee.

Lugupidamisega
Papagoi Keskus
Tel +372 51 27 938
https://www.papagoi.ee/
  `.trim()

  await transporter.sendMail({
    from: `"Papagoi Keskus" <${fromAddress}>`,
    to: data.to,
    cc: centerEmail,
    subject,
    html,
    text,
  })
}

export async function sendGiftCardIssuedEmail(data: {
  to: string
  buyerName: string | null
  amountEur: number
  code: string
  validUntil: string
  pngBuffer: Buffer
  pdfBuffer: Buffer
  qrUrl: string
}) {
  const transporter = createTransporter()
  const fromAddress = process.env.SMTP_USER || 'keskus@papagoi.ee'
  const centerEmail = process.env.CENTER_EMAIL || 'keskus@papagoi.ee'

  const buyerNameLine = data.buyerName ? `Tere, <strong>${data.buyerName}</strong>!` : 'Tere!'
  const subject = `Papagoi Keskuse kinkekaart (${data.amountEur} €) – valmis`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <h2 style="color: #059669; border-bottom: 3px solid #43A047; padding-bottom: 10px; margin-top: 0;">
        Kinkekaart on valmis
      </h2>
      <p style="font-size: 16px; line-height: 1.6;">${buyerNameLine}</p>

      <div style="background-color: #f0fdf4; padding: 18px 20px; border-radius: 10px; margin: 18px 0; border: 2px solid #43A047;">
        <p style="margin: 8px 0;"><strong>Väärtus:</strong> ${data.amountEur} €</p>
        <p style="margin: 8px 0;"><strong>Kehtiv kuni:</strong> ${data.validUntil}</p>
        <p style="margin: 8px 0;"><strong>Kood:</strong> ${data.code}</p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; margin: 14px 0;">
        Manused: <strong>PNG</strong> ja <strong>PDF</strong> formaadis kinkekaart. Saate QR-koodi skännida ja valida endale sobiva aja.
      </p>

      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        Lunastamise link: <a href="${data.qrUrl}">${data.qrUrl}</a>
      </p>

      <p style="font-size: 14px; color: #4b5563; margin-top: 18px;">
        Kui tekib küsimusi, võtke ühendust: <a href="tel:+3725127938">+372 512 7938</a> või <a href="mailto:keskus@papagoi.ee">keskus@papagoi.ee</a>.
      </p>

      <div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;"><strong>Papagoi Keskus</strong></p>
        <p style="margin: 5px 0;">Tartu mnt 80, Soinaste</p>
      </div>
    </div>
  `

  const text = `
${data.buyerName ? `Tere, ${data.buyerName}!` : 'Tere!'}

Kinkekaart on valmis.
Väärtus: ${data.amountEur} €
Kehtiv kuni: ${data.validUntil}
Kood: ${data.code}

Lunastamise link: ${data.qrUrl}
Manused: PNG ja PDF

Kui tekib küsimusi, võtke ühendust: +372 512 7938 või keskus@papagoi.ee
`.trim()

  await transporter.sendMail({
    from: `"Papagoi Keskus" <${fromAddress}>`,
    to: data.to,
    cc: centerEmail,
    subject,
    html,
    text,
    attachments: [
      { filename: `kinkekaart-${data.code}.png`, content: data.pngBuffer, contentType: 'image/png' },
      { filename: `kinkekaart-${data.code}.pdf`, content: data.pdfBuffer, contentType: 'application/pdf' },
    ],
  })
}
