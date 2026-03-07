
'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Building, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

export default function GroupsHero() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const groupTypes = [
    {
      icon: GraduationCap,
      title: 'Koolid & Lasteaed',
      description: 'Hariduslik ja põnev kogemus lastele',
      color: 'from-blue-500 to-indigo-600',
      features: ['Hariduslik programm', 'Ohutus esikohol', 'Kohandatud vanusgrupile']
    },
    {
      icon: Building,
      title: 'Ettevõtted',
      description: 'Meeskonnasündmused ja kliendirõõm',
      color: 'from-green-500 to-emerald-600',
      features: ['Teambuilding', 'Eriline kogemus', 'Stressivabastus']
    },
    {
      icon: Star,
      title: 'Sünnipäevad',
      description: 'Unustamatu sünnipäev papagoidega',
      color: 'from-yellow-500 to-orange-500',
      features: ['Privaatne üritus', 'Sünnipäevaprogramm', 'Fotosessioon']
    }
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
              Spetsiaalsed <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">programmid</span> gruppidele
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Oleme loonud eriprogrammid koolidele, ettevõtetele ja eraüritustele - 
              iga grupp saab just oma vajadustele kohandatud kogemuse
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/broneeri" className="papagoi-cta inline-flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Broneeri grupikülastus
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="tel:+37251279380" className="inline-flex items-center justify-center border-2 border-papagoi-green text-papagoi-green hover:bg-papagoi-green-50 font-semibold px-8 py-3 text-lg rounded-full transition-all">
                Helista konsultatsiooni
              </a>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-green-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="font-semibold text-yellow-800 text-lg mb-2">🎉 Erisoodustused gruppidele!</h3>
              <p className="text-yellow-700">
                Suuremad grupid saavad märkimisväärseid allahindlusi. Küsige pakkumist!
              </p>
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
                alt="Grupp külastamas Papagoi Keskust"
                fill
                className="object-cover rounded-3xl shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>

        {/* Group Types */}
        <div className="grid md:grid-cols-3 gap-8">
          {groupTypes.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
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
