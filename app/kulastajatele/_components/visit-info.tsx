
'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, Users, Camera, Heart, Star, Shield, CheckCircle, Calendar } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export default function VisitInfo() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const visitSteps = [
    {
      icon: Phone,
      title: 'Broneerimine',
      description: 'Helistage või broneerige kodulehe kaudu. Valite sobiva aja ja rääkige soovid.',
      time: '5 min'
    },
    {
      icon: MapPin,
      title: 'Saabumine',
      description: 'Tartu mnt 80, Soinaste. Parkimine maja ees. Ootame teid õues või ukse juures.',
      time: '0 min'
    },
    {
      icon: Heart,
      title: 'Tutvustus',
      description: 'Räägime lühidalt meie perest ja papagoidest. Selgitame reegleid ja ohutust.',
      time: '5 min'
    },
    {
      icon: Users,
      title: 'Kohtuvamine',
      description: 'Tutvute papagoidega, võite neid kätte võtta ja nendega suhelda.',
      time: '45 min'
    },
    {
      icon: Camera,
      title: 'Mälestused',
      description: 'Teete pilte ja videosid. Saate isegi papagoid enda kätel fotografeerida!',
      time: '5 min'
    }
  ];

  const whatToExpect = [
    {
      icon: Star,
      title: 'Interaktiivne kogemus',
      description: 'Võite papagoisid kätte võtta, nendega rääkida ja õppida nende kohta'
    },
    {
      icon: Shield,
      title: 'Täiesti ohutu',
      description: 'Kõik meie papagoid on inimestega harjunud ja sõbralikud. Alati oleme läheduses.'
    },
    {
      icon: Heart,
      title: 'Pere atmosfäär',
      description: 'See ei ole tavapärane loomapark - need on meie koduloomad, kes elavad koos meiega'
    },
    {
      icon: CheckCircle,
      title: 'Personaalne tähelepanu',
      description: 'Väikestes gruppides tagame, et igaüks saab piisavalt aega ja tähelepanu'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50" ref={ref}>
      <div className="container-custom">
        {/* What to expect */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Mida <span className="text-green-600">oodata</span> külastuselt?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meie külastus on planeeritud nii, et saaksite parima kogemuse ja turvaliselt nautida 
            meie papagoidega veedetud aega
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {whatToExpect.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <item.icon className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Visit flow */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Kuidas külastus <span className="text-blue-600">toimub?</span>
          </h3>
          
          <div className="grid md:grid-cols-5 gap-6">
            {visitSteps.map((step, index) => (
              <div key={step.title} className="text-center relative">
                {/* Step number */}
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 shadow-lg">
                  <step.icon className="h-10 w-10 text-gray-700 mx-auto" />
                </div>
                
                {/* Content */}
                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                <div className="text-xs text-green-600 font-semibold">~{step.time}</div>
                
                {/* Connector line */}
                {index < visitSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-300 to-blue-300 transform translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Visual showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] lg:aspect-auto">
              <Image
                src="https://cdn.abacus.ai/images/107712c6-9893-4c52-be8f-044970d7080d.png"
                alt="Papagoi keskuse sisevaade - külastuskogemus"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Meie <span className="text-green-600">kodu</span> on avatud teile
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Pikkusele: 1 tund</div>
                    <div className="text-gray-600 text-sm">Ideaalne aeg süvitsi tutvumiseks</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-blue-500 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Väikestes gruppides</div>
                    <div className="text-gray-600 text-sm">Personaalne tähelepanu igaühele</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-purple-500 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Planeeritud eelnevalt</div>
                    <div className="text-gray-600 text-sm">Tagab parima kogemuse kõigile</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
