
'use client';

import { motion } from 'framer-motion';
import { Star, Quote, ExternalLink } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import GoogleRating from './GoogleRating';

const testimonials = [
  {
    name: 'Kadri',
    role: 'Ema kolme lapsega',
    content: 'Lapsed olid vaimustuses! Eriti meeldis Mac, kes oskas rääkida ja oli nii sõbralik. Sellist kogemust ei unusta kunagi.',
    rating: 5,
    location: 'Tartu'
  },
  {
    name: 'Marko',
    role: 'Lasteaia õpetaja',
    content: 'Viisime terve lasteaiarühma. Lapsed õppisid palju ja said papagoisid kätte võtta. Professionaalne ja turvaline kogemus.',
    rating: 5,
    location: 'Elva'
  },
  {
    name: 'Liis',
    role: 'Ettevõtte juht',
    content: 'Korraldame siin meie firma meeskonnasündmusi. Alati eriline kogemus, mis ühendab inimesi ja toob head meeleolu.',
    rating: 5,
    location: 'Kambja'
  },
  {
    name: 'Peeter',
    role: 'Pensionär',
    content: 'Käin koos lapselastega regulaarselt. Papagoid tunnevad meid juba ära ja on alati rõõmsad meid nähes!',
    rating: 5,
    location: 'Ülenurme'
  }
];

export default function TestimonialsSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="pt-4 pb-12 bg-gradient-to-b from-blue-50 to-yellow-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Mida ütlevad meie külastajad?</span>
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
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-blue-600">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google Reviews Link */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Jaga oma kogemust teistega!</h3>
            
            {/* Google Rating Display */}
            <div className="mb-6 flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block">
                <GoogleRating />
              </div>
            </div>
            
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Kui oled meid külastanud, jaga oma kogemust Google'is. Sinu arvustus aitab teisi inimesi meid leida!
            </p>
            <a
              href="https://g.page/r/CXfsGh_UtN6-EAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              <Star className="w-5 h-5 fill-current text-yellow-400" />
              <span>Jäta meile arvustus Google'is</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
