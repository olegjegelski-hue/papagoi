
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

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
}) {
  try {
    const transporter = createTransporter()

    const formattedDate = data.date
      ? new Date(data.date).toLocaleDateString('et-EE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : ''

    const groupTypeLabel =
      data.groupType === 'perevisit' ? 'Perevisit' :
      data.groupType === 'kool' ? 'Kool/Lasteaed' :
      data.groupType === 'ettevote' ? 'Ettevõte' : 'Muu'

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 3px solid #43A047; padding-bottom: 10px;">
        Broneeringu päring
      </h2>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; font-weight: 600;">
        NB! Tegemist on broneeringu päringuga.<br>
        Broneering jõustub pärast meie kinnituskirja.<br>
        <br>
        Kinnitame päringu esimesel võimalusel (tavaliselt 24 h jooksul). <em>(Kui kinnitust ei tule 24 h jooksul, palume vastata sellele kirjale või helistada.)</em>
      </div>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #43A047;">
        <h3 style="color: #059669; margin-top: 0;">Kliendi andmed:</h3>
        <p style="margin: 10px 0;"><strong>Nimi:</strong> ${data.name}</p>
        <p style="margin: 10px 0;"><strong>E-post:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p style="margin: 10px 0;"><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
      </div>
      
      <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
        <h3 style="color: #d97706; margin-top: 0;">Broneeringu üksikasjad:</h3>
        <p style="margin: 10px 0;"><strong>ID:</strong> ${data.bookingId}</p>
        ${data.date ? `<p style="margin: 10px 0;"><strong>Kuupäev:</strong> ${formattedDate}</p>` : ''}
        ${data.timeSlot ? `<p style="margin: 10px 0;"><strong>Kellaaeg:</strong> ${data.timeSlot} Alustame täistunnil. Palume olla kohal 5–10 min varem, kutsume teid ise sisse.</p>` : ''}
        <p style="margin: 10px 0;"><strong>Külastuse kestus:</strong> 45-60 min</p>
        <p style="margin: 10px 0;"><strong>Grupi suurus:</strong> ${data.groupSize} inimest (paneme gruppe kokku, võivad veel liituda teised külastajad)</p>
        ${data.groupType ? `<p style="margin: 10px 0;"><strong>Grupi tüüp:</strong> ${groupTypeLabel}</p>` : ''}
        <p style="margin: 10px 0; font-size: 18px;"><strong>Hind:</strong> <span style="color: #d97706;">${data.totalPrice.toFixed(2)}€</span></p>
        <p style="margin: 10px 0;"><strong>Maksmine:</strong> pärast külastust kohapeal, ainult sularaha (pangaterminal puudub)</p>
      </div>
      
      ${data.message ? `
      <div style="background-color: #fff; padding: 20px; border-left: 4px solid #43A047; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Lisainfo:</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
      </div>
      ` : ''}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0;">Lugupidamisega</p>
        <p style="margin: 5px 0; font-weight: 600;">Papagoi Keskus</p>
        <p style="margin: 5px 0;">Tel +372 51 27 938</p>
        <p style="margin: 15px 0 5px 0;"><a href="https://www.papagoi.ee">www.papagoi.ee</a></p>
        <p style="margin: 5px 0;">E-post: <a href="mailto:keskus@papagoi.ee">keskus@papagoi.ee</a></p>
        <p style="margin: 5px 0;"><a href="https://www.facebook.com/PapagoiKeskus">https://www.facebook.com/PapagoiKeskus</a></p>
      </div>
      
      <div style="color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <p>Saadetud: ${new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })}</p>
      </div>
    </div>
  `

    const mailOptions = {
      from: `"Papagoi Keskus Broneering" <${process.env.SMTP_USER}>`,
      to: `${data.email}, keskus@papagoi.ee`,
      replyTo: data.email,
      subject: `Broneeringu päring: ${data.name}${data.date ? ` - ${formattedDate}` : ''}${data.timeSlot ? ` ${data.timeSlot}` : ''}`,
      html: htmlContent,
      text: `
BRONEERINGU PÄRING
__________________________________

NB! Tegemist on broneeringu päringuga.
Broneering jõustub pärast meie kinnituskirja.

Kinnitame päringu esimesel võimalusel (tavaliselt 24 h jooksul). (Kui kinnitust ei tule 24 h jooksul, palume vastata sellele kirjale või helistada.)

Kliendi andmed:
- Nimi: ${data.name}
- E-post: ${data.email}
- Telefon: ${data.phone}

Broneeringu üksikasjad:
- ID: ${data.bookingId}
${data.date ? `- Kuupäev: ${formattedDate}\n` : ''}${data.timeSlot ? `- Kellaaeg: ${data.timeSlot} Alustame täistunnil. Palume olla kohal 5–10 min varem, kutsume teid ise sisse.\n` : ''}- Külastuse kestus: 45-60 min
- Grupi suurus: ${data.groupSize} inimest (paneme gruppe kokku, võivad veel liituda teised külastajad)
${data.groupType ? `- Grupi tüüp: ${groupTypeLabel}\n` : ''}- Hind: ${data.totalPrice.toFixed(2)}€
- Maksmine: pärast külastust kohapeal, ainult sularaha (pangaterminal puudub)

${data.message ? `Lisainfo:\n${data.message}\n\n` : ''}

Lugupidamisega
Papagoi Keskus
Tel +372 51 27 938

www.papagoi.ee
E-post: keskus@papagoi.ee
https://www.facebook.com/PapagoiKeskus

---
Saadetud: ${new Date().toLocaleString('et-EE', { timeZone: 'Europe/Tallinn' })}
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
