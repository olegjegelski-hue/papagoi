import { Heart, Gift, Calendar, Camera, Users, Phone, Mail, Check, Star } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getSiteUrl, pageAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

type BenefitItem = {
  title: string
  description: string
  details: string[]
}

type TierItem = {
  name: string
  species: string[]
  monthlyAmount: string
  benefits: string[]
  popular: boolean
}

type FaqItem = {
  question: string
  answer: string
}

type StepItem = {
  title: string
  description: string
}

const benefitIcons = [Heart, Calendar, Camera, Gift, Users, Star]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu
    ? 'Программа крёстных - Центр попугаев в Тарту'
    : isEn
      ? 'Sponsor programme - Parrot Centre Tartu'
      : 'Ristiisa Programm - Papagoi Keskus Tartus'
  const description = isRu
    ? 'Станьте крёстным нашего попугая! Поддержите символически любимца и участвуйте в его повседневной жизни.'
    : isEn
      ? 'Become a sponsor of our parrot! Support your favourite bird and take part in its everyday life with quarterly private meetings.'
      : 'Hakka meie papagoi ristiisaks! Toeta sümboolselt oma lemmikpapagoid ja saa osa tema igapäevaelust kvartaalsete privaatsete kohtumistega. Või kingi kinkekaart külastuseks.'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'

  return {
    title,
    description,
    keywords: isRu
      ? 'программа крёстных, попугай, Центр попугаев'
      : isEn
        ? 'sponsor programme, parrot sponsor, Parrot Centre Tartu'
        : 'ristiisa programm, papagoi ristiisa, Papagoi Keskus, toeta papagoid, papagoid Tartus',
    alternates: pageAlternates(locale, 'ristiisa-programm'),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/ristiisa-programm`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/logo.png'],
    },
  }
}

export default async function SponsorshipProgramPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('RistiisaPage')
  const baseUrl = getSiteUrl()

  const benefits = t.raw('benefits') as BenefitItem[]
  const sponsorshipTiers = t.raw('tiers') as TierItem[]
  const faqItems = t.raw('faq') as FaqItem[]
  const steps = t.raw('steps') as StepItem[]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${locale}/ristiisa-programm`,
    },
  }

  return (
    <div className="min-h-screen bg-papagoi-beige-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Hero Section */}
      <section className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{t('title')}</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t('intro')}
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index] ?? Heart
              return (
                <div key={index} className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 mb-6">{benefit.description}</p>
                  <ul className="space-y-2">
                    {benefit.details.map((detail, i) => (
                      <li key={i} className="flex items-center space-x-3 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {t('tiersTitle')} <span className="text-blue-600">{t('tiersTitleHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('tiersIntro')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sponsorshipTiers.map((tier, index) => (
              <div key={index} className={`relative bg-card text-card-foreground border rounded-3xl shadow-2xl p-8 transition-all duration-300 transform hover:scale-105 ${
                tier.popular ? 'ring-4 ring-blue-500 scale-110' : ''
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {t('popularBadge')}
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-green-600 mb-4">{tier.monthlyAmount}</div>
                  <p className="text-gray-600">{t('perMonth')}</p>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-3">{t('suitableFor')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {tier.species.map((species, i) => (
                      <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {species}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">{t('tierBenefits')}</h4>
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transform hover:scale-105'
                    : 'bg-papagoi-beige-100 text-gray-800 hover:bg-papagoi-beige-200'
                }`}>
                  {t('selectTier')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {t('howTitle')} <span className="text-purple-600">{t('howTitleHighlight')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const gradients = [
                'from-green-500 to-blue-500',
                'from-blue-500 to-purple-500',
                'from-purple-500 to-pink-500',
                'from-pink-500 to-red-500',
              ]
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${gradients[index]} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-papagoi-beige-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {t('faqTitle')} <span className="text-green-600">{t('faqTitleHighlight')}</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-card text-card-foreground border rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl mb-8 opacity-95">
            {t('ctaIntro')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <Phone className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{t('callLabel')}</h3>
              <p className="text-lg">+372 51 27 938</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{t('writeLabel')}</h3>
              <p className="text-lg">keskus@papagoi.ee</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/papagoid"
              className="papagoi-cta-white inline-flex items-center justify-center"
            >
              {t('ctaViewParrots')}
            </Link>
            <Link
              href="/kontakt"
              className="papagoi-cta-outline inline-flex items-center justify-center"
            >
              {t('ctaContact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
