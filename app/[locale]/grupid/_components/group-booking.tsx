'use client';

import { motion } from 'framer-motion';
import { Calendar, Phone, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';

export default function GroupBooking() {
  const t = useTranslations('GrupidBooking');
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const bookingSteps = [
    { step: '1', title: t('step1Title'), description: t('step1Desc'), action: t('step1Action') },
    { step: '2', title: t('step2Title'), description: t('step2Desc'), action: t('step2Action') },
    { step: '3', title: t('step3Title'), description: t('step3Desc'), action: t('step3Action') }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-green-500 to-blue-600 text-white relative overflow-hidden" ref={ref}>
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('title')} <span className="text-yellow-300">{t('titleHighlight')}</span> {t('titleSuffix')}
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {bookingSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center relative"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/30 transition-all duration-300">
                <div className="bg-yellow-400 text-gray-900 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>

                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="opacity-90 mb-4">{step.description}</p>

                <div className="bg-white/10 rounded-lg px-4 py-2 text-sm font-semibold">
                  {step.action}
                </div>
              </div>

              {index < bookingSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-yellow-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">{t('ctaTitle')}</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 rounded-2xl p-6">
                <Phone className="h-8 w-8 mb-3 mx-auto" />
                <h4 className="text-lg font-semibold mb-2">{t('callTitle')}</h4>
                <p className="text-sm opacity-90 mb-4">{t('callDesc')}</p>
                <a
                  href="tel:+3725127938"
                  className="papagoi-cta-white inline-flex w-full justify-center font-semibold"
                >
                  +372 512 7938
                </a>
              </div>

              <div className="bg-white/10 rounded-2xl p-6">
                <Mail className="h-8 w-8 mb-3 mx-auto" />
                <h4 className="text-lg font-semibold mb-2">{t('emailTitle')}</h4>
                <p className="text-sm opacity-90 mb-4">{t('emailDesc')}</p>
                <Link href="/kontakt">
                  <Button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold w-full">
                    {t('sendMessage')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
              <h4 className="text-lg font-semibold mb-3">{t('notesTitle')}</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>{t('pleaseTell')}</strong><br />
                  <span className="whitespace-pre-line">{t('pleaseTellItems')}</span>
                </div>
                <div>
                  <strong>{t('youGet')}</strong><br />
                  <span className="whitespace-pre-line">{t('youGetItems')}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
