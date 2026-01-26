
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, Info, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parrots, getParrotsByCategory } from '@/lib/parrots';
import Link from 'next/link';

export default function ParrotGallery() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'suur' | 'keskmine' | 'väike'>('all');
  const [selectedParrot, setSelectedParrot] = useState<string | null>(null);

  const filteredParrots = selectedCategory === 'all' 
    ? parrots 
    : getParrotsByCategory(selectedCategory);

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'suur':
        return { name: 'Suured papagoid', color: 'bg-red-100 text-red-800', emoji: '🦜' };
      case 'keskmine':
        return { name: 'Keskmised papagoid', color: 'bg-blue-100 text-blue-800', emoji: '🐦' };
      case 'väike':
        return { name: 'Väikesed linnud', color: 'bg-yellow-100 text-yellow-800', emoji: '🐤' };
      default:
        return { name: 'Kõik papagoid', color: 'bg-green-100 text-green-800', emoji: '🦜' };
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="container-custom">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { key: 'all', name: 'Kõik papagoid', count: parrots.length },
            { key: 'suur', name: 'Suured', count: getParrotsByCategory('suur').length },
            { key: 'keskmine', name: 'Keskmised', count: getParrotsByCategory('keskmine').length },
            { key: 'väike', name: 'Väikesed', count: getParrotsByCategory('väike').length }
          ].map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.key as any)}
              className={`${
                selectedCategory === category.key
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'hover:bg-green-50 border-green-200'
              } font-semibold`}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Parrots Grid */}
        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="wait">
            {filteredParrots.map((parrot) => {
              const categoryInfo = getCategoryInfo(parrot.category);
              
              return (
                <motion.div
                  key={parrot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-green-100 to-blue-100">
                      <Image
                        src={parrot.imageUrl}
                        alt={`${parrot.name} - ${parrot.speciesEst}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`${categoryInfo.color} font-semibold`}>
                          {categoryInfo.emoji} {categoryInfo.name}
                        </Badge>
                      </div>
                      
                      {/* Heart Icon */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>

                    <CardContent className="p-6">
                      {/* Name and Species */}
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300">
                          {parrot.name}
                        </h3>
                        <p className="text-sm text-green-600 font-semibold">
                          {parrot.speciesEst}
                        </p>
                        <p className="text-xs text-gray-500 italic">
                          {parrot.species}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {parrot.description}
                      </p>

                      {/* Personality */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-xs font-semibold text-gray-700">Isiksus</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {parrot.personality}
                        </p>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => setSelectedParrot(selectedParrot === parrot.id ? null : parrot.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-green-200 text-green-600 hover:bg-green-50 group/btn"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        {selectedParrot === parrot.id ? 'Peida info' : 'Rohkem infot'}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>

                      {/* Expanded Info */}
                      <AnimatePresence>
                        {selectedParrot === parrot.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Liik:</span>
                                <span className="text-gray-600 ml-2">{parrot.species}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Kategooria:</span>
                                <span className="text-gray-600 ml-2">
                                  {parrot.category === 'suur' ? 'Suur papagoi' :
                                   parrot.category === 'keskmine' ? 'Keskmine papagoi' : 
                                   'Väike lind'}
                                </span>
                              </div>
                              <div className="pt-2">
                                <p className="text-gray-700 leading-relaxed">
                                  {parrot.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Soovite meie papagoidega kohtuda? 🦜
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Broneerige külastus ja kogege nende imelisi isiksusi reaalselt!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/broneeri">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
                >
                  Broneeri külastus
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/kulastajatele">
                <Button variant="outline" size="lg" className="border-green-500 text-green-600 hover:bg-green-50">
                  Külastuse info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
