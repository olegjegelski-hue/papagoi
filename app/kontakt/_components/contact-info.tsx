
'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Clock, MapPin, Car, Info } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactInfo() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const contactMethods = [
    {
      icon: Phone,
      title: 'Helistage meile',
      description: 'Kõige kiirem viis ühenduse võtmiseks',
      action: '+372 512 7938',
      link: 'tel:+37251279380',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Mail,
      title: 'Kirjutage e-mail',
      description: 'Vastame 24 tunni jooksul',
      action: 'keskus@papagoi.ee',
      link: 'mailto:keskus@papagoi.ee',
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Kuidas meiega <span className="text-green-600">ühendust võtta?</span>
            </h2>
            
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <Card key={method.title} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className={`${method.color} rounded-t-lg`}>
                    <CardTitle className="flex items-center space-x-3">
                      <method.icon className="h-6 w-6" />
                      <span>{method.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <a
                      href={method.link}
                      className={`inline-flex items-center font-semibold text-lg hover:opacity-75 transition-opacity ${method.color.split(' ')[0]}`}
                    >
                      {method.action}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Practical Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-yellow-50">
                <CardTitle className="flex items-center space-x-3 text-yellow-800">
                  <Clock className="h-6 w-6" />
                  <span>Lahtiolekuajad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Esmaspäev - Pühapäev</span>
                    <span className="font-semibold">12:00 - 18:00</span>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-800 font-semibold text-sm">
                        Külastused ainult eelnevalt broneerides!
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Iga külastus toimub igal täistunnil (12:00, 13:00, 14:00, jne)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center space-x-3 text-blue-800">
                  <MapPin className="h-6 w-6" />
                  <span>Asukoht ja juhised</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Aadress:</div>
                    <div className="text-gray-700">Tartu mnt 80, Soinaste</div>
                    <div className="text-gray-700">Kambja vald, 61708 Tartumaa</div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Car className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Parkimine:</div>
                      <div className="text-sm text-gray-600">
                        Tasuta parkimine otse maja ees või tee äärde
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      <strong>Nipp:</strong> Me tuleme teid ootama välja või ukse juurde. 
                      Kui kohale jõuate, andke meile märku!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center space-x-3 text-green-800">
                  <Info className="h-6 w-6" />
                  <span>Kiire abi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-sm text-gray-700 space-y-2">
                  <div><strong>Broneerimisprobleemid:</strong> Helistage kohe</div>
                  <div><strong>Tee peal või eksinud:</strong> +372 512 7938</div>
                  <div><strong>Hilinesmine:</strong> Andke tingimata teada</div>
                  <div><strong>Hädaolukord:</strong> Helistage kohe</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
