import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react'
import ContactForm from './_components/contact-form'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

function getSiteUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu ? 'Контакты - Центр попугаев в Тарту | Бронирование и подарочная карта' : isEn ? 'Contact - Parrot Centre Tartu | Book or buy a gift card' : 'Kontakt - Papagoi Keskus Tartus | Broneeri või osta kinkekaart'
  const description = isRu
    ? 'Свяжитесь с Центром попугаев: +372 512 7938, keskus@papagoi.ee. Адрес: Tartu mnt 80, Soinaste. Забронируйте визит или купите подарочную карту. Ответим в течение 24 ч!'
    : isEn
      ? 'Contact the Parrot Centre: +372 512 7938, keskus@papagoi.ee. Address: Tartu mnt 80, Soinaste. Book a visit or buy a gift card. We reply within 24h!'
      : 'Võta ühendust Papagoi Keskusega: +372 512 7938, keskus@papagoi.ee. Aadress: Tartu mnt 80, Soinaste. Broneeri külastus või osta kinkekaart. Vastame 24h jooksul!'
  const keywords = isRu
    ? 'Центр попугаев контакт, забронировать визит Тарту, подарочная карта, телефон, адрес'
    : isEn
      ? 'Parrot Centre contact, book visit Tartu, gift card, Parrot Centre phone, Parrot Centre address'
      : 'Papagoi Keskus kontakt, broneeri külastus Tartus, kinkekaart, Papagoi Keskus telefon, Papagoi Keskus aadress, papagoidekeskus Tartus'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `${base}/${locale}/kontakt` },
    openGraph: {
      title: isRu ? 'Контакты - Центр попугаев в Тарту' : isEn ? 'Contact - Parrot Centre Tartu' : 'Kontakt - Papagoi Keskus Tartus',
      description: isRu ? 'Свяжитесь с Центром попугаев в Тарту. Контакты и информация о бронировании.' : isEn ? 'Get in touch with the Parrot Centre in Tartu. Contact details and booking info.' : 'Võtke Papagoi Keskusega ühendust Tartus. Kontaktandmed ja broneerimisinfo.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/kontakt`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title: isRu ? 'Контакты - Центр попугаев в Тарту' : isEn ? 'Contact - Parrot Centre Tartu' : 'Kontakt - Papagoi Keskus Tartus',
      description: isRu ? 'Свяжитесь с Центром попугаев в Тарту.' : isEn ? 'Get in touch with the Parrot Centre in Tartu.' : 'Võtke Papagoi Keskusega ühendust Tartus. Kontaktandmed ja broneerimisinfo.',
      images: ['/logo.png'],
    },
  }
}

const faqKeys = [
  { q: 'faqWhere', a: 'faqWhereA' },
  { q: 'faqNoBooking', a: 'faqNoBookingA' },
  { q: 'faqDuration', a: 'faqDurationA' },
  { q: 'faqFeed', a: 'faqFeedA' },
  { q: 'faqKids', a: 'faqKidsA' },
  { q: 'faqCancel', a: 'faqCancelA' },
] as const

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('KontaktPage')
  const baseUrl = getSiteUrl()
  const faqs = faqKeys.map(({ q, a }) => ({ question: t(q), answer: t(a) }))
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${baseUrl}/${locale}/kontakt` },
  }

  return (
    <div className="min-h-screen bg-papagoi-beige-50 pt-12 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">{t('title')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('intro')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
            <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">{t('contactDetails')}</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-papagoi-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-papagoi-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{t('phone')}</h3>
                    <a href="tel:+3725127938" className="text-gray-600 hover:text-papagoi-green transition-colors mb-2 block font-medium">
                      +372 512 7938
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-papagoi-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-papagoi-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{t('email')}</h3>
                    <a href="mailto:keskus@papagoi.ee" className="text-gray-600 hover:text-papagoi-blue transition-colors mb-2 block font-medium">
                      keskus@papagoi.ee
                    </a>
                    <p className="text-sm text-gray-500">{t('reply24h')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-papagoi-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-papagoi-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{t('location')}</h3>
                    <div className="text-gray-600 mb-2">
                      <div>Tartu mnt 80, Soinaste</div>
                      <div>Kambja vald, Tartumaa</div>
                      <div>61709, Eesti</div>
                    </div>
                    <a
                      href="https://maps.google.com/?q=Tartu+mnt+80,+Soinaste,+Kambja+vald,+Tartumaa+61709,+Eesti"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-papagoi-orange hover:text-papagoi-orange-600 transition-colors font-medium"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {t('viewOnGoogleMaps')}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-papagoi-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-papagoi-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{t('openingHours')}</h3>
                    <p className="text-gray-600 mb-2">{t('openingHoursValue')}</p>
                    <p className="text-sm text-gray-500">{t('openingHoursNote')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>

        <div className="mb-16">
          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-4 text-center">{t('quickActions')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/broneeri"
                className="flex items-center justify-center bg-white/20 rounded-2xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="text-center">
                  <p className="font-semibold">{t('bookVisit')}</p>
                  <p className="text-xs opacity-80">{t('bookVisitDesc')}</p>
                </div>
              </Link>
              <a
                href="#faqs"
                className="flex items-center justify-center bg-white/20 rounded-2xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="text-center">
                  <p className="font-semibold">{t('viewFaq')}</p>
                  <p className="text-xs opacity-80">{t('viewFaqDesc')}</p>
                </div>
              </a>
              <Link
                href="/kulastajatele"
                className="flex items-center justify-center bg-white/20 rounded-2xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="text-center">
                  <p className="font-semibold">{t('visitorInfo')}</p>
                  <p className="text-xs opacity-80">{t('visitorInfoDesc')}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{t('followUs')}</h2>
          <div className="flex justify-center space-x-8">
            <a
              href="https://www.facebook.com/PapagoiKeskus"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-papagoi-beige-100 hover:bg-papagoi-blue-50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-[#1877F2] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-papagoi-blue">Facebook</h3>
                <p className="text-sm text-gray-500">{t('facebookNews')}</p>
              </div>
            </a>
            <a
              href="https://www.instagram.com/papagoikeskus"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-papagoi-beige-100 hover:bg-papagoi-orange-50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-papagoi-orange">Instagram</h3>
                <p className="text-sm text-gray-500">{t('instagramDaily')}</p>
              </div>
            </a>
            <a
              href="https://www.youtube.com/@PetsVillaTartu"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-papagoi-beige-100 hover:bg-papagoi-red-50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-papagoi-red">YouTube</h3>
                <p className="text-sm text-gray-500">{t('youtubeVideos')}</p>
              </div>
            </a>
          </div>
        </div>

        <div id="faqs" className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t('faqTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
