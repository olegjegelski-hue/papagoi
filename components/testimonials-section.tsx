
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ExternalLink } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import GoogleRating from './GoogleRating';

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
}

export default function TestimonialsSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [googleReviews, setGoogleReviews] = React.useState<GoogleReview[]>([]);
  const [googleReviewsLoaded, setGoogleReviewsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        const response = await fetch('/api/google-reviews');
        const data = await response.json();

        if (Array.isArray(data.reviews)) {
          // Filtreerime ainult need arvustused, kus on tekst
          const withText = data.reviews.filter(
            (review: GoogleReview) => review.text && review.text.trim().length > 0
          );

          // Võtame maksimaalselt 3–4 värskemat arvustust (järjekord tuleb Google'ist)
          setGoogleReviews(withText.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching Google reviews list:', error);
      } finally {
        setGoogleReviewsLoaded(true);
      }
    }

    fetchGoogleReviews();
  }, []);

  const formatFirstName = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[0] || fullName;
  };

  return (
    <section className="pt-4 pb-12 bg-gradient-to-b from-blue-50 to-yellow-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Mida ütlevad meie külastajad?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Allpool näed värskeid arvamusi Papagoi Keskuse külastajatelt otse Google&apos;i arvustustest.
          </p>
        </motion.div>

        {/* Google'i arvustused Google Mapsist */}
        {googleReviewsLoaded && googleReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {googleReviews.map((review, index) => (
                <div
                  key={`${review.author_name}-${index}`}
                  className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-gray-900">
                      {formatFirstName(review.author_name)}
                    </div>
                    {review.relative_time_description && (
                      <div className="text-xs text-gray-500">
                        {review.relative_time_description}
                      </div>
                    )}
                    <div className="text-xs text-blue-600 mt-1">
                      Allikas: Google&apos;i arvustused (Google Maps)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
