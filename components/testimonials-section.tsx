
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
  time?: number;
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
          const withText = data.reviews.filter(
            (review: GoogleReview) => review.text && review.text.trim().length > 0
          );
          const byNewest = [...withText].sort((a, b) => (b.time ?? 0) - (a.time ?? 0));
          setGoogleReviews(byNewest.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching Google reviews:', error);
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
    <section className="pt-0 pb-12 bg-gradient-to-b from-papagoi-blue-50 to-papagoi-yellow-50 papagoi-section-pattern" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-papagoi-green to-papagoi-blue bg-clip-text text-transparent">
              Mida ütlevad meie külastajad?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-0">
            Allpool näed värskeid arvamusi Papagoi Keskuse külastajatelt otse Google&apos;i arvustustest.
          </p>
        </motion.div>

        {/* Üldine Google reiting enne arvustuste loendit */}
        <div className="mt-1 mb-3 flex justify-center">
          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-3xl px-6 py-4 text-white inline-block shadow-lg">
            <GoogleRating />
          </div>
        </div>

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
                    <div className="text-xs text-papagoi-blue mt-1">
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
          <div className="bg-gradient-to-r from-papagoi-green to-papagoi-blue rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Jaga oma kogemust teistega!</h3>

            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Kui oled meid külastanud, jaga oma kogemust Google'is. Sinu arvustus aitab teisi inimesi meid leida!
            </p>
            <a
              href="https://g.page/r/CXfsGh_UtN6-EAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="papagoi-cta-white inline-flex items-center justify-center space-x-2"
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
