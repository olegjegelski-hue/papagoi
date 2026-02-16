# Emaili saatmise seadistamine

Papagoi Keskuse koduleht kasutab **Nodemailer'it** – sama lahendus nagu PetsVilla.ee.

## Valikud emaili saatmiseks

### 1. Alfanet SMTP (Soovitatav – töötab Vercelis, nagu PetsVilla)

Kui papagoi.ee on Alfaneti majutuses (või saate kasutada Alfaneti e-posti):

```env
SMTP_HOST=smtp.alfanetti.ee
SMTP_PORT=465
SMTP_USER=keskus@papagoi.ee
SMTP_PASSWORD=teie_parool
FROM_EMAIL=keskus@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

**Port 465** – SSL, `secure` seatakse automaatselt.

### 2. Gmail (Lihtsaim viis)

1. Loo Gmail konto või kasuta olemasolevat
2. Loo **App Password** (mitte tavaline parool!):
   - Mine: https://myaccount.google.com/apppasswords
   - Vali "Mail" ja "Other (Custom name)" → "Papagoi Keskus"
   - Kopeeri genereeritud parool (16 tähemärki)

3. Lisa `.env` faili:
```env
GMAIL_USER=teie@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
FROM_EMAIL=teie@gmail.com
CENTER_EMAIL=keskus@papagoi.ee
```

### 3. Outlook/Hotmail

1. Lisa `.env` faili:
```env
OUTLOOK_USER=teie@outlook.com
OUTLOOK_PASSWORD=teie_parool
FROM_EMAIL=teie@outlook.com
CENTER_EMAIL=keskus@papagoi.ee
```

### 4. Oma SMTP server

Kui teil on oma mailiserver (nt cPanel, Plesk):

```env
SMTP_HOST=mail.papagoi.ee
SMTP_PORT=465
SMTP_USER=noreply@papagoi.ee
SMTP_PASSWORD=teie_parool
FROM_EMAIL=noreply@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

**Portid:**
- `465` – SSL (secure)
- `587` – TLS

**Märkus:** Mõned majutajad (nt oma VPS) blokeerivad Verceli ühendusi. Kui tekib ETIMEDOUT, kasutage Alfaneti SMTP (vt ülal).

### 5. Muud SMTP teenused

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=teie_sendgrid_api_key
FROM_EMAIL=noreply@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@teie_domeen.mailgun.org
SMTP_PASSWORD=teie_mailgun_parool
FROM_EMAIL=noreply@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

## Vercel (Production)

Kui kasutate Vercelit, lisa **Settings → Environment Variables**:

**Alfanet (soovitatav, nagu PetsVilla):**
- `SMTP_HOST` = `smtp.alfanetti.ee`
- `SMTP_PORT` = `465`
- `SMTP_USER` = `keskus@papagoi.ee` (või teie Alfaneti email)
- `SMTP_PASSWORD` = teie parool
- `FROM_EMAIL` = `keskus@papagoi.ee`
- `CENTER_EMAIL` = `keskus@papagoi.ee`

**Või Gmail:** `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `FROM_EMAIL`, `CENTER_EMAIL`

**Oluline:** Pärast muutujate lisamist tee uus deploy (Redeploy).

## Testimine

1. Täida kontaktvorm või tee broneering kodulehel
2. Kontrolli, et emailid saadetakse nii kliendile kui ka keskusele
3. Kui emailid ei tule, kontrolli Verceli Runtime Logs

## Troubleshooting

**Emailid ei tule:**
- Kontrolli, et keskkonnamuutujad on õigesti täidetud
- Gmail puhul: kasuta App Password, mitte tavaline parool
- Kontrolli Verceli logisid veateadete jaoks

**ETIMEDOUT / EDNS (Vercel):**
- **ETIMEDOUT:** Oma domeeni SMTP (mail.papagoi.ee) blokeerib Verceli ühendusi
- **EDNS/ENOTFOUND:** DNS ei leia SMTP hosti – kontrolli, et SMTP_HOST on õige (nt `smtp.alfanetti.ee`)
- **Lahendus:** kasutage Alfaneti SMTP (`smtp.alfanetti.ee`) – töötab nagu PetsVilla.ee

**SMTP_PASS vs SMTP_PASSWORD:**
- Mõlemad on toetatud; soovitatav on `SMTP_PASSWORD` (PetsVilla stiilis)

## Keskkonna muutujad

| Muutuja | Kirjeldus | Näide |
|---------|-----------|-------|
| `SMTP_HOST` | SMTP server | `smtp.alfanetti.ee` |
| `SMTP_PORT` | Port | `465` või `587` |
| `SMTP_USER` | SMTP kasutajanimi | `keskus@papagoi.ee` |
| `SMTP_PASSWORD` | SMTP parool (või SMTP_PASS) | `teie_parool` |
| `FROM_EMAIL` | Aadress, kust saadetakse | `keskus@papagoi.ee` |
| `CENTER_EMAIL` | Keskuse email (teavitused) | `keskus@papagoi.ee` |
