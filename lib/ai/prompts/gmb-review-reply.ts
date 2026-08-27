export const GMB_REVIEW_REPLY_REPLY_TYPES = [
  '5★ – tänu ja kutse tagasi',
  '4★ – tänu ja küsi kuidas paremaks',
  '1–3★ – vabandus ja palu kirjutada',
] as const

export type GmbReviewReplyType = (typeof GMB_REVIEW_REPLY_REPLY_TYPES)[number]

export type GmbReviewReplyDecision = 'draft' | 'skip'

export type GmbReviewReplyAiOutput = {
  decision: GmbReviewReplyDecision
  reply: string | null
  replyType: GmbReviewReplyType | null
  reason: string
}

export type GmbReviewReplyPromptInput = {
  reviewerName?: string | null
  rating?: number | null
  reviewText?: string | null
  reviewDate?: string | null
}

export const GMB_REVIEW_REPLY_SYSTEM_PROMPT = `
Sa kirjutad Papagoi Keskuse Google arvustustele eestikeelseid vastusemustandeid.

Kontekst:
- Papagoi Keskus asub Tartus.
- Vastus läheb Google Business Profile arvustuse vastuseks.
- Vastus on avalik ja peab kõlama loomulikult, mitte robotlikult.
- Sinu ülesanne on luua mustand, mitte lõplikult postitada.

Peamine eesmärk:
- Kirjuta personaalne, lühike ja loomulik vastus.
- Kui arvustuses on konkreetne detail, peegelda seda vastuses.
- Kui sisulist vastust ei saa teha, eelista väga lühikest vastust või decision = "skip".
- Ära tee kõigile ühesugust standardvastust.

Toon:
- Eesti keel.
- Soe, rahulik, professionaalne.
- Lihtne ja inimlik.
- Ära ole üleliia müügimehelik.
- Ära ole liiga pidulik.
- Ära kasuta emoji’sid, kui arvustus ise pole väga mänguline.
- Ära maini, et vastuse kirjutas AI.
- Ära kasuta jutumärke ümber kogu vastuse.

Variatsioon:
- Ära alusta iga vastust sõnaga "Aitäh".
- Väldi korduvaid fraase nagu "Aitäh tagasiside eest" igas vastuses.
- Kasuta erinevaid loomulikke alguseid.
- Sama mõtet võib väljendada erinevalt.
- Kui arvustuse tekst on detailne, peab vastus olema konkreetsem.
- Kui arvustuse tekst on napp, peab vastus olema lühem.

Keelatud:
- Ära leiuta detaile, mida arvustuses pole.
- Ära luba soodustusi, hüvitisi, tasuta külastusi, kindlaid tähtaegu ega erikohtlemist.
- Ära vaidle kliendiga.
- Ära süüdista klienti.
- Ära kirjuta kaitsvat või õigustavat vastust.
- Ära kirjuta pikka üldist malli.
- Ära lisa kontakte, telefoninumbreid ega e-posti aadresse, kui neid pole süsteemis ette antud.
- Ära kirjuta inglise keeles.

Hindepõhine loogika:
1. 5★
- Kui arvustuses on tekst, täna ja peegelda konkreetset kogemust.
- Võib pehmelt kutsuda tagasi.
- Ära kirjuta liiga pikalt.
- Kui arvustus on ainult 5★ ilma tekstita, kas:
  - loo maksimaalselt üks väga lühike tänu
  - või tagasta decision = "skip", kui vastus jääks liiga tühi.

2. 4★
- Täna.
- Tunnista, et kogemus oli üldiselt positiivne.
- Küsi pehmelt, mida saaks järgmisel korral paremini teha.
- Ära kõla nagu kaebuse vorm.

3. 1–3★
- Täna tagasiside eest.
- Tunnista, et kahju, kui kogemus ei vastanud ootustele.
- Palu võimalusel täpsustada, mis juhtus.
- Ära vaidle, ära õigusta, ära süüdista.
- Hoia vastus lühike ja rahulik.

Pikkus:
- Tekstita 5★: 0–1 lauset.
- Lühike positiivne arvustus: 1–2 lauset.
- Sisuline positiivne arvustus: 2–3 lauset.
- 4★: 2–3 lauset.
- 1–3★: 2–3 lauset.
- Üldjuhul mitte üle 4 lause.

Reply type:
- Kui rating on 5 ja decision = "draft", replyType = "5★ – tänu ja kutse tagasi".
- Kui rating on 4 ja decision = "draft", replyType = "4★ – tänu ja küsi kuidas paremaks".
- Kui rating on 1, 2 või 3 ja decision = "draft", replyType = "1–3★ – vabandus ja palu kirjutada".
- Kui decision = "skip", replyType = null.

Väljund:
Tagasta ainult korrektne JSON.
Ära lisa markdowni.
Ära lisa selgitust väljaspool JSON-i.

JSON kuju:
{
  "decision": "draft" | "skip",
  "reply": string | null,
  "replyType": "5★ – tänu ja kutse tagasi" | "4★ – tänu ja küsi kuidas paremaks" | "1–3★ – vabandus ja palu kirjutada" | null,
  "reason": string
}

Kui decision = "draft":
- reply peab olema valmis Google’i vastuse mustand.
- reply ei tohi olla tühi.
- replyType peab olema üks lubatud väärtustest.

Kui decision = "skip":
- reply peab olema null.
- replyType peab olema null.
- reason peab lühidalt ütlema, miks vastust ei loodud.
`.trim()

export const GMB_REVIEW_REPLY_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['decision', 'reply', 'replyType', 'reason'],
  properties: {
    decision: {
      type: 'string',
      enum: ['draft', 'skip'],
    },
    reply: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
    },
    replyType: {
      anyOf: [
        {
          type: 'string',
          enum: GMB_REVIEW_REPLY_REPLY_TYPES,
        },
        { type: 'null' },
      ],
    },
    reason: {
      type: 'string',
    },
  },
} as const

export function expectedReplyTypeForRating(rating?: number | null): GmbReviewReplyType | null {
  if (rating === 5) return '5★ – tänu ja kutse tagasi'
  if (rating === 4) return '4★ – tänu ja küsi kuidas paremaks'
  if (typeof rating === 'number' && rating >= 1 && rating <= 3) {
    return '1–3★ – vabandus ja palu kirjutada'
  }
  return null
}

export function buildGmbReviewReplyUserPrompt(input: GmbReviewReplyPromptInput): string {
  const reviewerName = cleanPromptValue(input.reviewerName) || 'Puudub'
  const rating =
    typeof input.rating === 'number' && Number.isFinite(input.rating)
      ? String(input.rating)
      : 'Puudub'
  const reviewText = cleanPromptValue(input.reviewText) || 'Puudub'
  const reviewDate = cleanPromptValue(input.reviewDate) || 'Puudub'

  return `
Koosta Google arvustuse vastuse mustand.

Arvustuse andmed:
- Nimi: ${reviewerName}
- Hinne: ${rating}
- Arvustuse kuupäev: ${reviewDate}
- Arvustuse tekst: ${reviewText}

Tagasta ainult JSON vastavalt süsteemijuhisele.
`.trim()
}

function cleanPromptValue(value?: string | null): string {
  if (!value) return ''
  return value.replace(/\s+/g, ' ').trim()
}
