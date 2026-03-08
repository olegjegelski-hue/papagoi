'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Book, Shield, Clock, Users, Award } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function SchoolGroups() {
  const t = useTranslations('GrupidSchool');
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const schoolPrograms = [
    { age: t('age1'), title: t('prog1Title'), duration: t('prog1Duration'), maxSize: t('prog1Size'), description: t('prog1Desc'), activities: [t('prog1A1'), t('prog1A2'), t('prog1A3'), t('prog1A4')], price: t('prog1Price'), icon: '🐣' },
    { age: t('age2'), title: t('prog2Title'), duration: t('prog2Duration'), maxSize: t('prog2Size'), description: t('prog2Desc'), activities: [t('prog2A1'), t('prog2A2'), t('prog2A3'), t('prog2A4')], price: t('prog2Price'), icon: '📚' },
    { age: t('age3'), title: t('prog3Title'), duration: t('prog3Duration'), maxSize: t('prog3Size'), description: t('prog3Desc'), activities: [t('prog3A1'), t('prog3A2'), t('prog3A3'), t('prog3A4')], price: t('prog3Price'), icon: '🧬' }
  ];

  const benefits = [
    { icon: Book, title: t('benefit1Title'), description: t('benefit1Desc') },
    { icon: Shield, title: t('benefit2Title'), description: t('benefit2Desc') },
    { icon: Award, title: t('benefit3Title'), description: t('benefit3Desc') }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">{t('title')}</span> {t('titleSuffix')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {schoolPrograms.map((program, index) => (
            <motion.div
              key={program.age}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-blue-50 text-center">
                  <div className="text-4xl mb-2">{program.icon}</div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {program.title}
                  </CardTitle>
                  <div className="text-blue-600 font-semibold">{program.age}</div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{program.maxSize}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{program.description}</p>

                  <ul className="space-y-2 mb-6">
                    {program.activities.map((activity, actIndex) => (
                      <li key={actIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                        {activity}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{program.price}</div>
                    <div className="text-sm text-blue-700">{t('teachersFree')}</div>
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
            {t('whyTitle')} <span className="text-blue-600">{t('whyHighlight')}</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-2xl p-6 text-center">
            <h4 className="text-xl font-semibold text-blue-800 mb-3">{t('bookingTitle')}</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>{t('noticeLabel')}</strong><br />
                {t('noticeValue')}
              </div>
              <div>
                <strong>{t('paymentLabel')}</strong><br />
                {t('paymentValue')}
              </div>
              <div>
                <strong>{t('cancelLabel')}</strong><br />
                {t('cancelValue')}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
