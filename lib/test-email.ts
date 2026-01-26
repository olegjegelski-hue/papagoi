import nodemailer from 'nodemailer';

/**
 * Testi funktsioon emaili saatmise kontrollimiseks
 * Kasuta seda, et kontrollida, kas SMTP seaded on õiged
 */
export async function testEmailConnection() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@papagoi.ee';
  const centerEmail = process.env.CENTER_EMAIL || 'keskus@papagoi.ee';

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error('SMTP seaded puuduvad! Lisa .env faili:\n' +
      'SMTP_HOST=smtp.papagoi.ee\n' +
      'SMTP_PORT=587\n' +
      'SMTP_SECURE=false\n' +
      'SMTP_USER=noreply@papagoi.ee\n' +
      'SMTP_PASS=teie_parool\n' +
      'FROM_EMAIL=noreply@papagoi.ee\n' +
      'CENTER_EMAIL=keskus@papagoi.ee'
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
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
      from: `"Papagoi Keskus Test" <${fromEmail}>`,
      to: centerEmail,
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



