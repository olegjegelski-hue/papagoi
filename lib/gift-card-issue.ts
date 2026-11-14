import { sendGiftCardIssuedEmail } from '@/lib/email'
import { giftCardRedeemUrl, isGiftCardAlreadyIssued } from '@/lib/gift-card'
import { renderGiftCardToPngPdf } from '@/lib/gift-card-render'
import {
  setGiftCardQrUrl,
  type GiftCardDetails,
} from '@/lib/notion-gift-card-lookup'

export type IssueGiftCardResult = {
  alreadyIssued: boolean
  pageId: string
}

/**
 * PNG/PDF render + kiri ostjale + QR URL Notionisse.
 * Staatuse (Aktiivne) muudab webhook eraldi; admin-route jätab staatuse puutumata.
 */
export async function issueGiftCard(input: {
  notionApiKey: string
  details: GiftCardDetails
  force?: boolean
}): Promise<IssueGiftCardResult> {
  const qrUrl = giftCardRedeemUrl(input.details.code)

  if (!input.details.buyerEmail) {
    throw new Error('Gift card has no buyer email in Notion')
  }

  if (!input.force && isGiftCardAlreadyIssued(input.details)) {
    return { alreadyIssued: true, pageId: input.details.pageId }
  }

  const { pngBuffer, pdfBuffer } = await renderGiftCardToPngPdf({
    code: input.details.code,
    amountEur: input.details.amountEur,
    validUntil: input.details.validUntil,
    qrUrl,
  })

  await sendGiftCardIssuedEmail({
    to: input.details.buyerEmail,
    buyerName: input.details.buyerName,
    amountEur: input.details.amountEur,
    code: input.details.code,
    validUntil: input.details.validUntil,
    pngBuffer,
    pdfBuffer,
    qrUrl,
  })

  await setGiftCardQrUrl(input.notionApiKey, input.details.pageId, qrUrl)

  return { alreadyIssued: false, pageId: input.details.pageId }
}
