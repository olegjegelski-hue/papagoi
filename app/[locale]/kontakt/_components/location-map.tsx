
'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Car, Bus, Info } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useTranslations } from 'next-intl';
import {
  BUS_LINE,
  BUS_STOP,
  DISTANCE_FROM_TARTU_KM,
  DRIVE_TIME_FROM_TARTU_MIN,
  formatGeoCoordinates,
  googleMapsPlaceUrl,
} from '@/lib/site-facts';

const PHONE_DISPLAY = '+372 512 7938';

export default function LocationMap() {
  const t = useTranslations('LocationMap');
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const geo = formatGeoCoordinates();

  return (
    <section className="py-20 bg-gradient-to-b from-papagoi-blue-50 to-papagoi-beige-50 overflow-x-clip" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('titleBefore')} <span className="text-papagoi-green">{t('titleHighlight')}</span>
          </h2>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-200 rounded-3xl shadow-lg flex items-center justify-center"
            style={{ minHeight: '400px' }}
          >
            <div className="text-center text-gray-500">
              <MapPin className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('addressLine')}</h3>
              <p>{t('addressRegion')}</p>
              <div className="mt-4">
                <a
                  href={googleMapsPlaceUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-papagoi-green hover:bg-papagoi-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {t('viewOnMaps')}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Directions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-card text-card-foreground border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <Car className="h-6 w-6 text-papagoi-blue" />
                <h3 className="text-xl font-semibold text-gray-900">{t('byCar')}</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div>
                  <strong>{t('fromTartuLabel')}</strong> {t('fromTartu')}
                </div>
                <div>
                  <strong>{t('fromTallinnLabel')}</strong> {t('fromTallinn')}
                </div>
                <div>
                  <strong>{t('driveTimeLabel')}</strong>{' '}
                  {t('driveTime', { minutes: DRIVE_TIME_FROM_TARTU_MIN })}
                </div>
                <div className="bg-papagoi-blue-50 border border-papagoi-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-papagoi-blue" />
                    <span className="text-papagoi-blue-800 font-semibold text-sm">
                      {t('parking')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card text-card-foreground border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <Bus className="h-6 w-6 text-papagoi-blue" />
                <h3 className="text-xl font-semibold text-gray-900">{t('byBus')}</h3>
              </div>
              <div className="text-gray-700">
                {t('busInfo', { line: BUS_LINE, stop: BUS_STOP })}
              </div>
            </div>

            <div className="bg-card text-card-foreground border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <Navigation className="h-6 w-6 text-papagoi-green" />
                <h3 className="text-xl font-semibold text-gray-900">{t('tips')}</h3>
              </div>
              <div className="space-y-3 text-gray-700 text-sm">
                <div>• <strong>{t('gps')}</strong> {geo}</div>
                <div>• <strong>{t('landmarks')}</strong> {t('landmarksValue')}</div>
                <div>
                  • <strong>{t('distance')}</strong>{' '}
                  {t('distanceValue', { km: DISTANCE_FROM_TARTU_KM })}
                </div>
                <div>• <strong>{t('markAs')}</strong> {t('markAsValue')}</div>
              </div>
            </div>

            <div className="bg-papagoi-yellow-50 border border-papagoi-yellow-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Info className="h-6 w-6 text-papagoi-yellow-600" />
                <h3 className="text-lg font-semibold text-papagoi-yellow-800">{t('important')}</h3>
              </div>
              <div className="text-papagoi-yellow-700 space-y-2">
                <div>
                  <strong>{t('meetingPoint')}</strong> {t('meetingPointValue')}
                </div>
                <div>
                  <strong>{t('ifLost')}</strong> {t('ifLostValue', { phone: PHONE_DISPLAY })}
                </div>
                <div>
                  <strong>{t('onArrival')}</strong> {t('onArrivalValue')}
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href="tel:+3725127938"
                className="inline-flex items-center bg-gradient-to-r from-papagoi-green to-papagoi-blue hover:from-papagoi-green-600 hover:to-papagoi-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('callCta')}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
