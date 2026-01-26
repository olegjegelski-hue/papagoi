
'use client';

import { motion } from 'framer-motion';
import { Check, Users, GraduationCap, Building, Star, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { pricing } from '@/lib/parrots';

const services = [
  {
    id: 'visit',
    title: 'Külastus keskuses',
    price: '10',
    unit: 'EUR/inimene',
    minAmount: 'min 30 EUR',
    description: 'Tuttavus kõigi meie papagoidega, interaktiivne programm',
    features: [
      '1 tunnine programm',
      'Suhtlus kõigi papagoidega',
      'Papagoid kätte võtta',
      'Õppimine papagoidest',
      'Fotosessioon',
      'Turvaline kogemus'
    ],
    icon: Users,
    popular: true,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'mobile',
    title: 'Papagoid üritusele',
    price: '175',
    unit: 'EUR alates',
    minAmount: '',
    description: 'Tuuakse papagoid teie üritusele kohale',
    features: [
      '1-2 papagoid kohapeal',
      'Professionaalne hooldaja',
      'Transport kaasa arvatud',
      'Turvaline transport',
      'Kohandatud programm',
      'Kuni 2 tundi'
    ],
    icon: MapPin,
    popular: false,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'center-event',
    title: 'Üritus keskuses',
    price: '250',
    unit: 'EUR',
    minAmount: '',
    description: 'Privaatne üritus meie keskuses',
    features: [
      'Kogu keskus teie käsutuses',
      'Kõik papagoid saadaval',
      'Professionaalne juhendaja',
      'Kuni 3 tundi',
      'Sünnipäevad, peodhus',
      'Kuni 20 inimest'
    ],
    icon: Star,
    popular: false,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'bird-hotel',
    title: 'Linnuhotell',
    price: '5',
    unit: 'EUR/päev alates',
    minAmount: '',
    description: 'Teie linnu ajutine hoolekanne',
    features: [
      'Professionaalne hooldus',
      'Kvaliteetne toit',
      'Igapäevane tähelepanu',
      'Foto-uudised omanikule',
      'Tervisekontroll',
      'Turvaline keskkond'
    ],
    icon: Clock,
    popular: false,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50'
  }
];

export default function PricingSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="py-20 bg-gradient-to-b from-yellow-50 to-white" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Meie <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">teenused</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Valige endale sobiv viis meie papagoidega kohtumiseks - oleme avatud E-P 12:00-18:00
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className={`relative h-full hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                service.popular ? 'ring-2 ring-green-500 shadow-xl' : ''
              }`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Kõige populaarsem
                    </span>
                  </div>
                )}
                
                <CardHeader className={`text-center pb-4 ${service.bgColor} rounded-t-lg`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${service.color} mb-4 mx-auto`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </CardTitle>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">{service.price}</span>
                      <span className="text-gray-600 ml-2">{service.unit}</span>
                    </div>
                    {service.minAmount && (
                      <p className="text-sm text-gray-500 mt-1">({service.minAmount})</p>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-2">
                    {service.description}
                  </p>
                </CardHeader>
                
                <CardContent className="p-6">
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/broneeri" className="block">
                    <Button 
                      className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white font-semibold py-3 text-lg`}
                    >
                      {service.id === 'visit' ? 'Broneeri külastus' : 
                       service.id === 'mobile' ? 'Tellige kohale' :
                       service.id === 'center-event' ? 'Broneeri üritus' :
                       'Broneeri majutus'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-green-500 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lahtiolekuajad</h3>
              <p className="text-gray-600">E-P kl 12:00-18:00</p>
              <p className="text-sm text-gray-500 mt-1">Igal täistunnil</p>
            </div>
            
            <div>
              <div className="bg-blue-500 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Broneerimine</h3>
              <p className="text-gray-600">Ainult eelnevalt broneerides</p>
              <p className="text-sm text-gray-500 mt-1">Telefon või koduleht</p>
            </div>
            
            <div>
              <div className="bg-yellow-500 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Asukoht</h3>
              <p className="text-gray-600">Tartu mnt 80, Soinaste</p>
              <p className="text-sm text-gray-500 mt-1">Kambja vald, Tartumaa</p>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-700 text-lg mb-4">
              <strong>Grupihinnangud:</strong> Koolidele ja ettevõtetele erisoodustused!
            </p>
            <Link href="/kontakt">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                Küsi gruppide kohta
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
