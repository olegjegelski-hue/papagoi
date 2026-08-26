import { Shield, Cookie, Lock, Mail, FileText } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getSiteUrl, pageAlternates, shareImages } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const base = getSiteUrl()
  const isRu = locale === 'ru'
  const isEn = locale === 'en'
  const title = isRu ? 'Конфиденциальность и cookie - Центр попугаев' : isEn ? 'Privacy and cookies - Parrot Centre' : 'Privaatsus ja küpsised - Papagoi Keskus'
  const description = isRu
    ? 'Политика конфиденциальности и условия использования cookie Центра попугаев. Как мы защищаем ваши персональные данные.'
    : isEn
      ? 'Parrot Centre privacy policy and cookie terms. Read how we protect your personal data.'
      : 'Papagoi Keskuse privaatsuspoliitika ja küpsiste kasutamise tingimused. Lugege, kuidas me kaitstame teie isikuandmeid.'
  const keywords = isRu ? 'политика конфиденциальности, cookie, защита данных, GDPR, Центр попугаев' : isEn ? 'privacy policy, cookies, data protection, GDPR, Parrot Centre' : 'privaatsuspoliitika, küpsised, andmekaitse, GDPR, Papagoi Keskus'
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'
  return {
    title,
    description,
    keywords,
    alternates: pageAlternates(locale, 'privaatsus'),
    openGraph: {
      title: isRu ? 'Конфиденциальность и cookie - Центр попугаев' : isEn ? 'Privacy and cookies - Parrot Centre' : 'Privaatsus ja küpsised - Papagoi Keskus',
      description: isRu ? 'Политика конфиденциальности и условия cookie.' : isEn ? 'Parrot Centre privacy policy and cookie terms.' : 'Papagoi Keskuse privaatsuspoliitika ja küpsiste kasutamise tingimused.',
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/privaatsus`,
      images: shareImages(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: isRu ? 'Конфиденциальность и cookie - Центр попугаев' : isEn ? 'Privacy and cookies - Parrot Centre' : 'Privaatsus ja küpsised - Papagoi Keskus',
      description: isRu ? 'Политика конфиденциальности и условия cookie.' : isEn ? 'Parrot Centre privacy policy and cookie terms.' : 'Papagoi Keskuse privaatsuspoliitika ja küpsiste kasutamise tingimused.',
      images: shareImages(locale),
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('PrivaatsusPage')
  const s3_1Li = t.raw('s3_1Li') as string[]
  const s3_2Li = t.raw('s3_2Li') as string[]
  const s3_3Li = t.raw('s3_3Li') as string[]
  const s4Li = t.raw('s4Li') as string[]
  const s5Li = t.raw('s5Li') as string[]
  const s6Li = t.raw('s6Li') as string[]
  const s7Li = t.raw('s7Li') as string[]
  const s8NecessaryLi = t.raw('s8NecessaryLi') as string[]
  const s8AnalyticsLi = t.raw('s8AnalyticsLi') as string[]
  const s9Li = t.raw('s9Li') as string[]

  const dateLocale = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-GB' : 'et-EE'
  const lastUpdatedStr = new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-b from-papagoi-beige-50 via-papagoi-beige to-papagoi-green-50/50">
      <main className="pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('subtitle')}</p>
            <p className="text-sm text-gray-500 mt-4">{t('lastUpdated')} {lastUpdatedStr}</p>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 text-green-600 mr-2" />
              {t('s1Title')}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{t('s1P1')}</p>
              <p className="text-gray-700 leading-relaxed">{t('s1P2')}</p>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              {t('s2Title')}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4"><strong>{t('s2Controller')}</strong></p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>{t('s2Company')}</li>
                <li>{t('s2Reg')}</li>
                <li>{t('s2Address')}</li>
                <li>E-post: <a href="mailto:keskus@papagoi.ee" className="text-green-600 hover:underline">keskus@papagoi.ee</a></li>
                <li>Telefon: <a href="tel:+3725127938" className="text-green-600 hover:underline">+372 512 7938</a></li>
              </ul>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Lock className="w-6 h-6 text-purple-600 mr-2" />
              {t('s3Title')}
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('s3_1Title')}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{t('s3_1P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                {s3_1Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('s3_2Title')}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{t('s3_2P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                {s3_2Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('s3_3Title')}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{t('s3_3P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {s3_3Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('s4Title')}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{t('s4P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                {s4Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('s5Title')}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{t('s5P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {s5Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">{t('s5After')}</p>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('s6Title')}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{t('s6P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {s6Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('s7Title')}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{t('s7P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                {s7Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <p className="text-gray-700 leading-relaxed">
                {t('s7Contact')} <a href="mailto:keskus@papagoi.ee" className="text-green-600 hover:underline">keskus@papagoi.ee</a> {locale === 'ru' ? 'или' : locale === 'en' ? 'or' : 'või'}{' '}
                <a href="tel:+3725127938" className="text-green-600 hover:underline">+372 512 7938</a>.
              </p>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Cookie className="w-6 h-6 text-yellow-600 mr-2" />
              {t('s8Title')}
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('s8_1Title')}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{t('s8_1P')}</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('s8_2Title')}</h3>
              <div className="bg-blue-50 rounded-xl p-6 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">{t('s8Necessary')}</h4>
                <p className="text-gray-700 text-sm mb-2">{t('s8NecessaryP')}</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {s8NecessaryLi.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">{t('s8Analytics')}</h4>
                <p className="text-gray-700 text-sm mb-2">{t('s8AnalyticsP')}</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {s8AnalyticsLi.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <p className="text-gray-700 text-sm mt-2">{t('s8AnalyticsNote')}</p>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('s8_3Title')}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{t('s8_3P')}</p>
              <p className="text-gray-700 leading-relaxed">
                {t('s8_3P2')} <code className="bg-papagoi-beige-100 px-2 py-1 rounded">papagoi-cookie-consent</code>.
              </p>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('s9Title')}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{t('s9P')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {s9Li.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('s10Title')}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{t('s10P')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-2" />
              {t('s11Title')}
            </h2>
            <div className="prose prose-white max-w-none">
              <p className="text-white/90 leading-relaxed mb-4">{t('s11P')}</p>
              <ul className="list-none space-y-2 text-white/90">
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  <a href="mailto:keskus@papagoi.ee" className="hover:underline">keskus@papagoi.ee</a>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 mr-2">📞</span>
                  <a href="tel:+3725127938" className="hover:underline">+372 512 7938</a>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 mr-2 mt-1">📍</span>
                  <span>{t('s11Address')}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors">
              {t('backHome')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
