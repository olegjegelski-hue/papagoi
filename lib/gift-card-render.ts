import { readFileSync } from 'fs'
import { join } from 'path'
import QRCode from 'qrcode'
import { chromium as playwrightChromium } from 'playwright-core'

export interface GiftCardRenderInput {
  code: string
  amountEur: number
  validUntil: string
  qrUrl: string
}

/** Väike JPEG logo baasi64-sse — suur PNG (~340KB) kukutab Vercel Chromiumi. */
function getLogoDataUri(): string {
  const candidates = [
    join(process.cwd(), 'public', 'gift-card', 'logo-card.jpg'),
    join(process.cwd(), 'public', 'logo.png'),
  ]
  for (const path of candidates) {
    try {
      const buf = readFileSync(path)
      const mime = path.endsWith('.jpg') || path.endsWith('.jpeg') ? 'image/jpeg' : 'image/png'
      return `data:${mime};base64,${buf.toString('base64')}`
    } catch {
      /* proovi järgmist */
    }
  }
  console.error('[gift-card-render] logo puudub, fallback URL')
  return 'https://www.papagoi.ee/logo.png'
}

/** Vercel x64 pack — chromium-min laeb binaari esimesel käivitamisel /tmp alla */
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ||
  'https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar'

async function launchBrowser() {
  // Vercel / Lambda: kasuta @sparticuz/chromium-min + kaugpack (väldib bundleri bin-probleemi)
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium-min')).default
    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: true,
    })
  }

  // Lokaalselt: Playwrighti paigaldatud brauseri binaar
  const { chromium } = await import('playwright')
  return playwrightChromium.launch({
    executablePath: chromium.executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}

const CARD_WIDTH_PX = 1080
const CARD_HEIGHT_PX = 680

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatEeDate(input: string): string {
  const raw = (input || '').trim()
  if (!raw) return ''
  // ISO: 2027-03-26 or 2027-03-26T...
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`
  // Notion formula: 18/07/2027 või 18/7/2027 (päev/kuu/aasta)
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const d = slash[1].padStart(2, '0')
    const m = slash[2].padStart(2, '0')
    return `${d}.${m}.${slash[3]}`
  }
  // Already in EE form?
  const ee = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (ee) {
    return `${ee[1].padStart(2, '0')}.${ee[2].padStart(2, '0')}.${ee[3]}`
  }
  return raw
}

function buildGiftCardHtml(
  input: GiftCardRenderInput & {
    qrSvg: string
    logoUrl: string
  }
) {
  const { amountEur, validUntil, code, qrSvg, logoUrl } = input
  const validUntilEe = formatEeDate(validUntil)

  return `<!doctype html>
<html lang="et">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${CARD_WIDTH_PX}, initial-scale=1" />
    <style>
      :root{
        --green:#43A047;
        --blue:#039BE5;
        --orange:#FF9800;
        --beige:#E8E4DF;
        --beige-50:#F5F3F0;
        --text:#263238;
        --muted:#607D8B;
        --brown:#4a4a40;
      }
      body{
        margin:0;
        background:transparent;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color:var(--text);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .gc-page{
        width:${CARD_WIDTH_PX}px;
        height:${CARD_HEIGHT_PX}px;
        display:flex;
        align-items:center;
        justify-content:center;
        background: #fff;
      }
      .gc-card{
        position:relative;
        width:1000px;
        height:600px;
        background:
          radial-gradient(ellipse 420px 300px at 88% 12%, rgba(67,160,71,0.14), transparent 58%),
          radial-gradient(ellipse 380px 280px at 6% 88%, rgba(255,152,0,0.1), transparent 52%),
          radial-gradient(ellipse 340px 260px at 72% 72%, rgba(3,155,229,0.1), transparent 50%),
          radial-gradient(ellipse 280px 220px at 38% 42%, rgba(96,125,139,0.07), transparent 48%),
          linear-gradient(168deg, #f4f1eb 0%, #e9e4dc 38%, #f2efe8 72%, #ebe6df 100%);
        border: 1px solid rgba(38,50,56,.18);
        border-radius: 22px;
        overflow:hidden;
        box-shadow: 0 16px 34px rgba(0,0,0,0.12);
      }
      .gc-bg-theme{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        z-index:0;
        pointer-events:none;
        opacity:1;
      }
      .gc-ornament{
        position:absolute;
        left: 0;
        top: 0;
        right: 0;
        height: 170px;
        pointer-events:none;
        opacity:0.7;
        z-index:1;
      }
      .gc-topbar{
        position:absolute;
        top:26px;
        left:34px;
        right:34px;
        display:flex;
        align-items:flex-start;
        justify-content:flex-start;
        gap: 18px;
        z-index:2;
      }
      .gc-logo{
        height:400px;
        width:auto;
        object-fit:contain;
        border-radius: 10px;
        background: rgba(255,255,255,0.65);
        padding: 8px;
        border: 1px solid rgba(38,50,56,.12);
      }
      .gc-titleText{
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        font-weight: 900;
        font-size: 92px;
        line-height: 0.92;
        color: var(--brown);
        letter-spacing: -0.02em;
        margin-top: 0; /* ülemine serv logo raamiga ühel kõrgusel */
        flex: 1;
        display:flex;
        align-items:flex-start;
        justify-content:center;
        height: 400px; /* match logo height */
        text-align:center;
      }
      .gc-titleStack{
        width: 100%;
        max-width: 520px;
        display:flex;
        flex-direction:column;
        align-items:center;
      }
      .gc-titleMain{
        text-decoration: underline;
        text-decoration-thickness: 3px;
        text-underline-offset: 10px;
        text-decoration-color: rgba(74,74,64,0.45);
      }
      /* Üks ühine keha teksti stiil (aadress, kehtivus, broneerimine, tervitus) */
      .gc-body{
        font-family: "Open Sans", system-ui, sans-serif;
        font-weight: 600;
        font-size: 16px;
        line-height: 1.45;
        color: rgba(38,50,56,0.72);
        letter-spacing: 0.02em;
        font-kerning: normal;
        font-feature-settings: "kern" 1;
        -webkit-font-smoothing: antialiased;
      }
      .gc-body .gc-date{ color: var(--green); font-weight: 600; }
      .gc-validTop{
        margin-top: 14px;
      }
      .gc-sumLine{
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        font-weight: 900;
        color: var(--brown);
        font-size: 40px;
        margin-top: 34px; /* summa allapoole */
      }
      .gc-sumLine span{ color: var(--green); }
      .gc-bookLine{
        margin-top: 18px;
        text-align:center;
      }
      .gc-bookLine .url{
        display:block;
        margin-top: 6px;
        font-weight: 600;
        color: rgba(38,50,56,0.72);
      }
      .gc-qr{
        position:absolute;
        bottom: 20px;
        right: 20px;
        width:140px;
        height:140px;
        background: rgba(255,255,255,0.85);
        border: 1px solid rgba(38,50,56,.16);
        border-radius: 16px;
        padding:10px;
        z-index:3;
        box-sizing:border-box;
      }
      .gc-qr svg{
        width:100%;
        height:100%;
        display:block;
      }
      .gc-content{
        position:absolute;
        inset:0;
        z-index:2;
        padding: 22px 34px 26px 34px;
        box-sizing:border-box;
      }
      .gc-sub{
        margin-top: 6px;
        font-size: 18px;
        color: rgba(38,50,56,0.78);
        max-width: 720px;
      }
      .gc-sub b{ color: rgba(38,50,56,0.9); }

      .gc-amountLine{
        display:none;
      }
      .gc-amountLine span{
        color: var(--green);
      }
      .gc-bottom{
        position:absolute;
        left:34px;
        right:34px;
        bottom: 22px;
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
      }
      .gc-contact{
        /* ära sea emale teist fonti — muidu võib kerning/baseline erineda */
        margin: 0;
        padding: 0;
      }
      .gc-contact .gc-body{
        display: block;
        margin-bottom: 2px;
      }
      .gc-contact .gc-body:last-child{
        margin-bottom: 0;
      }
      .gc-validUntil{
        position:absolute;
        right: 180px; /* jätame ruumi QR-ile */
        bottom: 42px;
        font-family: "Open Sans", system-ui, sans-serif;
        font-weight: 700;
        font-size: 16px;
        color: rgba(38,50,56,0.76);
      }
      .gc-validUntil b{ color: var(--green); }

      .gc-code{
        display:none;
      }
    </style>
  </head>

  <body>
    <div class="gc-page">
      <section class="gc-card">
        <svg class="gc-bg-theme" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="gcFeather1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#43A047" stop-opacity="0.14"/>
              <stop offset="100%" stop-color="#039BE5" stop-opacity="0.06"/>
            </linearGradient>
            <linearGradient id="gcFeather2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FF9800" stop-opacity="0.12"/>
              <stop offset="100%" stop-color="#43A047" stop-opacity="0.05"/>
            </linearGradient>
          </defs>
          <path fill="url(#gcFeather1)" d="M720 40c80 40 120 140 90 240-25 75-95 120-180 95-40-12-70-45-85-85 25-95 95-210 175-250z" opacity="0.85"/>
          <path fill="url(#gcFeather2)" d="M40 380c60-20 130 10 170 70 35 52 30 120-15 165-45 48-120 55-175 15-55-45-45-130 20-250z" opacity="0.75"/>
          <path fill="rgba(3,155,229,0.07)" d="M480 320c55 15 95 65 100 125 5 70-35 130-100 145-90 20-170-40-185-130-8-55 10-110 50-145 45-40 95-35 135 5z"/>
          <g fill="none" stroke="rgba(38,50,56,0.06)" stroke-width="1.2" stroke-linecap="round">
            <path d="M650 480 Q720 420 820 460"/>
            <path d="M120 200 Q200 120 280 180"/>
            <path d="M420 80 Q500 40 580 90"/>
          </g>
        </svg>
        <svg class="gc-ornament" viewBox="0 0 1000 170" preserveAspectRatio="none" aria-hidden="true">
          <path d="M780 0c-40 20-60 50-70 80-12 38-4 74 20 90" fill="none" stroke="rgba(38,50,56,0.22)" stroke-width="2"/>
          <path d="M740 15c-40 20-60 50-70 80-12 38-4 74 20 90" fill="none" stroke="rgba(38,50,56,0.18)" stroke-width="2"/>
          <path d="M700 30c-40 20-60 50-70 80-12 38-4 74 20 90" fill="none" stroke="rgba(38,50,56,0.14)" stroke-width="2"/>
          <path d="M610 32c20 10 30 30 34 52" fill="none" stroke="rgba(38,50,56,0.14)" stroke-width="2" stroke-linecap="round"/>
          <path d="M590 62c20 8 30 24 34 42" fill="none" stroke="rgba(38,50,56,0.12)" stroke-width="2" stroke-linecap="round"/>
          <path d="M670 70c-18 6-30 18-38 34" fill="none" stroke="rgba(38,50,56,0.12)" stroke-width="2" stroke-linecap="round"/>
        </svg>

        <div class="gc-topbar">
          <img class="gc-logo" src="${escapeHtml(logoUrl)}" alt="Papagoi Keskus" />
          <div class="gc-titleText">
            <div class="gc-titleStack">
              <div class="gc-titleMain">Kinkekaart</div>
              <div class="gc-validTop gc-body">Kehtib kuni: <span class="gc-date">${escapeHtml(validUntilEe)}</span></div>
              <div class="gc-sumLine">Summa: <span>${amountEur} €</span></div>
              <div class="gc-bookLine gc-body">
                Broneeri külastus:
                <span class="url">papagoi.ee</span>
              </div>
            </div>
          </div>
        </div>

        <div class="gc-qr">${qrSvg}</div>

        <div class="gc-content"></div>

        <div class="gc-bottom">
          <div class="gc-contact">
            <span class="gc-body">Papagoid ootavad teid:</span>
            <span class="gc-body">Tartu mnt 80, Soinaste, Kambja Vald, Tartumaa.</span>
            <span class="gc-body">Tel +372 512 7938</span>
          </div>
        </div>

        <!-- Kehtivus kuvatakse ülal "Kinkekaart" all -->
      </section>
    </div>
  </body>
</html>`
}

export async function renderGiftCardToPngPdf(input: GiftCardRenderInput) {
  const logoUrl = getLogoDataUri()

  const qrSvg = await QRCode.toString(input.qrUrl, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    width: 170,
    scale: 4,
  })

  const html = buildGiftCardHtml({
    ...input,
    qrSvg,
    logoUrl,
  })

  const browser = await launchBrowser()
  try {
    const page = await browser.newPage({
      viewport: { width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX },
      deviceScaleFactor: 1,
    })

    // Inline JPEG logo (~50KB) + süsteemifondid — ei vaja networkidle/Google Fonts
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.waitForFunction(() => {
      const img = document.querySelector('img.gc-logo') as HTMLImageElement | null
      return Boolean(img && img.complete && img.naturalWidth > 0)
    }, { timeout: 5_000 }).catch(() => {
      /* logo puudumisel jätkame — kuupäev/summa peavad ikkagi pildile minema */
    })
    await new Promise((r) => setTimeout(r, 100))

    const pngBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: { x: 0, y: 0, width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX },
    })

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: `${CARD_WIDTH_PX}px`,
      height: `${CARD_HEIGHT_PX}px`,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    })

    return { pngBuffer, pdfBuffer }
  } finally {
    await browser.close()
  }
}

