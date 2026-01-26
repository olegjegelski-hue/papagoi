
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import CountUp from '@/components/count-up';
import { totalParrots, totalSpecies } from '@/lib/parrots';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="https://cdn.abacus.ai/images/107712c6-9893-4c52-be8f-044970d7080d.png"
            alt="Papagoi Keskus - kaunis papagoidekeskus"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-yellow-500/10" />
        </div>
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Eesti ainulaadne{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-yellow-500">
                papagoidekeskus
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-700 mt-6 max-w-2xl"
            >
              Kohtuge meie suure perega - <CountUp end={totalParrots} duration={2} /> papagoid{' '}
              <CountUp end={totalSpecies} duration={2} /> erinevast liigist ootavad teid!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-gray-600 mt-4"
            >
              Ainulaadne kogemus kogu perele - papagoid elavad koos meiega nagu üks suur pere.
            </motion.p>

            {/* Quick Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
            >
              <div className="feature-card text-center">
                <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">Asukoht</div>
                <div className="text-xs text-gray-600">Tartu mnt 80, Kambja</div>
              </div>
              <div className="feature-card text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">Avatud</div>
                <div className="text-xs text-gray-600">E-P 12:00-18:00</div>
              </div>
              <div className="feature-card text-center">
                <Users className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">Külastus</div>
                <div className="text-xs text-gray-600">Ainult broneerides</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start"
            >
              <Link href="/broneeri">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 text-lg group btn-hover-lift">
                  Broneeri külastus
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/papagoid">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold px-8 py-3 text-lg btn-hover-lift"
                >
                  Tutvuge papagoidega
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <Image
                src="https://cdn.abacus.ai/images/6974aef7-abf0-4482-b928-511e386f539e.png"
                alt="Pere papagoidega - südamlik kogemus"
                fill
                className="object-cover rounded-3xl shadow-2xl relative z-10"
                priority
              />
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  <CountUp end={totalParrots} duration={2} />+
                </div>
                <div className="text-sm text-gray-600">papagoid</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  <CountUp end={totalSpecies} duration={2} />
                </div>
                <div className="text-sm text-gray-600">liiki</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
