
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Eye, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { getParrotsByCategory } from '@/lib/parrots';

export default function ParrotPreview() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  
  // Get featured parrots (one from each category)
  const featuredParrots = [
    getParrotsByCategory('suur')[0], // Mac
    getParrotsByCategory('keskmine')[0], // Lucky
    getParrotsByCategory('väike')[0], // Lumi
  ].filter(Boolean);

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-blue-50" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tutvuge meie <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">tähtedega</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Iga papagoi on erineva isiksusega karakter - kohtuge mõnede meie kõige huvitavate pereliikmete ja sõpradega
          </p>
        </motion.div>

        {/* Featured Parrots Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredParrots.map((parrot, index) => (
            <motion.div
              key={parrot?.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden parrot-card-hover">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-green-100 to-blue-100">
                  <Image
                    src={parrot?.imageUrl || '/placeholder.jpg'}
                    alt={`${parrot?.name} - ${parrot?.speciesEst}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Heart className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{parrot?.name}</h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-green-600 font-semibold mb-2">{parrot?.speciesEst}</p>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{parrot?.description}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Isiksus:</span> {parrot?.personality}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {parrot?.category === 'suur' ? 'Suur papagoi' : 
                       parrot?.category === 'keskmine' ? 'Keskmine papagoi' : 'Väike papagoi'}
                    </span>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gallery Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] lg:aspect-auto">
              <Image
                src="https://cdn.abacus.ai/images/79c51faf-a85c-47a7-bd68-4ef01c3037fd.png"
                alt="Meie papagoid koos - suur värvikirev pere"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Kohtuge kõigi meie <span className="text-green-600">pereliikmetega</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Igaühel on oma lugu, isiksus ja lemmiktegevused. Mõned armastavad rääkida, 
                teised eelistavad laulda, kolmandad on tõelised akrobaadid.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/papagoid">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold group">
                    Vaata kõiki papagoisid
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/broneeri">
                  <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                    Broneeri kohtumine
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          {[
            { label: 'Suuremad papagoid', value: '6', description: 'Arad ja žakod' },
            { label: 'Keskmised papagoid', value: '8', description: 'Korellid ja teised' },
            { label: 'Väiksemad linnud', value: '12', description: 'Lembelinnud ja viirpapagoid' },
            { label: 'Aastad kogemust', value: '10+', description: 'Papagoidega töötamises' }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center feature-card">
              <div className="text-3xl font-bold text-green-600 mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
