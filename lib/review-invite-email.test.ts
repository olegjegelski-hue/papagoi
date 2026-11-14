import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildReviewInviteEmail } from './email'
import {
  reviewDonateVariant,
  reviewFundingVariant,
  reviewInviteBoxKind,
  shouldShowReviewDonationLine,
} from './email-i18n'
import { buildReviewCronSummaryContent } from '../scripts/send-review-invites'

describe('review invite group-type variants', () => {
  it('Perevisit / Muu / VIP → annetus + A (lapsevanem)', () => {
    for (const groupType of ['Perevisit', 'perevisit', 'Muu', 'muu', 'VIP külastus', 'vip-kulastus']) {
      assert.equal(shouldShowReviewDonationLine(groupType), true, groupType)
      assert.equal(reviewDonateVariant(groupType), 'default', groupType)
      assert.equal(reviewFundingVariant(groupType), 'parent', groupType)
      assert.equal(reviewInviteBoxKind(groupType), 'parent', groupType)
    }
  })

  it('Kool/Lasteaed → ilma annetuseta + B (õpetaja)', () => {
    for (const groupType of ['Kool/Lasteaed', 'kool']) {
      assert.equal(shouldShowReviewDonationLine(groupType), false, groupType)
      assert.equal(reviewDonateVariant(groupType), null, groupType)
      assert.equal(reviewFundingVariant(groupType), 'school', groupType)
      assert.equal(reviewInviteBoxKind(groupType), 'school', groupType)
    }
  })

  it('Ettevõte → annetuse tekst C, ilma toetuste reata', () => {
    for (const groupType of ['Ettevõte', 'ettevote']) {
      assert.equal(shouldShowReviewDonationLine(groupType), true, groupType)
      assert.equal(reviewDonateVariant(groupType), 'company', groupType)
      assert.equal(reviewFundingVariant(groupType), null, groupType)
      assert.equal(reviewInviteBoxKind(groupType), 'company', groupType)
    }
  })

  it('tühi / teadmata → ei annetust ega toetuste rida', () => {
    for (const groupType of [undefined, null, '', '   ']) {
      assert.equal(shouldShowReviewDonationLine(groupType), false, String(groupType))
      assert.equal(reviewDonateVariant(groupType), null, String(groupType))
      assert.equal(reviewFundingVariant(groupType), null, String(groupType))
      assert.equal(reviewInviteBoxKind(groupType), 'plain', String(groupType))
    }
  })
})

describe('buildReviewInviteEmail copy by group type', () => {
  it('ET Perevisit: tavaline annetus + lapsevanema rida', () => {
    const built = buildReviewInviteEmail({ name: 'Mari', locale: 'et', groupType: 'Perevisit' })
    assert.equal(built.showDonation, true)
    assert.equal(built.fundingVariant, 'parent')
    assert.equal(built.donateVariant, 'default')
    assert.match(built.html, /annetusega/)
    assert.match(built.html, /Annetada saab mugavalt pangalingiga/)
    assert.match(built.text, /Annetada saab mugavalt pangalingiga/)
    assert.match(built.html, /Tuleks teie lapse klassiga\?/)
    assert.match(built.html, /https:\/\/papagoi\.ee\/et\/toetused/)
    assert.doesNotMatch(built.html, /Järgmisel korral:/)
    assert.doesNotMatch(built.html, /kinkige külastus mõnele lasteaiarühmale/)
    assert.match(built.text, /Tuleks teie lapse klassiga\?/)
    assert.match(built.text, /https:\/\/papagoi\.ee\/et\/toetused/)
    assert.match(built.html, /Kinkekaardiga/)
  })

  it('ET Kool/Lasteaed: kinkekaart + õpetaja rida, ilma annetuseta', () => {
    const built = buildReviewInviteEmail({
      name: 'Õpetaja',
      locale: 'et',
      groupType: 'Kool/Lasteaed',
    })
    assert.equal(built.showDonation, false)
    assert.equal(built.fundingVariant, 'school')
    assert.equal(built.donateVariant, null)
    assert.match(built.html, /Järgmisel korral:/)
    assert.match(built.html, /Kuidas see käib/)
    assert.doesNotMatch(built.html, /annetusega/)
    assert.doesNotMatch(built.html, /#anneta/)
    assert.match(built.html, /Kinkekaardiga/)
  })

  it('ET Ettevõte: ettevõtte annetuse tekst, ilma A/B reata', () => {
    const built = buildReviewInviteEmail({
      name: 'Firma',
      locale: 'et',
      groupType: 'Ettevõte',
    })
    assert.equal(built.showDonation, true)
    assert.equal(built.fundingVariant, null)
    assert.equal(built.donateVariant, 'company')
    assert.match(built.html, /kinkige külastus mõnele lasteaiarühmale/)
    assert.match(built.html, /toetused#anneta/)
    assert.doesNotMatch(built.html, /Tuleks teie lapse klassiga\?/)
    assert.doesNotMatch(built.html, /Järgmisel korral:/)
    assert.doesNotMatch(built.html, /Toetada saab ka lindude toitu/)
    assert.doesNotMatch(built.html, /pangalingiga/)
    assert.doesNotMatch(built.text, /pangalingiga/)
  })

  it('ET tühi: ainult kinkekaart', () => {
    const built = buildReviewInviteEmail({ name: null, locale: 'et', groupType: null })
    assert.equal(built.showDonation, false)
    assert.equal(built.fundingVariant, null)
    assert.equal(built.donateVariant, null)
    assert.match(built.html, /Kinkekaardiga/)
    assert.doesNotMatch(built.html, /annetusega/)
    assert.doesNotMatch(built.html, /Kultuuriranits/)
    assert.doesNotMatch(built.html, /#anneta/)
  })

  it('EN/RU parent ja school read on keeles', () => {
    const enParent = buildReviewInviteEmail({
      name: 'Sam',
      locale: 'en',
      groupType: 'perevisit',
    })
    assert.match(enParent.html, /Coming back with your child’s class\?/)
    assert.match(enParent.html, /https:\/\/papagoi\.ee\/en\/toetused/)
    const ruSchool = buildReviewInviteEmail({
      name: 'Анна',
      locale: 'ru',
      groupType: 'kool',
    })
    assert.match(ruSchool.html, /В следующий раз:/)
    assert.match(ruSchool.html, /https:\/\/papagoi\.ee\/ru\/toetused/)
    const enCompany = buildReviewInviteEmail({
      name: 'Acme',
      locale: 'en',
      groupType: 'ettevote',
    })
    assert.match(enCompany.html, /gift a visit to a kindergarten group/)
  })
})

describe('buildReviewCronSummaryContent variants', () => {
  it('näitab A/B/C/tühja kirja eraldi, mitte ainult annetuse jah/ei järgi', () => {
    const { html, text } = buildReviewCronSummaryContent({
      visitsCount: 4,
      uniqueEmailsCount: 4,
      sentCount: 4,
      errorCount: 0,
      dryRun: false,
      nowLabel: '14.11.2026 12:00',
      recipients: [
        {
          name: 'Mari',
          email: 'mari@example.com',
          locale: 'et',
          groupType: 'Perevisit',
          showDonation: true,
          fundingVariant: 'parent',
          donateVariant: 'default',
        },
        {
          name: 'Kool',
          email: 'kool@example.com',
          locale: 'et',
          groupType: 'Kool/Lasteaed',
          showDonation: false,
          fundingVariant: 'school',
          donateVariant: null,
        },
        {
          name: 'Firma',
          email: 'firma@example.com',
          locale: 'et',
          groupType: 'Ettevõte',
          showDonation: true,
          fundingVariant: null,
          donateVariant: 'company',
        },
        {
          name: 'Tundmatu',
          email: 'x@example.com',
          locale: 'et',
          groupType: null,
          showDonation: false,
          fundingVariant: null,
          donateVariant: null,
        },
      ],
    })

    assert.match(text, /toetuste rida lapsevanemale/)
    assert.match(text, /toetuste rida õpetajale/)
    assert.match(text, /ettevõtte annetuse reaga/)
    assert.match(text, /ilma annetuseta · 1 kirja/)
    assert.match(html, /Tuleks teie lapse klassiga\?/)
    assert.match(html, /Järgmisel korral:/)
    assert.match(html, /kinkige külastus mõnele lasteaiarühmale/)
    assert.match(text, /toetuste rida: lapsevanem/)
    assert.match(text, /toetuste rida: õpetaja/)
  })
})
