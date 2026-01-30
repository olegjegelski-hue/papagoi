import nodemailer from 'nodemailer';
import { escapeHtml } from '@/lib/sanitize';

// Keskuse emaili aadress
const CENTER_EMAIL = process.env.CENTER_EMAIL || 'keskus@papagoi.ee';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@papagoi.ee';

// Loo emaili transporter
// Toetab mitmeid võimalusi: Gmail, Outlook, oma SMTP server, jne
function createTransporter() {
  // Kui on määratud SMTP seaded, kasuta neid
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Gmail'i kasutamine (kui on määratud Gmail kasutajanimi ja parool)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (mitte tavaline parool!)
      },
    });
  }

  // Outlook/Hotmail kasutamine
  if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD) {
    return nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASSWORD,
      },
    });
  }

  // Kui midagi pole määratud, loo test transporter (ei saada päris emaili)
  // See on kasulik arendamiseks
  console.warn('⚠️ Emaili seaded puuduvad! Emailid ei saadeta. Loo .env fail SMTP seadetega.');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@example.com',
      pass: 'test',
    },
  });
}

const transporter = createTransporter();

// HTML emaili mall
function getEmailTemplate(title: string, content: string, isClientEmail: boolean = true) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #43A047 0%, #039BE5 50%, #FF9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #43A047; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .highlight { background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isClientEmail ? 'Papagoi Keskus' : 'Uus sõnum'}</h1>
          <p>${isClientEmail ? 'Elu täis värve ja hääli' : 'Kontaktvorm'}</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Papagoi Keskus | Tartu mnt 80, Soinaste, Kambja vald, Tartumaa 61709</p>
          <p>Tel: +372 51 27 938 | Email: keskus@papagoi.ee</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Kontaktvormi emaili saatmine
export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  formType?: string;
}) {
  try {
    const safeName = escapeHtml(data.name);
    const safeSubject = escapeHtml(data.subject);
    const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br>');
    const safeEmail = escapeHtml(data.email);
    const safePhone = data.phone ? escapeHtml(data.phone) : '';
    const safeFormType = data.formType ? escapeHtml(data.formType) : '';

    // Kliendi kinnitusemail
    const clientContent = `
      <h2>Tere, ${safeName}!</h2>
      <p>Täname, et võtsite meiega ühendust. Teie sõnum on edukalt saadetud ja me vastame teile esimesel võimalusel.</p>
      
      <div class="info-box">
        <h3>Teie sõnumi ülevaade:</h3>
        <p><strong>Teema:</strong> ${safeSubject}</p>
        <p><strong>Sõnum:</strong></p>
        <p>${safeMessage}</p>
      </div>
      
      <p>Vastame teile tavaliselt 24 tunni jooksul aadressil <strong>${safeEmail}</strong>${data.phone ? ` või telefonil <strong>${safePhone}</strong>` : ''}.</p>
      
      <p>Kui teil on kiire küsimus, helistage meile otse: <strong>+372 51 27 938</strong></p>
    `;

    await transporter.sendMail({
      from: `"Papagoi Keskus" <${FROM_EMAIL}>`,
      to: data.email,
      subject: 'Teie sõnum on saadetud - Papagoi Keskus',
      html: getEmailTemplate('Teie sõnum on saadetud', clientContent, true),
    });

    // Keskuse teavitusemail
    const centerContent = `
      <div class="info-box">
        <strong>Nimi:</strong> ${safeName}
      </div>
      <div class="info-box">
        <strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a>
      </div>
      ${data.phone ? `
      <div class="info-box">
        <strong>Telefon:</strong> <a href="tel:${safePhone}">${safePhone}</a>
      </div>
      ` : ''}
      <div class="info-box">
        <strong>Teema:</strong> ${safeSubject}
      </div>
      ${data.formType ? `
      <div class="info-box">
        <strong>Vormi tüüp:</strong> ${safeFormType}
      </div>
      ` : ''}
      <div class="highlight">
        <strong>Sõnum:</strong>
        <p>${safeMessage}</p>
      </div>
      
      <p style="margin-top: 30px;">
        <a href="mailto:${safeEmail}" style="background: #43A047; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Vasta kliendile
        </a>
      </p>
    `;

    await transporter.sendMail({
      from: `"Papagoi Keskus Kontaktvorm" <${FROM_EMAIL}>`,
      to: CENTER_EMAIL,
      subject: `Uus kontaktvormi sõnum: ${data.subject}`,
      html: getEmailTemplate('Uus kontaktvormi sõnum', centerContent, false),
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Broneeringu emaili saatmine
export async function sendBookingEmail(data: {
  name: string;
  email: string;
  phone: string;
  groupSize: number;
  date?: Date;
  timeSlot?: string;
  groupType?: string;
  message?: string;
  totalPrice: number;
  bookingId: string;
}) {
  try {
    const safeName = escapeHtml(data.name);
    const safeEmail = escapeHtml(data.email);
    const safePhone = escapeHtml(data.phone);
    const safeTimeSlot = data.timeSlot ? escapeHtml(data.timeSlot) : '';
    const safeBookingId = escapeHtml(data.bookingId);
    const safeMessage = data.message ? escapeHtml(data.message).replace(/\n/g, '<br>') : '';

    const formattedDate = data.date
      ? new Date(data.date).toLocaleDateString('et-EE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

    const groupTypeLabel = 
      data.groupType === 'perevisit' ? 'Perevisit' : 
      data.groupType === 'kool' ? 'Kool/Lasteaed' : 
      data.groupType === 'ettevote' ? 'Ettevõte' : 'Muu';

    // Kliendi kinnitusemail
    const clientContent = `
      <h2>Tere, ${safeName}!</h2>
      <p>Teie päring on edukalt esitatud. Võtame teiega ühendust 24 tunni jooksul külastuse aja kinnitamiseks.</p>
      
      <div class="info-box">
        <h3>Papagoi Keskuse külastuse päring (ID - ${safeBookingId}):</h3>
        <p><strong>Asukoht:</strong> Tartu mnt 80, Soinaste, Kambja vald, Tartumaa 61709</p>
        <p>
          <strong>Google Maps:</strong>
          <a href="https://www.google.com/maps/search/?api=1&query=Tartu%20mnt%2080%2C%20Soinaste%2C%20Kambja%20vald%2C%20Tartumaa%2061709">
            Ava navigatsioon
          </a>
        </p>
        ${data.date ? `<p><strong>Eelistatud kuupäev:</strong> ${formattedDate}</p>` : ''}
        ${data.timeSlot ? `<p><strong>Eelistatud kellaaeg:</strong> ${safeTimeSlot}</p>` : ''}
        ${data.timeSlot ? `<p>Palun saabuge 5–10 min varem. Kui hilinete, andke meile kindlasti teada tel 512 7938.</p>` : ''}
        <p><strong>Grupi suurus:</strong> ${data.groupSize} inimest</p>
        ${data.groupType ? `<p><strong>Grupi tüüp:</strong> ${groupTypeLabel}</p>` : ''}
        <p><strong>Eeldatav hind:</strong> <strong style="color: #43A047; font-size: 1.2em;">${data.totalPrice.toFixed(2)} €</strong></p>
        <p>Maksmine peale üritust sularahas või suuremad grupid arvega.</p>
        ${data.message ? `<p><strong>Lisainfo:</strong> ${safeMessage}</p>` : ''}
      </div>
      
      <div class="highlight">
        <strong>⚠️ Oluline:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Külastus jõustub AINULT, kui olete saanud meilt kinnituskirja.</li>
          <li>Kui teil on küsimusi, helistage või kirjutage meile.</li>
          <li>Tühistamine 24 h ette.</li>
        </ul>
      </div>
      
      <p>Meie kontaktandmed:</p>
      <p>
        <strong>Telefon:</strong> +372 51 27 938<br>
        <strong>Email:</strong> keskus@papagoi.ee
      </p>
    `;

    await transporter.sendMail({
      from: `"Papagoi Keskus" <${FROM_EMAIL}>`,
      to: data.email,
      subject: 'Broneeringu päring - Papagoi Keskus',
      html: getEmailTemplate('Broneeringu päring', clientContent, true),
    });

    // Keskuse teavitusemail
    const centerContent = `
      <div style="background: #d4edda; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745; border-radius: 5px; text-align: center;">
        <h2 style="margin: 0; color: #155724;">Broneeringu ID: ${safeBookingId}</h2>
      </div>
      
      <div class="info-box">
        <strong>Nimi:</strong> ${safeName}
      </div>
      <div class="info-box">
        <strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a>
      </div>
      <div class="info-box">
        <strong>Telefon:</strong> <a href="tel:${safePhone}">${safePhone}</a>
      </div>
      ${data.date ? `
      <div class="info-box">
        <strong>Eelistatud kuupäev:</strong> ${formattedDate}
      </div>
      ` : ''}
      ${data.timeSlot ? `
      <div class="info-box">
        <strong>Eelistatud kellaaeg:</strong> ${safeTimeSlot}
      </div>
      ` : ''}
      <div class="info-box">
        <strong>Grupi suurus:</strong> ${data.groupSize} inimest
      </div>
      ${data.groupType ? `
      <div class="info-box">
        <strong>Grupi tüüp:</strong> ${groupTypeLabel}
      </div>
      ` : ''}
      <div class="info-box">
        <strong>Eeldatav hind:</strong> <strong style="color: #28a745; font-size: 1.2em;">${data.totalPrice.toFixed(2)} €</strong>
      </div>
      ${data.message ? `
      <div class="highlight">
        <strong>Lisainfo:</strong>
        <p>${safeMessage}</p>
      </div>
      ` : ''}
      
      <p style="margin-top: 30px;">
        <a href="mailto:${safeEmail}" style="background: #43A047; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
          Vasta kliendile
        </a>
        <a href="tel:${safePhone}" style="background: #039BE5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Helista
        </a>
      </p>
    `;

    await transporter.sendMail({
      from: `"Papagoi Keskus Broneering" <${FROM_EMAIL}>`,
      to: CENTER_EMAIL,
      subject: `Uus broneering: ${data.name}${data.date ? ` - ${formattedDate}` : ''}${data.timeSlot ? ` ${data.timeSlot}` : ''}`,
      html: getEmailTemplate('Uus broneering', centerContent, false),
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
