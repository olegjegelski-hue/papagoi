import { getSiteUrl } from '@/lib/seo'

type Crumb = {
  name: string
  path: string
}

const HOME_NAME: Record<string, string> = {
  et: 'Avaleht',
  en: 'Home',
  ru: 'Главная',
}

export default function BreadcrumbJsonLd({
  locale,
  items,
}: {
  locale: string
  items: Crumb[]
}) {
  const base = getSiteUrl()
  const home = `${base}/${locale}`
  const list = [
    { name: HOME_NAME[locale] ?? HOME_NAME.et, item: home },
    ...items.map((crumb) => ({
      name: crumb.name,
      item: `${base}/${locale}/${crumb.path.replace(/^\//, '')}`,
    })),
  ]
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
