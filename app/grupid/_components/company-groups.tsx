
'use client';

import { motion } from 'framer-motion';
import { Building, Users, Coffee, Award, Heart, Target } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function CompanyGroups() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const corporatePrograms = [
    {
      title: 'Teambuilding külastus',
      duration: '2-3 tundi',
      group: '10-30 inimest',
      description: 'Meeskonna ühendav kogemus papagoidega. Lõõgastav ja meeldejääv.',
      activities: [
        'Jää murda papagoidega',
        'Grupi fotosessioon',
        'Mini-koolitused loomadest',
        'Suhtlussed parrots'
      ],
      price: 'Alates 15 EUR/inimene',
      image: 'https://cdn.abacus.ai/images/107712c6-9893-4c52-be8f-044970d7080d.png'
    },
    {
      title: 'Kliendisündmused',
      duration: '1-2 tundi',
      group: '5-20 inimest',
      description: 'Eriline kogemus oma klientidele. Garanteeritud positiivne mulje.',
      activities: [
        'Personaalne tutvustus',
        'VIP kohtlemine',
        'Professionaalsed fotod',
        'Kingitused ja mälestused'
      ],
      price: 'Alates 20 EUR/inimene',
      image: 'https://cdn.abacus.ai/images/6974aef7-abf0-4482-b928-511e386f539e.png'
    },
    {
      title: 'Firmapeod ja sündmused',
      duration: '2-4 tundi',
      group: 'Kuni 50 inimest',
      description: 'Privaatne üritus meie keskuses. Kogu ruum teie käsutuses.',
      activities: [
        'Privaatne keskkond',
        'Kohandatud programm',
        'Catering võimalus',
        'Eriline atmosfäär'
      ],
      price: 'Individuaalne pakkumine',
      image: 'https://cdn.abacus.ai/images/79c51faf-a85c-47a7-bd68-4ef01c3037fd.png'
    }
  ];

  const benefits = [
    {
      icon: Users,
      title: 'Meeskonna ühtekuuluvus',
      description: 'Ühine uus kogemus ühendab töökaaslasi ja loob positiivse atmosfääri'
    },
    {
      icon: Heart,
      title: 'Stressi maandamine',
      description: 'Loomadega suhtlemine aitab lõõgastuda ja stressi vabastada'
    },
    {
      icon: Target,
      title: 'Motivatsioon',
      description: 'Eriline kogemus tõstab meeskonna motivatsiooni ja töörahulolu'
    },
    {
      icon: Award,
      title: 'Erakordne mälestus',
      description: 'Midagi sellist ei paku ükski teine koht Eestis'
    }
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
            <span className="text-green-600">Ettevõtted</span> ja organisatsioonid
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Looge oma meeskonnale või klientidele unustamatu kogemus meie papagoidega
          </p>
        </motion.div>

        {/* Programs */}
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
                        alt={`${program.title} - grupikülastus Papagoi Keskuses`}
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
                        <div className="text-sm text-green-700">Hind sisaldab professionaalset juhendamist</div>
                      </div>
                    </div>
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
          className="bg-card text-card-foreground border rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Miks <span className="text-green-600">ettevõtted</span> valivad meid?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {benefits.map((benefit, index) => (
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
            <h4 className="text-xl font-semibold text-green-800 mb-4">🤝 Koostöö ettevõtetega</h4>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-green-700">
                <strong>Individuaalne lähenemine</strong><br />
                Igale ettevõttele kohandatud programm ja hinnapakkumine
              </div>
              <div className="text-green-700">
                <strong>Paindlik aeg</strong><br />
                Saame vastu tulla ka tavapärasest erinevatel aegadel
              </div>
              <div className="text-green-700">
                <strong>Professionaalne teenindus</strong><br />
                Arve, leping ja kõik vajalik dokumentatsioon
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
