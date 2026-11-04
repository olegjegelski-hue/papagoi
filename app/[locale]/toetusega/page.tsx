import { Calendar, ExternalLink, Mail } from 'lucide-react'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import {
  FUNDING_SOURCES,
  LEARNING_PROGRAMS,
  PROGRAM_STAGES,
  type LearningProgram,
  type ProgramStage,
} from '@/lib/programs'
import { getSiteUrl, pageAlternates, shareImages } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

const KUL_LIST_URL = 'https://www.kul.ee/muuseumid-tartumaal'

const STAGE_KEY: Record<ProgramStage, 'stageLasteaed' | 'stageI' | 'stageII' | 'stageIII' | 'stageGymnasium'> = {
  lasteaed: 'stageLasteaed',
  i: 'stageI',
  ii: 'stageII',
  iii: 'stageIII',
  gymnasium: 'stageGymnasium',
}

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
    alternates: pageAlternates(locale, 'toetusega'),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocale,
      url: `${base}/${locale}/toetusega`,
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

export default async function ToetusegaPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('ToetusegaPage')
  const names = t.raw('programs') as Record<string, string>
  const showEstonianNote = locale !== 'et'

  return (
    <div className="min-h-screen bg-papagoi-beige-50">
      <BreadcrumbJsonLd locale={locale} items={[{ name: t('title'), path: 'toetusega' }]} />

      <section className="pt-12 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-deep-anthracite">{t('title')}</h1>
          <p className="mt-5 text-lg leading-relaxed text-deep-anthracite/80">{t('intro')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/broneeri" className="papagoi-cta">
              <Calendar className="w-5 h-5" aria-hidden />
              <span>{t('ctaBook')}</span>
            </Link>
            <Link href="/kontakt" className="papagoi-cta-white">
              <span>{t('ctaContact')}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-papagoi-beige-200 bg-papagoi-beige-100 p-6 sm:p-8 shadow-sm">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-anthracite">{t('ranitsTitle')}</h2>
            <p className="mt-3 text-deep-anthracite/80 leading-relaxed">{t('ranitsLead')}</p>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="font-semibold text-deep-anthracite">{t('ranitsWhoLabel')}</dt>
                <dd className="mt-1 text-deep-anthracite/80">{t('ranitsWho')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-deep-anthracite">{t('ranitsPaysLabel')}</dt>
                <dd className="mt-1 text-deep-anthracite/80">{t('ranitsPays')}</dd>
              </div>
              <div>
                <dt className="font-semibold text-deep-anthracite">{t('ranitsHowLabel')}</dt>
                <dd className="mt-1 text-deep-anthracite/80">{t('ranitsHow')}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href="/broneeri" className="papagoi-cta">
                <Calendar className="w-5 h-5" aria-hidden />
                <span>{t('ctaBook')}</span>
              </Link>
              <a
                href={KUL_LIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-11 text-papagoi-green font-semibold hover:text-papagoi-blue"
              >
                {t('ranitsListLink')}
                <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-anthracite">{t('programsTitle')}</h2>
          <p className="mt-3 max-w-3xl text-deep-anthracite/80 leading-relaxed">{t('programsIntro')}</p>

          {PROGRAM_STAGES.map((stage) => {
            const items = LEARNING_PROGRAMS.filter((program) => program.stage === stage)
            if (items.length === 0) return null
            return (
              <div key={stage} className="mt-10">
                <h3 className="text-xl font-bold text-deep-anthracite">{t(STAGE_KEY[stage])}</h3>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((program) => (
                    <li key={program.id}>
                      <ProgramCard
                        program={program}
                        name={names[program.id]}
                        stageLabel={t(STAGE_KEY[stage])}
                        durationLabel={t('duration')}
                        ranitsLabel={t('badgeRanits')}
                        murakaLabel={t('badgeMurakas')}
                        murakaAlt={t('murakaAlt')}
                        themeLabel={
                          program.theme === 'ringmajandus'
                            ? t('themeCircular')
                            : program.theme === 'kliima'
                              ? t('themeClimate')
                              : null
                        }
                        viewLabel={t('viewProgram')}
                        estonianNote={showEstonianNote ? t('descriptionNote') : null}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {FUNDING_SOURCES.length > 0 && (
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
            {FUNDING_SOURCES.map((source) => (
              <FundingBlock key={source.id} id={source.id} />
            ))}
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-papagoi-beige-200 bg-papagoi-beige-100 p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-deep-anthracite">{t('helpTitle')}</h2>
            <p className="mt-3 text-deep-anthracite/80 leading-relaxed">{t('helpText')}</p>
            <a
              href="mailto:keskus@papagoi.ee"
              className="mt-5 inline-flex items-center gap-2 min-h-11 font-semibold text-papagoi-green hover:text-papagoi-blue"
            >
              <Mail className="w-5 h-5" aria-hidden />
              keskus@papagoi.ee
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProgramCard({
  program,
  name,
  stageLabel,
  durationLabel,
  ranitsLabel,
  murakaLabel,
  murakaAlt,
  themeLabel,
  viewLabel,
  estonianNote,
}: {
  program: LearningProgram
  name: string
  stageLabel: string
  durationLabel: string
  ranitsLabel: string
  murakaLabel: string
  murakaAlt: string
  themeLabel: string | null
  viewLabel: string
  estonianNote: string | null
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-papagoi-beige-200 bg-white p-5 shadow-sm">
      <h4 className="text-lg font-bold text-deep-anthracite leading-snug">{name}</h4>
      <p className="mt-2 text-sm text-deep-anthracite/70">
        {stageLabel}
        <span aria-hidden> · </span>
        {durationLabel}
      </p>
      {(program.kultuuriranits || program.murakamargis || themeLabel) && (
        <ul className="mt-4 flex flex-wrap items-center gap-2">
          {program.kultuuriranits && (
            <li className="inline-flex items-center rounded-full bg-papagoi-green/15 px-3 py-1 text-sm font-medium text-deep-anthracite">
              {ranitsLabel}
            </li>
          )}
          {program.murakamargis && (
            <li className="inline-flex items-center gap-2 rounded-2xl bg-papagoi-beige-50 pr-3 text-sm font-medium text-deep-anthracite">
              <Image
                src="/toetusega/murakamargis.png"
                alt={murakaAlt}
                width={72}
                height={72}
                className="h-[4.5rem] w-[4.5rem]"
              />
              <span>{murakaLabel}</span>
            </li>
          )}
          {themeLabel && (
            <li className="inline-flex items-center rounded-full bg-papagoi-orange/15 px-3 py-1 text-sm font-medium text-deep-anthracite">
              {themeLabel}
            </li>
          )}
        </ul>
      )}
      <div className="mt-auto pt-4">
        {estonianNote && <p className="mb-2 text-sm text-deep-anthracite/60">{estonianNote}</p>}
        <a
          href={program.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 min-h-11 font-semibold text-papagoi-green hover:text-papagoi-blue"
        >
          {viewLabel}
          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
        </a>
      </div>
    </article>
  )
}

async function FundingBlock({ id }: { id: string }) {
  const t = await getTranslations('ToetusegaPage')
  const funders = t.raw('funders') as Record<string, { title: string; body: string }>
  const copy = funders[id]
  if (!copy) return null
  return (
    <div className="rounded-2xl border border-papagoi-beige-200 bg-papagoi-beige-100 p-6 sm:p-8">
      <h2 className="font-heading text-2xl font-bold text-deep-anthracite">{copy.title}</h2>
      <p className="mt-3 text-deep-anthracite/80 leading-relaxed">{copy.body}</p>
    </div>
  )
}
