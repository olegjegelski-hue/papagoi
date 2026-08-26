import { getSiteUrl } from '@/lib/seo'

const SAME_AS = [
  'https://www.facebook.com/PapagoiKeskus',
  'https://www.instagram.com/papagoikeskus',
  'https://www.youtube.com/@PetsVillaTartu',
]

const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Tartu mnt 80, Soinaste',
  addressLocality: 'Kambja vald',
  addressRegion: 'Tartumaa',
  postalCode: '61709',
  addressCountry: 'EE',
}

export default function OrganizationSchema() {
  const base = getSiteUrl()
  const organizationId = `${base}/#organization`
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'Papagoi Keskus',
        legalName: 'Koduinfo OÜ',
        identifier: {
          '@type': 'PropertyValue',
          name: 'Registrikood',
          value: '11105156',
        },
        url: base,
        logo: {
          '@type': 'ImageObject',
          url: `${base}/logo.png`,
        },
        email: 'keskus@papagoi.ee',
        telephone: '+3725127938',
        address: ADDRESS,
        sameAs: SAME_AS,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+3725127938',
          email: 'keskus@papagoi.ee',
          contactType: 'customer service',
          areaServed: 'EE',
          availableLanguage: ['Estonian', 'English', 'Russian'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: 'Papagoi Keskus',
        inLanguage: ['et', 'en', 'ru'],
        publisher: { '@id': organizationId },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
