export default function TouristAttractionSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee'
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: 'Papagoi Keskus',
    description:
      'Eesti esimene papagoidekeskus üle 50 papagoiga. Giidiga ekskursioonid, fotod ja interaktiivne kogemus.',
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
    url: normalizedBaseUrl,
    telephone: '+3725127938',
    email: 'keskus@papagoi.ee',
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
    priceRange: '€€',
    touristType: ['Families', 'School groups', 'Animal lovers'],
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
