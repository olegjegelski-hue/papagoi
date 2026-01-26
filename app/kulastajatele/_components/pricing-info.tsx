
'use client';

import { motion } from 'framer-motion';
import { Euro, Users, Clock, Phone, Gift, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

export default function PricingInfo() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const pricingExamples = [
    { people: 2, total: 20, note: 'Kahe inimesega külastus' },
    { people: 4, total: 40, note: 'Väike grupp' },
    { people: 6, total: 60, note: 'Sõprade grupp' },
    { people: 10, total: 100, note: 'Suurem grupp' }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-green-600">Hinnad</span> ja tingimused
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Läbipaistvad hinnad ilma varjatud kuludeta - kõik on kaasas!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Main Pricing */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="h-full shadow-xl border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center rounded-t-lg">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Euro className="h-8 w-8 mx-auto" />
                </div>
                <CardTitle className="text-3xl font-bold">Külastuse hind</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">10 <span className="text-2xl text-gray-600">EUR</span></div>
                  <div className="text-lg text-gray-600">inimese kohta</div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">1-tunnine interaktiivne programm</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Personaalne tähelepanu</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Fotosessioon papagoidega</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Professionaalne juhendamine</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">Hind sisaldab:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Tutustamist kõigi papagoidega</li>
                    <li>• Võimalust papagoisid kätte võtta</li>
                    <li>• Õppimist papagoidest</li>
                    <li>• Fotode tegemist</li>
                    <li>• Professionaalset juhendamist</li>
                  </ul>
                </div>

                <Link href="/broneeri" className="block">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 text-lg">
                    Broneeri külastus
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing Examples */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="h-6 w-6 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-900">Hinna kalkulaator</h3>
              </div>

              <div className="space-y-4">
                {pricingExamples.map((example, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{example.people} inimest</div>
                        <div className="text-sm text-gray-500">{example.note}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{example.total} EUR</div>
                      <div className="text-xs text-gray-500">{(example.total / example.people).toFixed(0)} EUR/inimene</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gruppidele erisoodustused!</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>Koolid ja lasteaiad:</strong> küsi grupi külastuse aja ja detailide kohta</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span><strong>Ettevõtted:</strong> küsi privaatse külastuse aja ja detailide kohta</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Suuremad grupid:</strong> lepime külastuse detailid kokku</span>
                </div>
              </div>
              <Link href="/grupid" className="block mt-4">
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  Vaata gruppide pakkumisi
                </Button>
              </Link>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Kasulik teada:</h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• Külastuse hind on 10€ inimese kohta</li>
                <li>• Täpsustame külastuse aja pärast broneeringu esitamist</li>
                <li>• Suuremate gruppide ja erisoovide korral lepime detailid kokku</li>
                <li>• Maksmine nii sularahas kui kaardiga</li>
                <li>• Broneeringu tühistamine tasuta 24h ette</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Contact for custom pricing */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Erikonfiguratsioonid või suured grupid?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Võtke meiega ühendust ja arutame teie soove läbi - leiame alati sobiva lahenduse!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+37251279380">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <Phone className="mr-2 h-4 w-4" />
                +372 512 7938
              </Button>
            </a>
            <Link href="/kontakt">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                Kirjutage meile
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
