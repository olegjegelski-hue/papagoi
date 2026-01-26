# Emaili saatmise seadistamine

Papagoi Keskuse koduleht kasutab **Nodemailer'it** emaili saatmiseks. See võimaldab kasutada mitmeid emaili teenuseid ilma eraldi API teenust.

## Valikud emaili saatmiseks

### 1. Gmail (Lihtsaim viis)

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

### 2. Outlook/Hotmail

1. Lisa `.env` faili:
```env
OUTLOOK_USER=teie@outlook.com
OUTLOOK_PASSWORD=teie_parool
FROM_EMAIL=teie@outlook.com
CENTER_EMAIL=keskus@papagoi.ee
```

### 3. Oma SMTP server

Kui teil on oma mailiserver (nt cPanel, Plesk, jne):

```env
SMTP_HOST=smtp.papagoi.ee
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@papagoi.ee
SMTP_PASS=teie_parool
FROM_EMAIL=noreply@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

**Portid:**
- `587` - TLS (soovitatav)
- `465` - SSL (määra `SMTP_SECURE=true`)
- `25` - Tavaline SMTP (mitte soovitatav)

### 4. Muud SMTP teenused

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=teie_sendgrid_api_key
FROM_EMAIL=noreply@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@teie_domeen.mailgun.org
SMTP_PASS=teie_mailgun_parool
FROM_EMAIL=noreply@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

## Testimine

Pärast seadistamist:

1. Täida kontaktvorm või tee broneering kodulehel
2. Kontrolli, et emailid saadetakse nii kliendile kui ka keskusele
3. Kui emailid ei tule, kontrolli serveri logisid või brauseri konsooli

## Troubleshooting

**Emailid ei tule:**
- Kontrolli, et `.env` fail on õigesti täidetud
- Kontrolli, et emaili aadressid on õiged
- Gmail puhul: kasuta App Password, mitte tavaline parool
- Kontrolli serveri logisid veateadete jaoks

**Gmail App Password:**
- Kui ei näe "App Passwords" valikut, lülita 2FA sisse: https://myaccount.google.com/security

**Port blokeeritud:**
- Mõned hostingud blokeerivad väljaminevaid porte
- Proovi porti 587 või 465
- Või kasuta Gmail/Outlook teenust

## Keskkonna muutujad

| Muutuja | Kirjeldus | Näide |
|---------|-----------|-------|
| `FROM_EMAIL` | Aadress, kust emailid saadetakse | `noreply@papagoi.ee` |
| `CENTER_EMAIL` | Keskuse emaili aadress (kuhu saadetakse teavitused) | `keskus@papagoi.ee` |
| `GMAIL_USER` | Gmail kasutajanimi | `teie@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `SMTP_HOST` | SMTP serveri aadress | `smtp.papagoi.ee` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Kas kasutada SSL/TLS | `false` |
| `SMTP_USER` | SMTP kasutajanimi | `noreply@papagoi.ee` |
| `SMTP_PASS` | SMTP parool | `teie_parool` |



