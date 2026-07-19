import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import GroupsHero from './_components/groups-hero'
import SchoolGroups from './_components/school-groups'
import CompanyGroups from './_components/company-groups'
import GroupBooking from './_components/group-booking'
import GroupPricing from './_components/group-pricing'
import { getSiteUrl, pageAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu ? 'Групповые программы - Центр попугаев в Тарту' : isEn ? 'Group programmes - Parrot Centre Tartu' : 'Grupid - Papagoi Keskus Tartus'
  const description = isRu
    ? 'Специальные программы для школ, компаний и частных мероприятий. Забронируйте групповой визит в Центр попугаев.'
    : isEn
      ? 'Special programmes for schools, companies and private events. Book a group visit to the Parrot Centre.'
      : 'Spetsiaalsed programmid koolidele, ettevõtetele ja eraüritustele. Broneeri grupikülastus Papagoi Keskusesse.'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    alternates: pageAlternates(locale, 'grupid'),
    openGraph: {
      title: isRu ? 'Групповые программы - Центр попугаев в Тарту' : isEn ? 'Group programmes - Parrot Centre Tartu' : 'Grupid - Papagoi Keskus Tartus',
      description: isRu ? 'Программы для школ, компаний и мероприятий.' : isEn ? 'Group programmes for schools, companies and events.' : 'Spetsiaalsed programmid gruppidele.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/grupid`,
      images: ['/logo.png'],
    },
  }
}

export default async function GrupidPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-papagoi-beige-50">
      <GroupsHero />
      <SchoolGroups />
      <CompanyGroups />
      <GroupBooking />
      <GroupPricing />
    </div>
  )
}
