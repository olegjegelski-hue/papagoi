
'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Kadri Mets',
    role: 'Ema kolme lapsega',
    image: 'https://i.pinimg.com/736x/3a/ec/6c/3aec6cae45e032ba3ba4c9595e9562b1.jpg',
    content: 'Lapsed olid vaimustuses! Eriti meeldis Mac, kes oskas rääkida ja oli nii sõbralik. Sellist kogemust ei unusta kunagi.',
    rating: 5,
    location: 'Tartu'
  },
  {
    name: 'Marko Kask',
    role: 'Lasteaia õpetaja',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'Viisime terve lasteaiarühma. Lapsed õppisid palju ja said papagoisid kätte võtta. Professionaalne ja turvaline kogemus.',
    rating: 5,
    location: 'Elva'
  },
  {
    name: 'Liis Tamm',
    role: 'Ettevõtte juht',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'Korraldame siin meie firma meeskonnasündmusi. Alati eriline kogemus, mis ühendab inimesi ja toob head meeleolu.',
    rating: 5,
    location: 'Kambja'
  },
  {
    name: 'Peeter Saar',
    role: 'Pensionär',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'Käin koos lapselastega regulaarselt. Papagoid tunnevad meid juba ära ja on alati rõõmsad meid nähes!',
    rating: 5,
    location: 'Ülenurme'
  }
];

export default function TestimonialsSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-yellow-50" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Mida ütlevad meie <span className="text-blue-600">külastajad?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meie külastajad on meie parim reklaam - lugege, mida nad oma kogemusest räägivad
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white rounded-3xl shadow-lg p-8 relative hover:shadow-xl transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4">
                <div className="bg-blue-500 rounded-full p-3">
                  <Quote className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-blue-600">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-8">Meie külastajad täidavad meie päeva rõõmuga</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '1000+', label: 'Rahulolu külastajat' },
              { value: '5.0', label: 'Keskmine hinnang' },
              { value: '95%', label: 'Soovitab edasi' },
              { value: '200+', label: 'Pere külastust' }
            ].map((stat, index) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-600 mb-4">
            Kas soovite ka teie saada järgmiseks rahuloleva külastajaks?
          </p>
          <div className="inline-flex items-center space-x-2 text-green-600 font-semibold">
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <span>Liituge üle 1000 rahuloleva külastajaga</span>
            <Star className="h-5 w-5 fill-current text-yellow-400" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
