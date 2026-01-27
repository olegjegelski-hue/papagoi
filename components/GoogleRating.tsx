'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface GoogleRatingData {
  rating: number;
  user_ratings_total: number;
  error?: string;
}

export default function GoogleRating() {
  const [ratingData, setRatingData] = useState<GoogleRatingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRating() {
      try {
        const response = await fetch('/api/google-reviews');
        const data = await response.json();
        setRatingData(data);
      } catch (error) {
        console.error('Error fetching Google rating:', error);
        // Fallback to default values
        setRatingData({ rating: 5.0, user_ratings_total: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchRating();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-white">...</span>
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-current text-yellow-400" />
            ))}
          </div>
        </div>
        <span className="text-white/90 text-sm">Laadimine...</span>
      </div>
    );
  }

  if (!ratingData) {
    return null;
  }

  const rating = ratingData.rating || 5.0;
  const reviewCount = ratingData.user_ratings_total || 0;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-3xl font-bold text-white">{rating.toFixed(1)}</span>
        <div className="flex items-center space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-6 w-6 ${
                i < Math.floor(rating) 
                  ? 'fill-current text-yellow-400' 
                  : i < rating 
                    ? 'fill-current text-yellow-200' 
                    : 'text-white/30'
              }`} 
            />
          ))}
        </div>
      </div>
      <span className="text-white/90 text-sm">
        {reviewCount > 0 ? `${reviewCount} arvustust` : 'Arvustused'}
      </span>
    </div>
  );
}
