
'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, Phone, Clock, Users, Car, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VisitFAQ() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Kas peame eelnevalt broneerima?',
      answer: 'Jah, kindlasti! Me võtame vastu ainult broneerijaid. See tagab teile personaalse tähelepanu ja parima kogemuse. Broneerida saate helistades +372 512 7938 või kodulehe kaudu.',
      icon: Clock,
      category: 'broneerimine'
    },
    {
      question: 'Kas külastus on ohutu väikelastega?',
      answer: 'Jah, täiesti ohutu! Kõik meie papagoid on inimestega harjunud ja sõbralikud. Väikelapsed peavad olema lapsevanema kontrolli all. Meie töötaja on kogu aeg kohal ja juhendab teid.',
      icon: Heart,
      category: 'ohutus'
    },
    {
      question: 'Mida peaksime kaasa võtma?',
      answer: 'Midagi erilist pole vaja! Võite kaasa võtta fotoaparaadi või telefoni (ilma välguta). Riietuge mugavalt. Papagoid armastavad erkkollaseid värve, aga see pole kohustuslik.',
      icon: Users,
      category: 'praktika'
    },
    {
      question: 'Kus saab parkida?',
      answer: 'Parkida saab otse maja ees tasuta. Parkimiskohtade puuduse korral võite parkida ka tee äärde. Asume Tartu mnt 80, Soinaste, Kambja vald.',
      icon: Car,
      category: 'praktika'
    },
    {
      question: 'Kas papagoisid saab kätte võtta?',
      answer: 'Jah! See on meie külastuse erinevus - saate papagoisid kätte võtta, nendega suhelda ja isegi fotosessiooni teha. Meie töötaja juhendab teid ohutult seda tegema.',
      icon: Star,
      category: 'kogemus'
    },
    {
      question: 'Mis juhtub, kui ilm on halb?',
      answer: 'Ilm ei mõjuta külastust - oleme siseruumides! Papagoid elavad sooja ja mugavusega meie kodus. Halb ilm võib isegi muuta kogemuse veel hubada seks.',
      icon: HelpCircle,
      category: 'praktika'
    },
    {
      question: 'Kas saame privaatselt külastada?',
      answer: 'Jah! Kõik meie külastused toimuvad väikestes gruppides või privaatselt. Me ei sega erinevaid gruppe omavahel, nii et saate nautida personaalset kogemust.',
      icon: Users,
      category: 'kogemus'
    },
    {
      question: 'Kas võime tulla sünnipäevaga?',
      answer: 'Kindlasti! Sünnipäevad on meie lemmikteemingmused. Võime isegi sünnipäevalapsele erilisel tähelepanu pöörata ja papagoid võivad laulda sünnipäevalaulu!',
      icon: Heart,
      category: 'kogemus'
    }
  ];

  const categories = [
    { key: 'kõik', name: 'Kõik küsimused', icon: HelpCircle },
    { key: 'broneerimine', name: 'Broneerimine', icon: Clock },
    { key: 'ohutus', name: 'Ohutus', icon: Heart },
    { key: 'praktika', name: 'Praktilised', icon: Car },
    { key: 'kogemus', name: 'Kogemus', icon: Star }
  ];

  const [selectedCategory, setSelectedCategory] = useState('kõik');

  const filteredFAQs = selectedCategory === 'kõik' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="py-20 bg-gradient-to-b from-papagoi-blue-50 to-white" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Korduma kippuvad <span className="text-papagoi-blue">küsimused</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Siin on vastused kõige sagedasematele küsimustele meie külastuse kohta
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.key)}
              className={`${
                selectedCategory === category.key
                  ? 'bg-papagoi-blue hover:bg-papagoi-blue-600'
                  : 'hover:bg-papagoi-blue-50 border-papagoi-blue-200'
              } font-semibold`}
            >
              <category.icon className="mr-2 h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <button
                className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-papagoi-blue-100 rounded-full p-2">
                      <faq.icon className="h-5 w-5 text-papagoi-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-left">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="ml-4">
                    {openFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>
              
              {openFAQ === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <div className="pl-12 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center bg-gradient-to-r from-papagoi-green-50 to-papagoi-blue-50 rounded-3xl p-8"
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-full mb-4">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ikka jäi <span className="text-papagoi-green">küsimusi?</span>
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Ärge kartke küsida! Oleme alati nõus põhjalikumalt selgitama ja teie muresid arutama.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+37251279380" className="papagoi-cta inline-flex items-center justify-center">
              <Phone className="mr-2 h-4 w-4" />
              Helistage +372 512 7938
            </a>
            <Link href="/kontakt" className="inline-flex items-center justify-center border-2 border-papagoi-green text-papagoi-green hover:bg-papagoi-green-50 font-semibold px-8 py-3 rounded-full transition-all">
              Kirjutage meile
            </Link>
            <Link href="/broneeri" className="papagoi-cta inline-flex items-center justify-center">
              Broneeri kohe külastus
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
