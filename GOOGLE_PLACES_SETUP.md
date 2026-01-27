# Google Places API Seadistus

See juhend selgitab, kuidas seadistada Google Places API, et kodulehel kuvada dünaamiline Google'i hinnang ja arvustuste arv.

## Sammud

### 1. Loo Google Cloud Project

1. Mine [Google Cloud Console](https://console.cloud.google.com/)
2. Loo uus projekt või vali olemasolev projekt
3. Aktiveeri Google Places API:
   - Mine "APIs & Services" > "Library"
   - Otsi "Places API"
   - Kliki "Enable"

### 2. Loo API Võti

1. Mine "APIs & Services" > "Credentials"
2. Kliki "Create Credentials" > "API Key"
3. Kopeeri API võti
4. (Soovitatav) Piira API võti:
   - Kliki API võtme peale
   - "Application restrictions" > vali "HTTP referrers"
   - Lisa oma domeenid (nt `papagoi.ee/*`, `*.vercel.app/*`)
   - "API restrictions" > vali ainult "Places API"

### 3. Lisa API Võti Keskkonnamuutujatesse

Lisa oma `.env` faili:

```env
GOOGLE_PLACES_API_KEY=sinu_api_võti_siia
```

### 4. Testimine

Pärast API võtme lisamist peaks Google'i hinnang ja arvustuste arv ilmuma testimoniaalide sektsioonis.

## Märkused

- Google Places API on tasuline, kuid esimesed $200 kuus on tasuta
- API võti peaks olema server-side (ei tohi olla kliendis nähtav)
- Kui API võti puudub, kuvatakse fallback väärtused (5.0 hinnang, 0 arvustust)

## Place ID leidmine

Kui API ei leia kohta automaatselt, võid kasutada [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id) tööriista, et leida täpne Place ID ja seejärel muuta API endpoint'i.
