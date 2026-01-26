# Oma Mailiserveri Seadistamine

## Vajalikud seaded

Lisa oma `.env` faili järgmised read:

```env
# SMTP Serveri seaded
SMTP_HOST=smtp.papagoi.ee
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@papagoi.ee
SMTP_PASS=teie_emaili_parool

# Emaili aadressid
FROM_EMAIL=noreply@papagoi.ee
CENTER_EMAIL=keskus@papagoi.ee
```

## Kuidas leida oma mailiserveri seaded?

### cPanel (kõige levinum)

1. **Logi sisse cPanel'i**
2. **Mine "Email Accounts"** sektsiooni
3. **Vali emaili konto** (nt `noreply@papagoi.ee`)
4. **Vaata "Connect Devices"** või "Configure Mail Client"**
5. **Leia SMTP seaded:**
   - **SMTP Host:** `mail.papagoi.ee` või `smtp.papagoi.ee`
   - **SMTP Port:** `587` (TLS) või `465` (SSL)
   - **SMTP User:** `noreply@papagoi.ee` (täielik emaili aadress)
   - **SMTP Pass:** emaili konto parool

### Plesk

1. **Logi sisse Plesk'i**
2. **Mine "Mail"** sektsiooni
3. **Vali emaili konto**
4. **Vaata "Mail Client Settings"**
5. **Leia SMTP seaded**

### DirectAdmin

1. **Logi sisse DirectAdmin'i**
2. **Mine "Email Management"**
3. **Vali emaili konto**
4. **Vaata "Mail Client Configuration"**

### Üldised SMTP seaded

Kui ei leia täpset infot, proovi järgmisi:

**Tavaliselt:**
- **SMTP Host:** `mail.teie-domeen.ee` või `smtp.teie-domeen.ee`
- **SMTP Port:** `587` (TLS - soovitatav) või `465` (SSL)
- **SMTP User:** täielik emaili aadress (nt `noreply@papagoi.ee`)
- **SMTP Pass:** emaili konto parool

**Portid:**
- `587` - TLS (tavaliselt töötab kõikjal)
- `465` - SSL (mõned serverid eelistavad seda)
- `25` - Tavaline SMTP (mitte soovitatav, sageli blokeeritud)

## Testimine

Pärast seadistamist testi emaili saatmist:

### 1. Veebis (lihtsaim)

Ava brauseris:
```
http://localhost:3000/api/test-email
```

Kui näed `{"success":true}`, siis töötab! ✅

### 2. Terminalis

```bash
curl http://localhost:3000/api/test-email
```

### 3. Kontrolli emaili

Kontrolli, et test email tuli `CENTER_EMAIL` aadressile.

## Levinumad vead ja lahendused

### ❌ "Connection timeout"

**Põhjus:** SMTP host on vale või port on blokeeritud

**Lahendus:**
- Kontrolli, et `SMTP_HOST` on õige
- Proovi porti `587` või `465`
- Kontrolli, et server lubab väljaminevaid ühendusi

### ❌ "Authentication failed"

**Põhjus:** Kasutajanimi või parool on vale

**Lahendus:**
- Kontrolli, et `SMTP_USER` on täielik emaili aadress (nt `noreply@papagoi.ee`)
- Kontrolli, et `SMTP_PASS` on õige parool
- Mõned serverid vajavad täielikku emaili aadressi kasutajanimeks

### ❌ "Self-signed certificate"

**Põhjus:** Server kasutab iseallkirjastatud sertifikaati

**Lahendus:** (arendamiseks) lisa `.env` faili:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```
**⚠️ Ära kasuta seda tootmises!**

### ❌ "Port 25 blocked"

**Põhjus:** Paljud hostingud blokeerivad porti 25

**Lahendus:** Kasuta porti `587` või `465`

## Näited erinevate hostingute jaoks

### Zone.ee

```env
SMTP_HOST=mail.zone.ee
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=teie@domeen.ee
SMTP_PASS=parool
```

### Hosting.ee

```env
SMTP_HOST=mail.hosting.ee
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=teie@domeen.ee
SMTP_PASS=parool
```

### Oma server

```env
SMTP_HOST=smtp.papagoi.ee
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@papagoi.ee
SMTP_PASS=parool
```

## Järgmised sammud

1. ✅ Lisa SMTP seaded `.env` faili
2. ✅ Testi ühendust: `http://localhost:3000/api/test-email`
3. ✅ Kontrolli, et test email tuli
4. ✅ Täida kontaktvorm või tee broneering kodulehel
5. ✅ Kontrolli, et emailid saadetakse nii kliendile kui ka keskusele

## Abi vajadusel

Kui emailid ei tule:
1. Kontrolli serveri logisid (terminalis kus `npm run dev` töötab)
2. Kontrolli, et `.env` fail on õigesti täidetud
3. Kontrolli, et emaili aadressid on õiged
4. Proovi erinevaid porte (587, 465)



