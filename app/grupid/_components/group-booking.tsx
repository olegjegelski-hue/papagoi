
'use client';

import { motion } from 'framer-motion';
import { Calendar, Phone, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export default function GroupBooking() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const bookingSteps = [
    {
      step: '1',
      title: 'Võtke ühendust',
      description: 'Helistage või kirjutage meile, et arutada oma rühma vajadusi',
      action: 'Helistage või kirjutage'
    },
    {
      step: '2',
      title: 'Saate pakkumise',
      description: 'Koostame teile personaalse hinnapakkumise ja programmi',
      action: 'Hinnapakkumine 24h'
    },
    {
      step: '3',
      title: 'Kinnitage broneering',
      description: 'Valige sobiv aeg ja kinnitage oma grupikülastus',
      action: 'Broneerimine kinnitatud'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-green-500 to-blue-600 text-white relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Valmis oma <span className="text-yellow-300">grupi</span> broneerima?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Lihtne protsess - helistage või kirjutage ja saate 24 tunni jooksul personaalse pakkumise!
          </p>
        </motion.div>

        {/* Booking Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {bookingSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center relative"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/30 transition-all duration-300">
                <div className="bg-yellow-400 text-gray-900 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="opacity-90 mb-4">{step.description}</p>
                
                <div className="bg-white/10 rounded-lg px-4 py-2 text-sm font-semibold">
                  {step.action}
                </div>
              </div>
              
              {/* Connector */}
              {index < bookingSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-yellow-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Alustage oma grupikülastuse planeerimist juba täna!</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 rounded-2xl p-6">
                <Phone className="h-8 w-8 mb-3 mx-auto" />
                <h4 className="text-lg font-semibold mb-2">Helistage kohe</h4>
                <p className="text-sm opacity-90 mb-4">Kiireim viis pakkumise saamiseks</p>
                <a href="tel:+37251279380">
                  <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold w-full">
                    +372 512 7938
                  </Button>
                </a>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <Mail className="h-8 w-8 mb-3 mx-auto" />
                <h4 className="text-lg font-semibold mb-2">Kirjutage meile</h4>
                <p className="text-sm opacity-90 mb-4">Detailne info ja pakkumine 24h</p>
                <Link href="/kontakt">
                  <Button className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold w-full">
                    Saada sõnum
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
              <h4 className="text-lg font-semibold mb-3">💡 Märkused grupijuhtidele</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Palun andke teada:</strong><br />
                  • Grupi suurus ja vanus<br />
                  • Eelistatud kuupäev ja kellaaeg<br />
                  • Erivajadused või soovid
                </div>
                <div>
                  <strong>Saate vastuseks:</strong><br />
                  • Personaalse hinnapakkumise<br />
                  • Kohandatud programmi kirjelduse<br />
                  • Praktilised juhised külastuseks
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
