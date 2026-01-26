
'use client';

import { motion } from 'framer-motion';
import { Shield, Heart, Camera, Users, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VisitRules() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const safetyRules = [
    {
      icon: Heart,
      title: 'Olge õrnad',
      description: 'Papagoid on tundlikud - liigutage aeglaselt ja räägige rahulikus hääles',
      type: 'do'
    },
    {
      icon: Users,
      title: 'Järgige juhendajat',
      description: 'Meie töötaja on alati kohal ja annab juhiseid ohutuse tagamiseks',
      type: 'do'
    },
    {
      icon: Shield,
      title: 'Peske käsi',
      description: 'Pesege käsi enne ja pärast papagoidega kontakti',
      type: 'do'
    },
    {
      icon: Camera,
      title: 'Ärge kasutage välku',
      description: 'Papagoide silmad on tundlikud - kasutage ainult loomuliku valguse',
      type: 'dont'
    }
  ];

  const guidelines = [
    {
      category: 'Lubatud',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 border-green-200',
      items: [
        'Papagoisid õrnalt kätte võtta (juhendaja abiga)',
        'Pilte ja videosid teha (ilma välguta)',
        'Papagoidega rääkida ja laulda',
        'Küsimusi esitada meie töötajale',
        'Papagoisid toita meie lubatud toiduga',
        'Väikelapsed lapsevanema kontrolli all'
      ]
    },
    {
      category: 'Keelatud',
      icon: XCircle,
      color: 'text-red-600 bg-red-50 border-red-200',
      items: [
        'Papagoisid häirida või hirmutada',
        'Omaenda toitu papagoidele anda',
        'Kõva häält teha või karjuda',
        'Papagoisid jõuga kätte võtta',
        'Välguvalos pilte teha',
        'Suitsetada ruumides'
      ]
    }
  ];

  const ageRecommendations = [
    {
      age: '0-3 aastat',
      recommendation: 'Lapsevanema kätel või läheduses. Väga kontrollitud kontakt.',
      icon: '👶',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      age: '3-8 aastat',
      recommendation: 'Suurepärane vanus! Väga uudishimulikud ja papagoid armastavad lapsi.',
      icon: '🧒',
      color: 'bg-green-100 text-green-800'
    },
    {
      age: '8+ aastat',
      recommendation: 'Võivad iseseisvamalt suhelda, aga alati juhendaja järelevalve all.',
      icon: '👦',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      age: 'Täiskasvanud',
      recommendation: 'Mõistlike juhiste järgimise korral täiesti ohutu ja nauditav.',
      icon: '👨',
      color: 'bg-purple-100 text-purple-800'
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
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Reeglid</span> ja soovitused
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Järgige lihtsaid reegleid, et külastus oleks ohutu ja nauditav kõigile - nii teile kui meie papagoidele
          </p>
        </motion.div>

        {/* Safety Rules */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {safetyRules.map((rule, index) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`text-center p-6 rounded-2xl ${
                rule.type === 'do' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                rule.type === 'do' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                <rule.icon className="h-8 w-8" />
              </div>
              <h3 className={`text-lg font-semibold mb-3 ${
                rule.type === 'do' ? 'text-green-800' : 'text-red-800'
              }`}>
                {rule.title}
              </h3>
              <p className={`text-sm ${
                rule.type === 'do' ? 'text-green-700' : 'text-red-700'
              }`}>
                {rule.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Guidelines */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {guidelines.map((guideline, index) => (
            <motion.div
              key={guideline.category}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: index === 0 ? -50 : 50 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className={`h-full border-2 ${guideline.color.split(' ')[2]}`}>
                <CardHeader className={`${guideline.color} rounded-t-lg`}>
                  <CardTitle className="flex items-center space-x-3">
                    <guideline.icon className={`h-6 w-6 ${guideline.color.split(' ')[0]}`} />
                    <span className={guideline.color.split(' ')[0]}>{guideline.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {guideline.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          guideline.category === 'Lubatud' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Age Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Soovitused <span className="text-purple-600">vanusegruppidele</span>
            </h3>
            <p className="text-lg text-gray-600">
              Iga vanusegrupp võib nautida külastust, kuid on mõned iseärasused
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ageRecommendations.map((rec, index) => (
              <div key={rec.age} className="text-center">
                <div className="text-4xl mb-4">{rec.icon}</div>
                <Badge className={`${rec.color} mb-3 font-semibold`}>
                  {rec.age}
                </Badge>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {rec.recommendation}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-blue-800">Meie eesmärk</h3>
          </div>
          <p className="text-blue-700 text-lg leading-relaxed max-w-3xl mx-auto">
            Meie eesmärk on tagada ohutu ja nauditav kogemus nii teile kui meie papagoidele. 
            Reeglid on lihtsad ja loogilised - järgides neid saate nautida imelisi hetki meie pereliikmete ja sõpradega. 
            <strong> Meie töötaja on alati kohal</strong> ja aitab teid igal sammul!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
