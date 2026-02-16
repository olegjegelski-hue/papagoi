# Emaili saatmise seadistamine

Papagoi Keskuse koduleht kasutab **Nodemailer'it** – identne lahendus nagu PetsVilla.ee.

## Vajalikud keskkonnamuutujad (4 tk)

```env
SMTP_HOST=mail.papagoi.ee
SMTP_PORT=587
SMTP_USER=keskus@papagoi.ee
SMTP_PASSWORD=teie_parool
```

**Alternatiiv (kui mail.papagoi.ee ei tööta):** Alfaneti majutajal proovi `SMTP_HOST=smtp.alfanetti.ee`.

**Ei vaja:** CENTER_EMAIL, FROM_EMAIL, SMTP_SECURE – kõik on koodis fikseeritud.

## Vercel (Production)

Lisa **Settings → Environment Variables**:

| Muutuja | Väärtus |
|---------|---------|
| SMTP_HOST | mail.papagoi.ee |
| SMTP_PORT | 587 |
| SMTP_USER | keskus@papagoi.ee |
| SMTP_PASSWORD | teie Alfaneti parool |

**Oluline:** Pärast muutujate lisamist tee uus deploy (Redeploy).

## Testimine

1. Täida kontaktvorm või tee broneering kodulehel
2. Kontaktvorm: email saadetakse keskusele (keskus@papagoi.ee)
3. Broneering: email saadetakse nii kliendile kui keskusele

## Diagnostika

**Veateate nägemiseks:** Lisa Vercelis ajutiselt `DEBUG_EMAIL_ERRORS=true`. Siis kontaktvorm näitab täpse veateate. Eemalda pärast parandamist.

Kui kontaktvorm annab vea, kontrolli SMTP seadeid:

1. **Health check** (ei saada emaili):  
   `GET https://papagoi.ee/api/health/email`  
   Production: tagastab `ok: true/false`. Kui soovid täpsemat diagnoosimist, lisa Vercelis `EMAIL_DIAGNOSTIC_SECRET` ja kasuta `?secret=TEIE_SALASÕNA`.

2. **Test email** (saadab testkirja keskusele):  
   `GET https://papagoi.ee/api/test-email`  
   Tagastab veateate koos vihjega (nt DNS viga, autentimise viga).

## Troubleshooting

**ETIMEDOUT / EDNS / ENOTFOUND:**
- Kontrolli, et SMTP_HOST on `mail.papagoi.ee`
- Kui `mail.papagoi.ee` ei lahendu, proovi **smtp.alfanetti.ee** (Alfanet) – sama majutaja
- Kontrolli DNS-i: `mail.papagoi.ee` peab olema A-kirje või CNAME

**EAUTH (autentimise viga):**
- Kontrolli SMTP_USER ja SMTP_PASSWORD Vercelis
- Kasutaja peab olema täielik email (nt keskus@papagoi.ee)
- Pärast muutujate muutmist tee **Redeploy**
