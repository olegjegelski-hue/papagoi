# Emaili saatmise seadistamine

Papagoi Keskuse koduleht kasutab **Nodemailer'it** – identne lahendus nagu PetsVilla.ee.

## Vajalikud keskkonnamuutujad (4 tk)

```env
SMTP_HOST=mail.papagoi.ee
SMTP_PORT=587
SMTP_USER=keskus@papagoi.ee
SMTP_PASSWORD=teie_parool
```

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

## Troubleshooting

**ETIMEDOUT / EDNS:**
- Kontrolli, et SMTP_HOST on `mail.papagoi.ee` (nagu PetsVilla kasutab mail.petsvilla.ee)
- Kui ei tööta, võta ühendust majutajaga
