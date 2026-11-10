import type { SchemaAggregateRating } from '@/lib/google-place-details'
import {
  ADDRESS_COUNTRY,
  AVAILABLE_LANGUAGES,
  BIRTHDAY_PRICE_EUR,
  CLOSES,
  DAYS_OF_WEEK,
  EMAIL,
  GEO_LATITUDE,
  GEO_LONGITUDE,
  GIFT_CARD_UNIT_EUR,
  LEGAL_NAME,
  OPENS,
  PHONE,
  POSTAL_ADDRESS,
  PRICE_RANGE,
  REG_CODE,
  SAME_AS,
  SITE_NAME,
  VISIT_PRICE_EUR,
  googleMapsPlaceUrl,
  vipPriceBounds,
} from '@/lib/site-facts'
import { VIP_PRICE_TIERS } from '@/lib/vip-visit'

const BUSINESS_DESCRIPTION =
  'Eesti esimene Papagoi Keskus Tartu lähedal Soinastes, alates 2015. Üle 50 papagoi. Külastus ainult broneerimisega. Digitaalne kinkekaart, sünnipäevad ja grupikülastused.'

function localePath(base: string, locale: string, path: string): string {
  const clean = path.replace(/^\//, '')
  return `${base}/${locale}/${clean}`
}

export function jsonLdId(base: string, fragment: 'business' | 'organization' | 'website'): string {
  return `${base.replace(/\/$/, '')}/#${fragment}`
}

function vipTierOffers() {
  return VIP_PRICE_TIERS.map((tier) => ({
    '@type': 'Offer',
    name: `VIP külastus ${tier.min}–${tier.max} inimest`,
    price: String(tier.price),
    priceCurrency: 'EUR',
    eligibleQuantity: {
      '@type': 'QuantitativeValue',
      minValue: tier.min,
      maxValue: tier.max,
    },
  }))
}

function makesOffer(base: string) {
  const vip = vipPriceBounds()
  return [
    {
      '@type': 'Offer',
      name: 'Külastus Papagoi Keskuses',
      description: `Tavakülastus ${VISIT_PRICE_EUR} € inimese kohta. Ainult broneerimisega, minimaalselt 3 inimest.`,
      price: String(VISIT_PRICE_EUR),
      priceCurrency: 'EUR',
      url: localePath(base, 'et', 'broneeri'),
    },
    {
      '@type': 'Offer',
      name: 'Sünnipäev Papagoi Keskuses',
      description: `2,5-tunnine sünnipäevaprogramm papagoidega. Hind ${BIRTHDAY_PRICE_EUR} €.`,
      price: String(BIRTHDAY_PRICE_EUR),
      priceCurrency: 'EUR',
      url: localePath(base, 'et', 'teenused'),
    },
    {
      '@type': 'AggregateOffer',
      name: 'VIP külastus',
      description:
        'Privaatne külastus 1–20 inimesele, kestus 45–60 min. Hinnaastmed inimeste arvu järgi.',
      lowPrice: String(vip.low),
      highPrice: String(vip.high),
      priceCurrency: 'EUR',
      offerCount: String(VIP_PRICE_TIERS.length),
      url: localePath(base, 'et', 'teenused'),
      offers: vipTierOffers(),
    },
    {
      '@type': 'Offer',
      name: 'Papagoi Keskuse kinkekaart',
      description: `${GIFT_CARD_UNIT_EUR} € = 1 külastus. Digitaalne kinkekaart.`,
      price: String(GIFT_CARD_UNIT_EUR),
      priceCurrency: 'EUR',
      url: localePath(base, 'et', 'kinkekaart'),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(GIFT_CARD_UNIT_EUR),
        priceCurrency: 'EUR',
        unitText: 'külastus',
      },
    },
  ]
}

export function localBusinessEntities(graph: { '@graph'?: unknown[] }): unknown[] {
  const nodes = Array.isArray(graph['@graph']) ? graph['@graph'] : []
  return nodes.filter((node) => {
    if (!node || typeof node !== 'object') return false
    const type = (node as { '@type'?: unknown })['@type']
    if (type === 'LocalBusiness') return true
    return Array.isArray(type) && type.includes('LocalBusiness')
  })
}

export function buildSiteJsonLdGraph(
  baseUrl: string,
  aggregateRating: SchemaAggregateRating | null,
) {
  const base = baseUrl.replace(/\/$/, '')
  const bizId = jsonLdId(base, 'business')
  const orgId = jsonLdId(base, 'organization')
  const webId = jsonLdId(base, 'website')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'TouristAttraction', 'Zoo'],
        '@id': bizId,
        name: SITE_NAME,
        legalName: LEGAL_NAME,
        description: BUSINESS_DESCRIPTION,
        image: `${base}/og/default.jpg`,
        url: base,
        telephone: PHONE,
        email: EMAIL,
        priceRange: PRICE_RANGE,
        address: POSTAL_ADDRESS,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: GEO_LATITUDE,
          longitude: GEO_LONGITUDE,
        },
        hasMap: googleMapsPlaceUrl(),
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [...DAYS_OF_WEEK],
            opens: OPENS,
            closes: CLOSES,
          },
        ],
        availableLanguage: [...AVAILABLE_LANGUAGES],
        knowsLanguage: [...AVAILABLE_LANGUAGES],
        touristType: ['Families', 'School groups', 'Animal lovers'],
        parentOrganization: { '@id': orgId },
        publisher: { '@id': orgId },
        makesOffer: makesOffer(base),
        sameAs: [...SAME_AS],
        ...(aggregateRating ? { aggregateRating } : {}),
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        legalName: LEGAL_NAME,
        identifier: {
          '@type': 'PropertyValue',
          name: 'Registrikood',
          value: REG_CODE,
        },
        url: base,
        logo: {
          '@type': 'ImageObject',
          url: `${base}/logo.png`,
        },
        email: EMAIL,
        telephone: PHONE,
        address: POSTAL_ADDRESS,
        sameAs: [...SAME_AS],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: PHONE,
          email: EMAIL,
          contactType: 'customer service',
          areaServed: ADDRESS_COUNTRY,
          availableLanguage: [...AVAILABLE_LANGUAGES],
        },
      },
      {
        '@type': 'WebSite',
        '@id': webId,
        url: base,
        name: SITE_NAME,
        inLanguage: ['et', 'en', 'ru'],
        publisher: { '@id': orgId },
        about: { '@id': bizId },
      },
    ],
  }
}
