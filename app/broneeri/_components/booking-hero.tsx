
'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Euro, Users } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export default function BookingHero() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50" ref={ref}>
      <div className="container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Broneeri oma <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">külastus</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Täitke lihtne vorm ja saate kohese kinnituse. Võtame teiega ühendust täpsustuste tegemiseks.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/70 rounded-xl p-4 shadow-lg">
              <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">Aeg</div>
              <div className="text-xs text-gray-600">E-P 12-18</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow-lg">
              <Euro className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">Hind</div>
              <div className="text-xs text-gray-600">10 EUR/inimene</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow-lg">
              <Users className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">Minim</div>
              <div className="text-xs text-gray-600">30 EUR kokku</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow-lg">
              <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">Ette</div>
              <div className="text-xs text-gray-600">Broneerimine</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
