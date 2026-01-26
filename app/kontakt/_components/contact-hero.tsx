
'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export default function ContactHero() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50" ref={ref}>
      <div className="container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Võtke meiega <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">ühendust</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
            Oleme alati valmis teie küsimustele vastama ja aitama planeerida täiuslikku külastust meie papagoidega
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/70 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Phone className="h-8 w-8 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
              <a href="tel:+37251279380" className="text-green-600 hover:text-green-700 font-medium">
                +372 512 7938
              </a>
            </div>

            <div className="bg-white/70 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Mail className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">E-mail</h3>
              <a href="mailto:keskus@papagoi.ee" className="text-blue-600 hover:text-blue-700 font-medium">
                keskus@papagoi.ee
              </a>
            </div>

            <div className="bg-white/70 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <MapPin className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Asukoht</h3>
              <div className="text-gray-600 text-sm">
                <div>Tartu mnt 80, Soinaste</div>
                <div>Kambja vald, Tartumaa</div>
              </div>
            </div>

            <div className="bg-white/70 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Lahtiolekuajad</h3>
              <div className="text-gray-600 text-sm">
                <div>E-P kl 12:00-18:00</div>
                <div className="text-yellow-600 font-semibold">Ainult broneerides!</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
