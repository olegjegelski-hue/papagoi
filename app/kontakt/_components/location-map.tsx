
'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Car, Info } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export default function LocationMap() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Kuidas meie <span className="text-green-600">juurde jõuda?</span>
          </h2>
          <p className="text-lg text-gray-600">
            Asume Tartu lähistel, hõlpsa ligipääsuga nii autoga kui ühistranspordiga
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-200 rounded-3xl shadow-lg flex items-center justify-center"
            style={{ minHeight: '400px' }}
          >
            <div className="text-center text-gray-500">
              <MapPin className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tartu mnt 80, Soinaste</h3>
              <p>Kambja vald, Tartumaa</p>
              <div className="mt-4">
                <a
                  href="https://maps.google.com/?q=Tartu+mnt+80+Soinaste+Kambja+vald"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Vaata Google Mapsist
                </a>
              </div>
            </div>
          </motion.div>

          {/* Directions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Car className="h-6 w-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900">Autoga</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div>
                  <strong>Tartust:</strong> Tartu-Võru mnt (E263) suunas Ülenurme, 
                  umbes 8 km pärast Tartust pöörake paremale Soinaste suunas
                </div>
                <div>
                  <strong>Tallinnast:</strong> A2 kaudu Tartu suunas, seejärel Tartu-Võru mnt
                </div>
                <div>
                  <strong>Sõiduaeg Tartust:</strong> ~15 minutit
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800 font-semibold text-sm">
                      Parkimine tasuta maja ees või tee äärde
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Navigation className="h-6 w-6 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900">Kasulikud nipid</h3>
              </div>
              <div className="space-y-3 text-gray-700 text-sm">
                <div>• <strong>GPS koordinaadid:</strong> 58.3485, 26.8239</div>
                <div>• <strong>Orientiirid:</strong> Kambja vald, Soinaste küla</div>
                <div>• <strong>Lähedus:</strong> ~8 km Tartu kesklinnast</div>
                <div>• <strong>Märkida:</strong> Tartu mnt 80 (sama mis E263)</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Info className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Oluline!</h3>
              </div>
              <div className="text-yellow-700 space-y-2">
                <div>
                  <strong>Kohtumiskoht:</strong> Tuleme teid vastu õue või ukse juurde
                </div>
                <div>
                  <strong>Kui ekslesite:</strong> Helistage +372 512 7938
                </div>
                <div>
                  <strong>Kohale jõudes:</strong> Andke meile märku, et olete kohal
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href="tel:+37251279380"
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Helistage, kui tekivad küsimused
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
