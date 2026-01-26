# Notion Integreerimise Seadistamine

See dokument selgitab, kuidas seadistada Notion integreerimine "Meie papagoid" lehe jaoks.

## 1. Notion API Integration Loomine

1. Minge [Notion Integrations](https://www.notion.so/my-integrations) lehele
2. Klõpsake "New integration"
3. Andke integreerimisele nimi (nt "Papagoi Keskus Website")
4. Valige tööruum
5. Klõpsake "Submit"
6. Kopeerige **Internal Integration Token** - see on teie `NOTION_API_KEY`

## 2. Notion Database Loomine

1. Looge Notion'is uus database (Table view)
2. Lisage järgmised väljad:

### Väljad:

| Välja nimi | Tüüp | Kirjeldus |
|------------|------|-----------|
| `Nimi` | Title | Papagoi nimi |
| `Liik` | Select | Papagoi liik (nt "Ara ararauna", "Nymphicus hollandicus") |
| `Pilt` | Files & media | Papagoi pilt |
| `Vanus` | Rich text | Papagoi vanus (nt "15 aastat") |
| `Iseloom` | Multi-select | Iseloomuomadused (nt "Sõbralik", "Intelligentne") |
| `Lugu` | Rich text | Papagoi lugu/kirjeldus |
| `Lemmikud` | Multi-select | Lemmikud (nt "Päevalilleseemned", "Pähklid") |
| `RistiisaStaatus` | Select | Võimalikud väärtused: "Available", "Sponsored", "Pending" |
| `Kuutasu` | Number | Kuutasu eurodes (nt 25) |
| `RistiisaNimi` | Rich text | Ristiisa nimi (kui on) |
| `Vajadused` | Rich text | Mida papagoi vajab |

### Näide Select väljade väärtustest:

**RistiisaStaatus:**
- `Available` - Otsib ristiisa
- `Sponsored` - On ristiisa
- `Pending` - Ootel

## 3. Database'i Jagamine Integration'iga - OLULINE!

**See on kriitiline samm! Ilma selleta ei tööta API.**

1. Avage oma Notion database (link: https://www.notion.so/Papagoid-b115d8bc75c74f08b203e3969d618bd5)
2. Klõpsake üleval paremal "..." (Settings) või "⋮" (More options)
3. Valige "Connections" või "Add connections"
4. Otsige oma integration (nt "Papagoi Keskus Website" või mis iganes nime andsite)
5. Klõpsake "Connect"
6. Veenduge, et integration on nüüd ühendatud (näete seda "Connections" all)

**Kui te ei näe "Connections" valikut:**
- Veenduge, et olete database'i omanik või teil on õigused
- Proovige avada database uues aknas
- Kontrollige, et integration on loodud õiges tööruumis

## 4. Database ID Leidmine

1. Avage oma Notion database
2. Vaadake URL'i - see näeb välja nagu:
   ```
   https://www.notion.so/your-workspace/DATABASE_ID?v=...
   ```
3. Kopeerige `DATABASE_ID` (32 tähemärki, mis on enne `?` märki)
4. Näide: kui URL on `https://www.notion.so/abc123def456?v=...`, siis `DATABASE_ID` on `abc123def456`

## 5. .env Faili Seadistamine

Lisage oma `.env` faili (või `.env.local`) järgmised muutujad:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PARROTS_DATABASE_ID=abc123def456ghi789jkl012mno345pq
```

**Tähtis:** 
- Ärge commit'ige `.env` faili Git'i!
- Kasutage `.env.local` arendamiseks
- Production'is seadistage need muutujad oma hosting provider'is

## 6. Testimine

1. Käivitage arendusserver: `npm run dev`
2. Avage brauseris: `http://localhost:3000/papagoid`
3. Kui Notion API on õigesti seadistatud, peaksite nägema oma Notion database'ist pärit papagoisid
4. Kui Notion API puudub või on vale, näidatakse fallback andmeid

## 7. Troubleshooting

### Probleem: "Notion API viga"
- Kontrollige, kas `NOTION_API_KEY` on õige
- Kontrollige, kas `NOTION_PARROTS_DATABASE_ID` on õige
- Veenduge, et integration on database'iga ühendatud

### Probleem: "Empty array" tagastatakse
- Kontrollige, kas database'is on andmeid
- Kontrollige, kas väljade nimed vastavad oodatule (suur- ja väiketähed on olulised!)
- Vaadake serveri konsooli vigu

### Probleem: Pildid ei näita
- Veenduge, et `Pilt` väli on tüübiga "Files & media"
- Kontrollige, kas pildid on Notion'is üles laetud
- Või kasutage external URL'e (nt CDN)

## 8. Väljade Nimede Kohandamine

Kui teie Notion database'is on väljad teistel nimedel, kohandage `app/api/notion/parrots/route.ts` failis vastavaid väljanimesid:

```typescript
name: properties.Nimi?.title?.[0]?.plain_text || 'Nimetu',
// Muutke "Nimi" oma välja nimeks
```

## 9. Täiendavad Väljad

Kui soovite lisada rohkem välju (nt "Sugu", "Sünniaeg", jne), lisage need:
1. Notion database'isse
2. `route.ts` faili mapping'usse
3. `ParrotsPageClient.tsx` faili kuvamisse

## Abi

Kui teil on küsimusi või probleeme, vaadake:
- [Notion API dokumentatsioon](https://developers.notion.com/)
- [Notion API Reference](https://developers.notion.com/reference)
