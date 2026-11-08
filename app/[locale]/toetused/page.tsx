import { Calendar, Info, Phone } from 'lucide-react'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import ScrollToHash from '@/components/ScrollToHash'
import { MUNICIPALITIES } from '@/lib/municipalities'
import {
  LEARNING_PROGRAMS,
  PROGRAM_STAGES,
  type ProgramStage,
  type ProgramTheme,
} from '@/lib/programs'
import { getSiteUrl, pageAlternates, shareImages } from '@/lib/seo'
import ProgramAccordion, { type ProgramGroup } from './program-accordion'

type Props = { params: Promise<{ locale: string }> }

const KUL_LIST_URL = 'https://www.kul.ee/muuseumid-tartumaal'
const PROGRAMS_URL = 'https://keskkonnaharidus.ee/et/oppeprogrammid'
const GROUP_PHOTO = 'https://cdn.abacus.ai/images/6974aef7-abf0-4482-b928-511e386f539e.png'
const PHONE_TEL = 'tel:+3725127938'
const PHONE_DISPLAY = '+372 512 7938'
const EMAIL = 'keskus@papagoi.ee'
const STATUTE_HREF = '/dokumendid/papagoi-keskus-mtu-pohikiri-2026-05-19.pdf'
const ARIREGISTER_ET = 'https://ariregister.rik.ee/est/company/80647595'
const ARIREGISTER_EN = 'https://ariregister.rik.ee/eng/company/80647595'

const ORG_FIELDS = [
  ['whoNameLabel', 'whoName'],
  ['whoRegLabel', 'whoReg'],
  ['whoFoundedLabel', 'whoFounded'],
  ['whoAddressLabel', 'whoAddress'],
] as const

const STAGE_KEY: Record<ProgramStage, 'stageLasteaed' | 'stageI' | 'stageII' | 'stageIII' | 'stageGymnasium'> = {
  lasteaed: 'stageLasteaed',
  i: 'stageI',
  ii: 'stageII',
  iii: 'stageIII',
  gymnasium: 'stageGymnasium',
}

const STEP_COLORS = ['bg-papagoi-green', 'bg-papagoi-blue', 'bg-papagoi-orange', 'bg-papagoi-green'] as const

type StepCopy = { title: string; text: string; action?: 'book' | 'write' }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ToetusegaPage' })
  const base = getSiteUrl()
  const title = t('metaTitle')
  const description = t('metaDescription')
  const ogLocale = locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_EE' : 'et_EE'

  return {
    title,
    description,
    alternates: pageAlternates(locale, 'toetused'),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/toetused`,
      images: shareImages(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: shareImages(locale),
    },
  }
}

function StepGrid({ steps }: { steps: StepCopy[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {steps.map((step, index) => (
        <div key={step.title} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className={`${STEP_COLORS[index % STEP_COLORS.length]} p-6 text-white`}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold">{step.title}</h3>
              <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">{index + 1}</div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 leading-relaxed">{step.text}</p>
            {step.action === 'book' && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <Link href="/broneeri" className="font-semibold text-papagoi-green hover:underline">
                  {step.title} →
                </Link>
                <a href={PHONE_TEL} className="font-semibold text-papagoi-red hover:underline">
                  {PHONE_DISPLAY}
                </a>
              </div>
            )}
            {step.action === 'write' && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <a href={`mailto:${EMAIL}`} className="font-semibold text-papagoi-green hover:underline">
                  {EMAIL}
                </a>
                <a href={PHONE_TEL} className="font-semibold text-papagoi-red hover:underline">
                  {PHONE_DISPLAY}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function ToetusegaPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('ToetusegaPage')
  const names = t.raw('programs') as Record<string, string>
  const giftSteps = t.raw('giftSteps') as StepCopy[]
  const ranitsSteps = t.raw('ranitsSteps') as StepCopy[]
  const showEstonianNote = locale !== 'et'
  const ariregisterHref = locale === 'et' ? ARIREGISTER_ET : ARIREGISTER_EN

  const themeLabel = (theme: ProgramTheme) =>
    theme === 'ringmajandus' ? t('themeCircular') : t('themeClimate')

  const groups: ProgramGroup[] = PROGRAM_STAGES.map((stage) => ({
    id: stage,
    title: t(STAGE_KEY[stage]),
    items: LEARNING_PROGRAMS.filter((program) => program.stage === stage).map((program) => ({
      id: program.id,
      name: names[program.id] ?? program.id,
      url: program.url,
      ranits: program.kultuuriranits,
      muraka: program.murakamargis,
      theme: program.theme ? themeLabel(program.theme) : null,
      estonianNote: showEstonianNote ? t('descriptionNote') : null,
    })),
  })).filter((group) => group.items.length > 0)

  const textLink = 'font-semibold text-papagoi-green hover:underline'

  return (
    <div className="min-h-screen bg-gradient-to-b from-papagoi-beige-50 via-papagoi-beige to-papagoi-green-50/50">
      <BreadcrumbJsonLd locale={locale} items={[{ name: t('title'), path: 'toetused' }]} />
      <ScrollToHash />

      <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>
            <p className="text-xl text-deep-anthracite/80 max-w-3xl mx-auto">{t('intro')}</p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-16 max-w-5xl mx-auto h-64 md:h-80">
            <Image
              src={GROUP_PHOTO}
              alt={t('heroImageAlt')}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('howTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="#kool"
                className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl border-t-4 border-papagoi-green hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4" aria-hidden>🎒</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{t('pathSchoolTitle')}</h3>
                <p className="text-gray-600">{t('pathSchoolText')}</p>
              </a>
              <a
                href="#vald"
                className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl border-t-4 border-papagoi-blue hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4" aria-hidden>🏡</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{t('pathMuniTitle')}</h3>
                <p className="text-gray-600">{t('pathMuniText')}</p>
              </a>
              <a
                href="#kingi"
                className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl border-t-4 border-papagoi-orange hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4" aria-hidden>💛</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{t('pathGiftTitle')}</h3>
                <p className="text-gray-600">{t('pathGiftText')}</p>
              </a>
            </div>
          </div>

          <section id="kool" className="scroll-mt-[12.5rem] mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2" aria-hidden>🎒</span>
              {t('ranitsTitle')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t.rich('ranitsBody', {
                list: (chunks) => (
                  <a href={KUL_LIST_URL} target="_blank" rel="noopener noreferrer" className={textLink}>
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <div className="mb-8">
              <StepGrid steps={ranitsSteps} />
            </div>
            <Link href="/broneeri" className="papagoi-cta inline-flex items-center justify-center">
              {t('ranitsCta')}
            </Link>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('programsTitle')}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t.rich('programsIntro', {
                site: (chunks) => (
                  <a href={PROGRAMS_URL} target="_blank" rel="noopener noreferrer" className={textLink}>
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <ProgramAccordion
              groups={groups}
              markRanits={t('markRanits')}
              viewProgram={t('viewProgram')}
              murakaAlt={t('murakaAlt')}
            />
          </section>

          <section id="vald" className="scroll-mt-[12.5rem] mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2" aria-hidden>🏡</span>
              {t('muniTitle')}
            </h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed mb-8">
              <p>{t('muniLead')}</p>
              <p>{t('muniFollow')}</p>
            </div>
            <div className="bg-papagoi-blue-50 rounded-xl p-6 border border-papagoi-blue-200">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-papagoi-blue flex-shrink-0 mt-1" />
                <p className="text-gray-700 leading-relaxed">
                  {t.rich('muniTip', {
                    mail: (chunks) => (
                      <a href={`mailto:${EMAIL}`} className={textLink}>
                        {chunks}
                      </a>
                    ),
                  })}
                </p>
              </div>
            </div>
            {MUNICIPALITIES.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {MUNICIPALITIES.map((municipality) => (
                  <div
                    key={municipality.id}
                    className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl border-t-4 border-papagoi-blue"
                  >
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{municipality.name}</h3>
                    <p className="text-sm font-medium text-papagoi-green mb-2">{municipality.status}</p>
                    <p className="text-gray-600">{municipality.description}</p>
                    {municipality.url && (
                      <a
                        href={municipality.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${textLink} mt-3 inline-flex`}
                      >
                        {t('viewProgram')} →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="kingi" className="scroll-mt-[12.5rem] mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2" aria-hidden>💛</span>
              {t('giftTitle')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">{t('giftIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl text-center border-t-4 border-papagoi-green">
                <div className="text-4xl mb-4" aria-hidden>👤</div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('giftPersonTitle')}</h3>
                <p className="text-gray-600">{t('giftPersonText')}</p>
              </div>
              <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl text-center border-t-4 border-papagoi-blue">
                <div className="text-4xl mb-4" aria-hidden>🏢</div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('giftCompanyTitle')}</h3>
                <p className="text-gray-600">{t('giftCompanyText')}</p>
              </div>
              <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl text-center border-t-4 border-papagoi-orange">
                <div className="text-4xl mb-4" aria-hidden>🤝</div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('giftFundTitle')}</h3>
                <p className="text-gray-600">{t('giftFundText')}</p>
              </div>
            </div>
            <div className="mb-8">
              <StepGrid steps={giftSteps} />
            </div>
            {/* Hiljem: Montonio annetuse nupp siia, enne „Kirjuta meile“. */}
            <a href={`mailto:${EMAIL}`} className="papagoi-cta inline-flex items-center justify-center">
              {t('giftCta')}
            </a>
          </section>

          <section id="kesmeoleme" className="scroll-mt-[12.5rem] mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('whoTitle')}</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed mb-8">
              <p>{t('whoPurpose')}</p>
              <p>{t('whoGuides')}</p>
            </div>
            <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-2xl mb-8">
              <dl className="space-y-3">
                {ORG_FIELDS.map(([labelKey, valueKey]) => (
                  <div key={labelKey} className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="font-semibold text-gray-800 sm:w-40 shrink-0">{t(labelKey)}</dt>
                    <dd className="text-gray-700">{t(valueKey)}</dd>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="font-semibold text-gray-800 sm:w-40 shrink-0">{t('whoContactLabel')}</dt>
                  <dd className="text-gray-700">
                    {t.rich('whoContact', {
                      mail: (chunks) => (
                        <a href={`mailto:${EMAIL}`} className={textLink}>
                          {chunks}
                        </a>
                      ),
                      phone: (chunks) => (
                        <a href={PHONE_TEL} className={textLink}>
                          {chunks}
                        </a>
                      ),
                    })}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <p>
                  <a
                    href={STATUTE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={textLink}
                  >
                    {t('whoStatute')}
                  </a>
                  <span className="text-gray-600"> — {t('whoStatuteEdition')}</span>
                </p>
                <p>
                  <a
                    href={ariregisterHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={textLink}
                  >
                    {t('whoReport')}
                  </a>
                </p>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('whoDonationsTitle')}</h3>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>{t('whoDonationsHonest')}</p>
              <p>{t('whoDonationsCover')}</p>
            </div>
          </section>

          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ctaTitle')}</h2>
            <p className="text-xl mb-8 opacity-90">{t('ctaText')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/broneeri" className="papagoi-cta-white inline-flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                {t('ctaBook')}
              </Link>
              <a href={PHONE_TEL} className="papagoi-cta-outline inline-flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                {t('ctaCall')}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
