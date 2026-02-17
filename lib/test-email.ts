import nodemailer from 'nodemailer';

/**
 * Testi funktsioon emaili saatmise kontrollimiseks.
 * Kasutab samu keskkonnamuutujaid nagu lib/email.ts: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.
 */
export async function testEmailConnection() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      'SMTP seaded puuduvad! Lisa Vercelis (või .env): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD. ' +
      'Näide: SMTP_HOST=mail.papagoi.ee, SMTP_PORT=587, SMTP_USER=keskus@papagoi.ee'
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
  });

  // Testi ühendust
  try {
    await transporter.verify();
    console.log('✅ SMTP ühendus töötab!');
  } catch (error) {
    console.error('❌ SMTP ühendus ebaõnnestus:', error);
    throw error;
  }

  // Saada test email
  try {
    const info = await transporter.sendMail({
      from: `"Papagoi Keskus Test" <${smtpUser}>`,
      to: 'keskus@papagoi.ee',
      subject: 'Test email - Papagoi Keskus',
      html: `
        <h2>Test email</h2>
        <p>See on test email, et kontrollida, kas emaili saatmine töötab.</p>
        <p>Kui saite selle emaili, siis SMTP seaded on õiged! ✅</p>
        <p><strong>SMTP Host:</strong> ${smtpHost}</p>
        <p><strong>SMTP Port:</strong> ${smtpPort}</p>
        <p><strong>SMTP User:</strong> ${smtpUser}</p>
      `,
    });

    console.log('✅ Test email saadetud edukalt!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Test emaili saatmine ebaõnnestus:', error);
    throw error;
  }
}



