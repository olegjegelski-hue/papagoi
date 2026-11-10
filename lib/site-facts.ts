/**
 * Saidil juba olemasolevad faktid JSON-LD ja llms.txt jaoks.
 * Ära lisa siia numbreid ega väiteid, mida lehed / messages ei kinnita.
 */

import { VIP_PRICE_TIERS } from '@/lib/vip-visit'

export const SITE_NAME = 'Papagoi Keskus'
export const LEGAL_NAME = 'Papagoi Keskus MTÜ'
export const REG_CODE = '80647595'
export const PHONE = '+3725127938'
export const EMAIL = 'keskus@papagoi.ee'
export const PRICE_RANGE = '€€'

export const STREET_ADDRESS = 'Tartu mnt 80, Soinaste'
export const ADDRESS_LOCALITY = 'Kambja vald'
export const ADDRESS_REGION = 'Tartumaa'
export const POSTAL_CODE = '61709'
export const ADDRESS_COUNTRY = 'EE'

/** Google'i koht (place_id ChIJcxmPH0U360YRd-waH9S03r4). */
export const GEO_LATITUDE = 58.3345959
export const GEO_LONGITUDE = 26.7161083
export const GOOGLE_PLACE_ID = 'ChIJcxmPH0U360YRd-waH9S03r4'

/** Tartu kesklinnast (Oleg 10.11.2026; Kontakt, KKK, llms.txt). */
export const DISTANCE_FROM_TARTU_KM = 6
export const DRIVE_TIME_FROM_TARTU_MIN = 10
export const BUS_LINE = '7'
export const BUS_STOP = 'Vana-Linnaveere'

/** Kontakt-kaardi GPS-rida: 58.3346, 26.7161. */
export function formatGeoCoordinates(): string {
  return `${GEO_LATITUDE.toFixed(4)}, ${GEO_LONGITUDE.toFixed(4)}`
}

export const OPENS = '12:00'
export const CLOSES = '18:00'
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const AVAILABLE_LANGUAGES = ['Estonian', 'English', 'Russian'] as const

export const SAME_AS = [
  'https://www.facebook.com/PapagoiKeskus',
  'https://www.instagram.com/papagoikeskus',
  'https://www.youtube.com/@PetsVillaTartu',
] as const

/** Tavakülastus: 10 € / inimene (Hero, Teenused, Külastajatele). */
export const VISIT_PRICE_EUR = 10
/** Sünnipäev keskuses: 350 € (Teenused). */
export const BIRTHDAY_PRICE_EUR = 350
/** Kinkekaart: 10 € = 1 külastus. */
export const GIFT_CARD_UNIT_EUR = 10

export const POSTAL_ADDRESS = {
  '@type': 'PostalAddress' as const,
  streetAddress: STREET_ADDRESS,
  addressLocality: ADDRESS_LOCALITY,
  addressRegion: ADDRESS_REGION,
  postalCode: POSTAL_CODE,
  addressCountry: ADDRESS_COUNTRY,
}

export function googleMapsPlaceUrl(): string {
  return `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`
}

export function vipPriceBounds(): { low: number; high: number } {
  const prices = VIP_PRICE_TIERS.map((tier) => tier.price)
  return { low: Math.min(...prices), high: Math.max(...prices) }
}
