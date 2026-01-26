
'use client';

import { motion } from 'framer-motion';
import { Heart, Users, GraduationCap, Calendar, Star, Shield } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    icon: Heart,
    title: 'Üks suur pere',
    description: 'Meie papagoid elavad koos meiega nagu üks suur pere - see pole tavapärane loomapark, vaid kodu',
    color: 'text-red-500'
  },
  {
    icon: Users,
    title: 'Interaktiivne kogemus',
    description: 'Võite papagoisid kätte võtta, nendega suhelda ja õppida nende kohta põnevaid fakte',
    color: 'text-blue-500'
  },
  {
    icon: GraduationCap,
    title: 'Hariduslik külastus',
    description: 'Ideaalne kogemus lastele ja koolidele - õpime papagoidest ja nende hooldamise iseärasustest',
    color: 'text-green-500'
  },
  {
    icon: Calendar,
    title: 'Personaalne tähelepanu',
    description: 'Võtame vastu ainult broneerijaid, tagades igale külastajale piisava aja ja personaalse kogemuse',
    color: 'text-purple-500'
  },
  {
    icon: Star,
    title: 'Ainulaadne Eestis',
    description: 'Sellist kogemust ei leia te mujalt Eestis - külastus, mida te ei unusta kunagi',
    color: 'text-yellow-500'
  },
  {
    icon: Shield,
    title: 'Ohutu ja turvaline',
    description: 'Kõik meie papagoid on sõbralikud ja harjunud inimestega. Kogemus on täiesti ohutu kõigile',
    color: 'text-green-600'
  }
];

export default function FeaturesSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Miks valida <span className="text-green-500">Papagoi Keskus?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Me pakkume ainulaadset kogemust, kus iga külastaja saab tunda end osa meie suurest papagoidepere perest
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="feature-card group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${
                feature.color.includes('red') ? 'from-red-100 to-red-200' :
                feature.color.includes('blue') ? 'from-blue-100 to-blue-200' :
                feature.color.includes('green-6') ? 'from-green-100 to-green-200' :
                feature.color.includes('green') ? 'from-emerald-100 to-emerald-200' :
                feature.color.includes('purple') ? 'from-purple-100 to-purple-200' :
                'from-yellow-100 to-yellow-200'
              } mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Garanteerime <span className="text-green-600">üllatavaid emotsioone!</span>
            </h3>
            <p className="text-lg text-gray-700">
              Iga külastus on eriline ja jätab püsiva mälestuse. Meie papagoid on oma isiksusega 
              tõelised karakterid, kes muudavad iga kohtumine eriliseks ja meeldejäävaks.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
