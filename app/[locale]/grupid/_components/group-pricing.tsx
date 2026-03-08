'use client';

import { motion } from 'framer-motion';
import { Calculator, TrendingDown, Gift, Phone } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function GroupPricing() {
  const t = useTranslations('GrupidPricing');
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const pricingTiers = [
    { size: t('tier1Size'), discount: '5%', price: t('tier1Price'), originalPrice: t('tier1Original'), description: t('tier1Desc'), color: 'from-blue-500 to-blue-600' },
    { size: t('tier2Size'), discount: '10%', price: t('tier2Price'), originalPrice: t('tier2Original'), description: t('tier2Desc'), color: 'from-green-500 to-green-600', popular: true },
    { size: t('tier3Size'), discount: '15%', price: t('tier3Price'), originalPrice: t('tier3Original'), description: t('tier3Desc'), color: 'from-purple-500 to-purple-600' }
  ];

  const specialOffers = [
    { title: t('offer1Title'), description: t('offer1Desc'), icon: '🎓', savings: t('offer1Savings') },
    { title: t('offer2Title'), description: t('offer2Desc'), icon: '🎉', savings: t('offer2Savings') },
    { title: t('offer3Title'), description: t('offer3Desc'), icon: '💳', savings: t('offer3Savings') },
    { title: t('offer4Title'), description: t('offer4Desc'), icon: '🏢', savings: t('offer4Savings') }
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
            <span className="text-green-600">{t('title')}</span> {t('titleSuffix')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

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
                      {t('popularBadge')}
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
                      <span className="text-sm text-gray-500">{t('perPerson')}</span>
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
                      {t('savings', { discount: tier.discount })}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {t('vsIndividual')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-card text-card-foreground border rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            <span className="text-yellow-600">{t('offersTitle')}</span> {t('offersSuffix')}
          </h3>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {specialOffers.map((offer) => (
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
              <h4 className="text-xl font-semibold text-green-800">{t('askTitle')}</h4>
            </div>
            <p className="text-green-700 mb-4">
              {t('askDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+3725127938"
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

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('exampleTitle')}</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="text-lg font-semibold text-gray-800">{t('example1Label')}</div>
                <div className="text-sm text-gray-600">{t('example1Sub')}</div>
                <div className="text-2xl font-bold text-green-600 mt-2">{t('example1Price')}</div>
                <div className="text-xs text-gray-500">{t('example1Original')}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">{t('example2Label')}</div>
                <div className="text-sm text-gray-600">{t('example2Sub')}</div>
                <div className="text-2xl font-bold text-green-600 mt-2">{t('example2Price')}</div>
                <div className="text-xs text-gray-500">{t('example2Original')}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">{t('example3Label')}</div>
                <div className="text-sm text-gray-600">{t('example3Sub')}</div>
                <div className="text-2xl font-bold text-green-600 mt-2">{t('example3Price')}</div>
                <div className="text-xs text-gray-500">{t('example3Original')}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
