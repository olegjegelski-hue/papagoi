export default function LocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee'
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Papagoi Keskus',
    description:
      'Eesti esimene Papagoi Keskus, mis tegutseb aastast 2015. Tule tutvuge meie värvilise perekonnaga ja koge midagi erilist!',
    image: `${normalizedBaseUrl}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tartu mnt 80, Soinaste',
      addressLocality: 'Kambja vald',
      addressRegion: 'Tartumaa',
      postalCode: '61709',
      addressCountry: 'EE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '58.2344',
      longitude: '26.7250',
    },
    telephone: '+3725127938',
    email: 'keskus@papagoi.ee',
    priceRange: '€€',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '12:00',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '177',
    },
    url: normalizedBaseUrl,
    sameAs: [
      'https://www.facebook.com/PapagoiKeskus',
      'https://www.instagram.com/papagoikeskus',
      'https://www.youtube.com/@PetsVillaTartu',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
