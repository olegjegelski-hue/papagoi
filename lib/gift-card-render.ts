import QRCode from 'qrcode'
import { chromium } from 'playwright'

export interface GiftCardRenderInput {
  code: string
  amountEur: number
  validUntil: string
  qrUrl: string
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
  // Notion can sometimes return 26/03/2027 in formula or string
  const slash = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slash) return `${slash[1]}.${slash[2]}.${slash[3]}`
  // Already in EE form?
  const ee = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (ee) return raw
  return raw
}

function buildGiftCardHtml(
  input: GiftCardRenderInput & {
    qrSvg: string
    logoUrl: string
    parrotWmUrls: [string, string, string]
  }
) {
  const { amountEur, validUntil, code, qrSvg, logoUrl, parrotWmUrls } = input
  const [wm1, wm2, wm3] = parrotWmUrls
  const validUntilEe = formatEeDate(validUntil)

  return `<!doctype html>
<html lang="et">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${CARD_WIDTH_PX}, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
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
        font-family: "Open Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
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
        background: linear-gradient(0deg, rgba(245,243,240,0.9), rgba(245,243,240,0.9)), radial-gradient(circle at 20% 0%, rgba(67,160,71,0.08), transparent 55%), radial-gradient(circle at 75% 20%, rgba(3,155,229,0.08), transparent 55%);
        border: 1px solid rgba(38,50,56,.18);
        border-radius: 22px;
        overflow:hidden;
        box-shadow: 0 16px 34px rgba(0,0,0,0.12);
      }
      .gc-ornament{
        position:absolute;
        left: 0;
        top: 0;
        right: 0;
        height: 170px;
        pointer-events:none;
        opacity:0.7;
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
        font-family: "Nunito", system-ui, sans-serif;
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
        font-family: "Nunito", system-ui, sans-serif;
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

      /* Kolm eraldi lõigatud papagoid (public/gift-card/wm-parrot-*.png) */
      .gc-parrot-wm-layer{
        position:absolute;
        inset:0;
        z-index:1;
        pointer-events:none;
        overflow:hidden;
        border-radius: inherit;
      }
      .gc-parrot-wm{
        position:absolute;
        opacity:0.12;
        mix-blend-mode: multiply;
      }
      .gc-parrot-wm img{
        width:100%;
        height:100%;
        object-fit:contain;
        display:block;
      }
      /* Sinikollane (vasak logo lind) — ülemine parem tühi ala */
      .gc-parrot-wm--1{
        width:150px;
        height:195px;
        right:3%;
        top:8%;
        transform: rotate(-11deg);
      }
      /* Valge tutt (keskmine) — keskel paremal */
      .gc-parrot-wm--2{
        width:118px;
        height:168px;
        right:22%;
        top:36%;
        transform: rotate(10deg);
      }
      /* Hall + punane saba (parem logo lind) — alumine keskmine, QR-ist eemal */
      .gc-parrot-wm--3{
        width:148px;
        height:168px;
        left:46%;
        bottom:152px;
        transform: rotate(-6deg);
      }
    </style>
  </head>

  <body>
    <div class="gc-page">
      <section class="gc-card">
        <svg class="gc-ornament" viewBox="0 0 1000 170" preserveAspectRatio="none" aria-hidden="true">
          <path d="M780 0c-40 20-60 50-70 80-12 38-4 74 20 90" fill="none" stroke="rgba(38,50,56,0.22)" stroke-width="2"/>
          <path d="M740 15c-40 20-60 50-70 80-12 38-4 74 20 90" fill="none" stroke="rgba(38,50,56,0.18)" stroke-width="2"/>
          <path d="M700 30c-40 20-60 50-70 80-12 38-4 74 20 90" fill="none" stroke="rgba(38,50,56,0.14)" stroke-width="2"/>
          <path d="M610 32c20 10 30 30 34 52" fill="none" stroke="rgba(38,50,56,0.14)" stroke-width="2" stroke-linecap="round"/>
          <path d="M590 62c20 8 30 24 34 42" fill="none" stroke="rgba(38,50,56,0.12)" stroke-width="2" stroke-linecap="round"/>
          <path d="M670 70c-18 6-30 18-38 34" fill="none" stroke="rgba(38,50,56,0.12)" stroke-width="2" stroke-linecap="round"/>
        </svg>

        <div class="gc-parrot-wm-layer" aria-hidden="true">
          <div class="gc-parrot-wm gc-parrot-wm--1"><img src="${escapeHtml(wm1)}" alt="" /></div>
          <div class="gc-parrot-wm gc-parrot-wm--2"><img src="${escapeHtml(wm2)}" alt="" /></div>
          <div class="gc-parrot-wm gc-parrot-wm--3"><img src="${escapeHtml(wm3)}" alt="" /></div>
        </div>

        <div class="gc-topbar">
          <img class="gc-logo" src="${escapeHtml(logoUrl)}" alt="Papagoi Keskus" />
          <div class="gc-titleText">
            <div class="gc-titleStack">
              <div>Kinkekaart</div>
              <div class="gc-validTop gc-body">Kehtib kuni: <span class="gc-date">${escapeHtml(validUntilEe)}</span></div>
              <div class="gc-sumLine">Summa: <span>${amountEur} €</span></div>
              <div class="gc-bookLine gc-body">
                Broneeri külastus:
                <span class="url">www.papagoi.ee</span>
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
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papagoi.ee').replace(/\/$/, '')
  const logoUrl = `${baseUrl}/logo.png`
  const parrotWmUrls: [string, string, string] = [
    `${baseUrl}/gift-card/wm-parrot-1.png`,
    `${baseUrl}/gift-card/wm-parrot-2.png`,
    `${baseUrl}/gift-card/wm-parrot-3.png`,
  ]

  const qrSvg = await QRCode.toString(input.qrUrl, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    width: 170,
    scale: 4,
  })

  // Kasutame olemasolevaid saidil olevaid pilte (CDN), et kaardil oleks “fotoread” nagu vana disain.
  const html = buildGiftCardHtml({
    ...input,
    qrSvg,
    logoUrl,
    parrotWmUrls,
  })

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage({
      viewport: { width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX },
      deviceScaleFactor: 1,
    })

    await page.setContent(html, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300) // kindlustame, et font/assetid on jõudnud renderduda

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

