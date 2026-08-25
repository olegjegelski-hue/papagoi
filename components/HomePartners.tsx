import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import {
  HOME_PARTNER_LOGO_LAYOUT,
  HOME_PARTNERS,
  type SitePartner,
} from '@/lib/partners'

const LOGO_CLASS = 'h-16 w-auto'

function PartnerLogo({ partner }: { partner: SitePartner }) {
  return (
    <a
      href={partner.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      aria-hidden="true"
      tabIndex={-1}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded transition-transform duration-300 hover:scale-[1.02]"
    >
      <Image
        src={partner.logoSrc}
        alt=""
        width={partner.logoWidth}
        height={partner.logoHeight}
        className={LOGO_CLASS}
        sizes="99px"
      />
    </a>
  )
}

function PartnerCopy({ partner, lead }: { partner: SitePartner; lead: string }) {
  return (
    <div className="text-center">
      <p className="text-gray-700 leading-relaxed">{lead}</p>
      <a
        href={partner.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-papagoi-green underline underline-offset-2 hover:text-papagoi-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-papagoi-green/50 rounded-sm"
      >
        {partner.name}
      </a>
    </div>
  )
}

/** Koostööpartneri kaart — sama vorm kui „Papagoide müük“, brändi roheline/sinine. */
export default async function HomePartners() {
  const t = await getTranslations('Home.partner')
  const partners = HOME_PARTNERS
  const primary = partners[0]
  if (!primary) return null

  const bothSides =
    HOME_PARTNER_LOGO_LAYOUT === 'both-sides' && partners.length === 1
  const lead = t('lead')

  return (
    <section className="mx-4 mt-8 mb-16 overflow-hidden rounded-2xl border border-papagoi-beige-200 bg-papagoi-beige-100 shadow-2xl sm:mx-6 lg:mx-8">
      <div className="bg-gradient-to-r from-papagoi-green-600 to-papagoi-blue-600 p-8 text-center text-white">
        <h2 className="text-3xl font-bold md:text-4xl">{t('heading')}</h2>
      </div>
      <div className="p-8">
        <div className="rounded-xl border border-papagoi-green/20 bg-gradient-to-br from-papagoi-green-50 to-papagoi-blue-50 p-8">
          {partners.length === 1 ? (
            <div
              className={
                bothSides
                  ? 'flex flex-col items-center gap-6 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-8'
                  : 'flex flex-col items-center gap-6'
              }
            >
              <div className="flex justify-center">
                <PartnerLogo partner={primary} />
              </div>
              <PartnerCopy partner={primary} lead={lead} />
              {bothSides ? (
                <div className="hidden justify-center md:flex">
                  <PartnerLogo partner={primary} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <PartnerCopy partner={primary} lead={lead} />
              <ul className="flex flex-wrap items-center justify-center gap-8">
                {partners.map((partner) => (
                  <li key={partner.id}>
                    <PartnerLogo partner={partner} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
