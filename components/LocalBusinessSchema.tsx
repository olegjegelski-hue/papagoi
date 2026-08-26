import { aggregateRatingFromPlace, fetchGooglePlaceDetails } from '@/lib/google-place-details'

export default async function LocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papagoi.ee'
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

  const place = await fetchGooglePlaceDetails()
  const aggregateRating = place.ok
    ? aggregateRatingFromPlace(place.data.rating, place.data.user_ratings_total)
    : null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Papagoi Keskus',
    description:
      'Eesti esimene Papagoi Keskus Tartus, alates 2015. Külastus broneerimisega, digitaalne kinkekaart, sünnipäevad ja grupikülastused. Üle 50 papagoi – tule tutvuge meie värvilise perekonnaga!',
    image: `${normalizedBaseUrl}/og/default.jpg`,
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
    ...(aggregateRating ? { aggregateRating } : {}),
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
