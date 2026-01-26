
'use client';

import { motion } from 'framer-motion';
import { Info, Clock, Phone, CheckCircle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export default function BookingInfo() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="py-16 bg-gradient-to-b from-green-50 to-white" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-4">
              <Info className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-blue-800">Oluline teada!</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">Pärast broneeringut:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Saate kinnituse meili teel</li>
                  <li>• Võtame teiega 24h jooksul ühendust</li>
                  <li>• Täpsustame külastuse detailid</li>
                  <li>• Saate praktilise info külastuseks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Võimalik muutma:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Kuupäeva ja kellaaega (48h ette)</li>
                  <li>• Inimeste arvu (+/- 2 inimest)</li>
                  <li>• Tühistamine tasuta 24h ette</li>
                  <li>• Ilma tingimusteta helistades</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Kinnitus 24h</h4>
              <p className="text-gray-600 text-sm">Võtame teiega ühendust ja täpsustame detailid</p>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <Phone className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Kiire abi</h4>
              <p className="text-gray-600 text-sm">Helistage +372 512 7938, kui on küsimusi</p>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">100% kindel</h4>
              <p className="text-gray-600 text-sm">Teie külastus on kinnitatud ja oodatud</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
