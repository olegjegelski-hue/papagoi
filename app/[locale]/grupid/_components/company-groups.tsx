'use client';

import { motion } from 'framer-motion';
import { Building, Users, Heart, Target, Award } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function CompanyGroups() {
  const t = useTranslations('GrupidCompany');
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const corporatePrograms = [
    { title: t('prog1Title'), duration: t('prog1Duration'), group: t('prog1Group'), description: t('prog1Desc'), activities: [t('prog1A1'), t('prog1A2'), t('prog1A3'), t('prog1A4')], price: t('prog1Price'), image: 'https://cdn.abacus.ai/images/107712c6-9893-4c52-be8f-044970d7080d.png' },
    { title: t('prog2Title'), duration: t('prog2Duration'), group: t('prog2Group'), description: t('prog2Desc'), activities: [t('prog2A1'), t('prog2A2'), t('prog2A3'), t('prog2A4')], price: t('prog2Price'), image: 'https://cdn.abacus.ai/images/6974aef7-abf0-4482-b928-511e386f539e.png' },
    { title: t('prog3Title'), duration: t('prog3Duration'), group: t('prog3Group'), description: t('prog3Desc'), activities: [t('prog3A1'), t('prog3A2'), t('prog3A3'), t('prog3A4')], price: t('prog3Price'), image: 'https://cdn.abacus.ai/images/79c51faf-a85c-47a7-bd68-4ef01c3037fd.png' }
  ];

  const benefits = [
    { icon: Users, title: t('benefit1Title'), description: t('benefit1Desc') },
    { icon: Heart, title: t('benefit2Title'), description: t('benefit2Desc') },
    { icon: Target, title: t('benefit3Title'), description: t('benefit3Desc') },
    { icon: Award, title: t('benefit4Title'), description: t('benefit4Desc') }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-green-50" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Building className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-green-600">{t('title')}</span> {t('titleSuffix')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="space-y-8 mb-16">
          {corporatePrograms.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:grid-cols-2 lg:flex-row-reverse' : ''}`}>
                    <div className={`relative aspect-[4/3] lg:aspect-auto ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <Image
                        src={program.image}
                        alt={`${program.title} - group visit Parrot Centre`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {program.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 mb-4 text-sm">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                          ⏱️ {program.duration}
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                          👥 {program.group}
                        </div>
                      </div>

                      <p className="text-lg text-gray-600 mb-6">
                        {program.description}
                      </p>

                      <ul className="space-y-3 mb-6">
                        {program.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-gray-700">{activity}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{program.price}</div>
                        <div className="text-sm text-green-700">{t('priceNote')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-card text-card-foreground border rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {t('whyTitle')} <span className="text-green-600">{t('whyHighlight')}</span> {t('whySuffix')}
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-green-600 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 text-center">
            <h4 className="text-xl font-semibold text-green-800 mb-4">{t('coopTitle')}</h4>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-green-700">
                <strong>{t('coop1Title')}</strong><br />
                {t('coop1Desc')}
              </div>
              <div className="text-green-700">
                <strong>{t('coop2Title')}</strong><br />
                {t('coop2Desc')}
              </div>
              <div className="text-green-700">
                <strong>{t('coop3Title')}</strong><br />
                {t('coop3Desc')}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
