import { NextResponse } from 'next/server';

/** Tunni ISR. force-dynamic võitleks revalidate'iga ja nulliks CDN-cache'i (max-age=0). */
export const revalidate = 3600;

const SUCCESS_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400';
const NO_STORE = 'no-store, max-age=0';

const FALLBACK = {
  rating: 5.0,
  user_ratings_total: 0,
  reviews: [] as unknown[],
};

function errorJson(extra: Record<string, unknown>, status = 503) {
  return NextResponse.json(
    { ...FALLBACK, ...extra },
    { status, headers: { 'Cache-Control': NO_STORE } }
  );
}

export async function GET() {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const EXPLICIT_PLACE_ID = process.env.GOOGLE_PLACES_PLACE_ID;

    if (!GOOGLE_PLACES_API_KEY) {
      return errorJson({ error: 'Google Places API key not configured' });
    }

    if (!EXPLICIT_PLACE_ID) {
      return errorJson({
        error: 'GOOGLE_PLACES_PLACE_ID is not configured on the server',
      });
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${EXPLICIT_PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${GOOGLE_PLACES_API_KEY}`;

    const detailsResponse = await fetch(detailsUrl, {
      next: { revalidate: 3600 },
    });
    const detailsData = await detailsResponse.json();

    if (detailsData.status === 'OK' && detailsData.result) {
      const reviews = Array.isArray(detailsData.result.reviews)
        ? detailsData.result.reviews.map((review: any) => ({
            author_name: review.author_name,
            rating: review.rating,
            text: review.text,
            relative_time_description: review.relative_time_description,
            profile_photo_url: review.profile_photo_url,
            time: review.time
          }))
        : [];

      return NextResponse.json(
        {
          rating: detailsData.result.rating || 5.0,
          user_ratings_total: detailsData.result.user_ratings_total || 0,
          reviews,
          success: true,
          source: 'place_id'
        },
        { headers: { 'Cache-Control': SUCCESS_CACHE } }
      );
    }

    // 5xx, et ISR/CDN ei cache'iks veakeha tunniks. Kliendi fallback jääb JSON-i.
    console.error('Google Places details failed', {
      status: detailsData.status,
      error_message: detailsData.error_message || null
    });
    return errorJson({
      error: 'Google Places details failed',
      status: detailsData.status,
      error_message: detailsData.error_message || null
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return errorJson({ error: 'Failed to fetch reviews' }, 500);
  }
}
