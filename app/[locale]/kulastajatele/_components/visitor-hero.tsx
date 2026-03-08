
'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, Users, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

export default function VisitorHero() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tere tulemast meie <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">koju!</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Kõik mis teil vaja teada, et meie külastus oleks täiuslik ja meeldejääv kogemus
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="h-6 w-6 text-green-500" />
                  <span className="font-semibold text-gray-900">Lahtiolekuajad</span>
                </div>
                <div className="text-gray-700">E-P kl 12:00-18:00</div>
                <div className="text-sm text-gray-500">Igal täistunnil</div>
              </div>

              <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-6 w-6 text-blue-500" />
                  <span className="font-semibold text-gray-900">Külastus</span>
                </div>
                <div className="text-gray-700">10 EUR/inimene</div>
                <div className="text-sm text-gray-500">min 30 EUR</div>
              </div>

              <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="h-6 w-6 text-yellow-500" />
                  <span className="font-semibold text-gray-900">Asukoht</span>
                </div>
                <div className="text-gray-700">Tartu mnt 80, Soinaste</div>
                <div className="text-sm text-gray-500">Kambja vald</div>
              </div>

              <div className="bg-white/70 rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <span className="font-semibold text-gray-900">Broneerimine</span>
                </div>
                <div className="text-gray-700">Ainult eelnevalt</div>
                <div className="text-sm text-gray-500">Telefon või koduleht</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/broneeri">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 text-lg"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Broneeri kohe
                </Button>
              </Link>
              <a href="tel:+37251279380">
                <Button variant="outline" size="lg" className="border-green-500 text-green-600 hover:bg-green-50 font-semibold px-8 py-3 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Helista meile
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-3xl opacity-20 animate-pulse" />
              <Image
                src="https://cdn.abacus.ai/images/6974aef7-abf0-4482-b928-511e386f539e.png"
                alt="Pere papagoidega - külastuskogemus"
                fill
                className="object-cover rounded-3xl shadow-2xl relative z-10"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Floating Info Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1h</div>
                <div className="text-sm text-gray-600">Programm</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-600">Ohutu</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <Info className="h-6 w-6 text-yellow-600 mr-2" />
            <span className="font-semibold text-yellow-800 text-lg">Oluline teada!</span>
          </div>
          <p className="text-yellow-800 text-lg">
            <strong>Võtame vastu ainult broneerijaid!</strong> See tagab teile personaalse tähelepanu ja parima kogemuse. 
            Palun broneerige külastus ette kas helistades või kodulehe kaudu.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
