
'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Book, Shield, Clock, Users, Award } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchoolGroups() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const schoolPrograms = [
    {
      age: '3-6 aastat',
      title: 'Lasteaiarühmad',
      duration: '45 min',
      maxSize: '15 last',
      description: 'Lihtne ja huvitav tutvus papagoidega. Lapsed õpivad loomade hooldamist ja käitumist.',
      activities: [
        'Papagoidega tutvumine',
        'Lihtsad küsimused ja vastused',
        'Õrn kontakt loomadega',
        'Laulmine papagoidega'
      ],
      price: '8 EUR/laps',
      icon: '🐣'
    },
    {
      age: '6-12 aastat',
      title: 'Algkool',
      duration: '60 min',
      maxSize: '20 last',
      description: 'Hariduslik programm papagoi bioloogia ja käitumise kohta. Praktilised tegevused.',
      activities: [
        'Papagoi anatoomia tutvustus',
        'Toitumisharjumused',
        'Papagoidega suhtlemine',
        'Küsimused-vastused sessioon'
      ],
      price: '9 EUR/laps',
      icon: '📚'
    },
    {
      age: '12+ aastat',
      title: 'Keskool',
      duration: '75 min',
      maxSize: '25 õpilast',
      description: 'Süvenenud teadmised papagoidest, bioloogia ja käitumispsühholoogia.',
      activities: [
        'Papagoi intelligentsus',
        'Kaitseinstinktid',
        'Paaritumiskäitumine',
        'Praktilised ülesanded'
      ],
      price: '10 EUR/õpilane',
      icon: '🧬'
    }
  ];

  const benefits = [
    {
      icon: Book,
      title: 'Hariduslik väärtus',
      description: 'Lapsed õpivad loomade bioloogiast ja käitumisest praktiliselt'
    },
    {
      icon: Shield,
      title: 'Täiesti ohutu',
      description: 'Kõik tegevused on ohutud ja kohandatud laste vanusele'
    },
    {
      icon: Award,
      title: 'Kvalifitseeritud juhendamine',
      description: 'Meie töötajad oskavad lastele arusaadavalt selgitada'
    }
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
            <span className="text-blue-600">Koolid</span> ja lasteaed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Spetsiaalselt väljatöötatud hariduslikud programmid erinevatele vanusegruppidele
          </p>
        </motion.div>

        {/* Programs */}
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
                    <div className="text-sm text-blue-700">(õpetajad tasuta)</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Miks valida meie <span className="text-blue-600">haridusprogramm?</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
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
            <h4 className="text-xl font-semibold text-blue-800 mb-3">📋 Broneerimisinfo koolidele</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>Ette teatada:</strong><br />
                Vähemalt 1 nädal enne
              </div>
              <div>
                <strong>Maksetähtaeg:</strong><br />
                Arve alusel 14 päeva
              </div>
              <div>
                <strong>Tühistamine:</strong><br />
                Tasuta 48h ette
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
