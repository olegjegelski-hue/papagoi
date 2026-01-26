
'use client';

import { motion } from 'framer-motion';
import { Calculator, TrendingDown, Gift, Phone } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GroupPricing() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const pricingTiers = [
    {
      size: '10-14 inimest',
      discount: '5%',
      price: '9.50',
      originalPrice: '10.00',
      description: 'Väikesed grupid',
      color: 'from-blue-500 to-blue-600'
    },
    {
      size: '15-24 inimest',
      discount: '10%',
      price: '9.00',
      originalPrice: '10.00',
      description: 'Keskmised grupid',
      color: 'from-green-500 to-green-600',
      popular: true
    },
    {
      size: '25+ inimest',
      discount: '15%',
      price: '8.50',
      originalPrice: '10.00',
      description: 'Suured grupid',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const specialOffers = [
    {
      title: 'Koolide erisoodustus',
      description: 'Lisaks gruppide allahindlusele saavad haridusasutused veel 5% lisaallahindlust',
      icon: '🎓',
      savings: 'Kuni 20% kokkuhoid'
    },
    {
      title: 'Sünnipäevapakeitid',
      description: 'Sünnipäeva tähistamisel saab sünnipäevalaps tasuta külastuse',
      icon: '🎉',
      savings: 'Üks külastus tasuta'
    },
    {
      title: 'Regulaarklientide kaart',
      description: '3 külastuse järel saab 4. külastuse 50% allahindlusega',
      icon: '💳',
      savings: '50% 4. külastusel'
    },
    {
      title: 'Suurettevõtte pakett',
      description: 'Üle 50 inimese gruppidele individuaalne läbirääkimine',
      icon: '🏢',
      savings: 'Ind. hinnapakkumine'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Calculator className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-green-600">Grupihinde</span> ja soodustused
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Suuremad grupid saavad märkimisväärseid allahindlusi - mida suurem grupp, seda soodsam hind!
          </p>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.size}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className={`h-full relative ${tier.popular ? 'ring-2 ring-green-500 shadow-xl scale-105' : 'hover:shadow-xl'} transition-all duration-300`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Kõige populaarsem
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${tier.color} mb-4 mx-auto`}>
                    <TrendingDown className="h-8 w-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {tier.size}
                  </CardTitle>
                  
                  <div className="text-sm text-gray-600 mb-4">{tier.description}</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-gray-900">{tier.price} EUR</span>
                      <span className="text-sm text-gray-500">/inimene</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm line-through text-gray-400">{tier.originalPrice} EUR</span>
                      <span className={`text-sm font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                        -{tier.discount}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className={`text-center p-4 rounded-lg bg-gradient-to-r ${tier.color.replace('500', '50').replace('600', '100')}`}>
                    <div className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                      Säästetesete {tier.discount}!
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Võrreldes individuaalhinnaga
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Special Offers */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            <span className="text-yellow-600">Eripakkumised</span> ja soodustused
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {specialOffers.map((offer, index) => (
              <div key={offer.title} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{offer.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h4>
                    <p className="text-gray-700 mb-3">{offer.description}</p>
                    <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {offer.savings}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-green-600 mr-3" />
              <h4 className="text-xl font-semibold text-green-800">Küsi individuaalset pakkumist!</h4>
            </div>
            <p className="text-green-700 mb-4">
              Iga grupp on erinev ja me tahame pakkuda teile parimat võimalikku hinda. 
              Helistage või kirjutage meile ja arutame koos teie vajadused läbi!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+37251279380" 
                className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Phone className="mr-2 h-4 w-4" />
                +372 512 7938
              </a>
              <span className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                keskus@papagoi.ee
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pricing Calculator Example */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Näidiskalkulatsioon</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <div className="text-lg font-semibold text-gray-800">20 õpilast + 2 õpetajat</div>
              <div className="text-sm text-gray-600">Kool, 15+ grupi soodustus</div>
              <div className="text-2xl font-bold text-green-600 mt-2">162 EUR</div>
              <div className="text-xs text-gray-500">Tavahind 200 EUR</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">15 töötajat</div>
              <div className="text-sm text-gray-600">Ettevõte, teambuilding</div>
              <div className="text-2xl font-bold text-green-600 mt-2">135 EUR</div>
              <div className="text-xs text-gray-500">Tavahind 150 EUR</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">8 last + 2 täiskasvanut</div>
              <div className="text-sm text-gray-600">Sünnipäev, 1 laps tasuta</div>
              <div className="text-2xl font-bold text-green-600 mt-2">90 EUR</div>
              <div className="text-xs text-gray-500">Tavahind 100 EUR</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
