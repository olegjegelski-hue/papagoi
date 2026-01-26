
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export default function CTASection() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 cta-gradient" />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 opacity-30">
        <Image
          src="https://cdn.abacus.ai/images/6974aef7-abf0-4482-b928-511e386f539e.png"
          alt="Pere papagoidega"
          fill
          className="object-cover parallax-element"
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Valmis meie <span className="text-yellow-300">perega tutvumaks?</span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Broneerige külastus juba täna ja kogege midagi erilist! 
            Meie papagoid ootavad teid alati rõõmuga.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-effect rounded-2xl p-6 text-center"
            >
              <Calendar className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lihtne broneerimine</h3>
              <p className="text-sm opacity-90">Broneerige online või helistage meile</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-effect rounded-2xl p-6 text-center"
            >
              <div className="text-3xl mb-4">🦜</div>
              <h3 className="text-lg font-semibold mb-2">Ainulaadne kogemus</h3>
              <p className="text-sm opacity-90">Midagi sellist ei leia mujalt Eestis</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-effect rounded-2xl p-6 text-center"
            >
              <div className="text-3xl mb-4">❤️</div>
              <h3 className="text-lg font-semibold mb-2">Meeldejäävad mälestused</h3>
              <p className="text-sm opacity-90">Kogemus, mida ei unusta kunagi</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/broneeri">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-xl group btn-hover-lift"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Broneeri kohe külastus
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <div className="flex items-center space-x-4 text-white/90">
              <div className="text-sm">või</div>
              <a 
                href="tel:+37251279380" 
                className="flex items-center space-x-2 hover:text-yellow-300 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+372 512 7938</span>
              </a>
            </div>
          </motion.div>

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-12 pt-8 border-t border-white/20"
          >
            <p className="text-lg mb-2">
              <strong>Garanteerime üllatavaid emotsioone!</strong>
            </p>
            <p className="text-sm opacity-80">
              Kui ei ole rahul, tagastame raha. Aga seda pole veel juhtunud! 😊
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
    </section>
  );
}
