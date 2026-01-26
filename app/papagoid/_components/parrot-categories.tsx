
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { getParrotsByCategory } from '@/lib/parrots';
import Image from 'next/image';

export default function ParrotCategories() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const categories = [
    {
      key: 'suur',
      name: 'Suured papagoid',
      description: 'Meie suuremad perekonnaliikmed - arad ja žakod',
      count: getParrotsByCategory('suur').length,
      image: 'https://images.pexels.com/photos/6796544/pexels-photo-6796544.jpeg',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50'
    },
    {
      key: 'keskmine',
      name: 'Keskmised papagoid',
      description: 'Korellid, kaeluspapagoid ja teised keskmise suurusega linnud',
      count: getParrotsByCategory('keskmine').length,
      image: 'https://images.pexels.com/photos/17566601/pexels-photo-17566601.jpeg',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'väike',
      name: 'Väikesed linnud',
      description: 'Lembelinnud, viirpapagoid ja teised väikesed perekonnaliikmed',
      count: getParrotsByCategory('väike').length,
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Budgies%2C_aka_Parakeets_or_Small_parrots.jpg',
      color: 'from-yellow-500 to-green-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Papagoid <span className="text-green-600">kategooriate</span> kaupa
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meie papagoidpered on jagatud suuruse ja liikide järgi - igal kategoorial on omad iseärasused
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20`} />
                  
                  {/* Count Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <span className="font-bold text-gray-900">{category.count}</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {category.count === 1 ? 'papagoi' : 'papagoid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-6 ${category.bgColor}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                  
                  {/* Decorative gradient bar */}
                  <div className={`w-full h-1 bg-gradient-to-r ${category.color} rounded-full mt-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Iga papagoi on <span className="text-green-600">erinev isiksus</span>
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Suurusest olenemata on iga meie papagoi ainulaadne karakter oma harjumuste, 
            lemmiktegevuste ja iseärasustega. Külastuse ajal saate iga ühega isiklikult tutvuda!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
