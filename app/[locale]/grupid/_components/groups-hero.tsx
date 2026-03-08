'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Building, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';

export default function GroupsHero() {
  const t = useTranslations('GrupidHero');
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const groupTypes = [
    { icon: GraduationCap, title: t('group1Title'), description: t('group1Desc'), color: 'from-blue-500 to-indigo-600', features: [t('group1F1'), t('group1F2'), t('group1F3')] },
    { icon: Building, title: t('group2Title'), description: t('group2Desc'), color: 'from-green-500 to-emerald-600', features: [t('group2F1'), t('group2F2'), t('group2F3')] },
    { icon: Star, title: t('group3Title'), description: t('group3Desc'), color: 'from-yellow-500 to-orange-500', features: [t('group3F1'), t('group3F2'), t('group3F3')] }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {t('title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">{t('titleHighlight')}</span> {t('titleSuffix')}
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/broneeri" className="papagoi-cta inline-flex items-center">
                <Users className="mr-2 h-5 w-5" />
                {t('bookGroup')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="tel:+3725127938" className="inline-flex items-center justify-center border-2 border-papagoi-green text-papagoi-green hover:bg-papagoi-green-50 font-semibold px-8 py-3 text-lg rounded-full transition-all">
                {t('callConsult')}
              </a>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-green-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="font-semibold text-yellow-800 text-lg mb-2">{t('bonusTitle')}</h3>
              <p className="text-yellow-700">{t('bonusText')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              <Image
                src="https://cdn.abacus.ai/images/6974aef7-abf0-4482-b928-511e386f539e.png"
                alt={t('imageAlt')}
                fill
                className="object-cover rounded-3xl shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {groupTypes.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-card text-card-foreground border rounded-3xl shadow-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`h-2 bg-gradient-to-r ${group.color}`} />
              <div className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${group.color} mb-6`}>
                  <group.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">{group.title}</h3>
                <p className="text-gray-600 mb-6">{group.description}</p>

                <ul className="space-y-2">
                  {group.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full mr-3 bg-gradient-to-r ${group.color}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
