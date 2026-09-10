/**
 * Avalehe koostööpartnerid.
 *
 * Uue partneri lisamine: lisa kirje massiivi + kirjuta heading/lead
 * ümber messages/{et,en,ru}.json-is samas commitis. Nimi, URL ja logo ainult siin.
 *
 * Ühe partneri logo paigutus — muuda ainult järgmist rida:
 */
export const HOME_PARTNER_LOGO_LAYOUT: 'both-sides' | 'center' = 'center'

export type SitePartner = {
  id: string
  name: string
  href: string
  logoSrc: string
  logoWidth: number
  logoHeight: number
}

export const HOME_PARTNERS: readonly SitePartner[] = [
  {
    id: 'gruneFee',
    name: 'Grüne Fee',
    href: 'https://grynefee.ee',
    logoSrc: '/partners/grune-fee.png',
    logoWidth: 1200,
    logoHeight: 687,
  },
]
