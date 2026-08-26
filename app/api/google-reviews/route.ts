import { NextResponse } from 'next/server';
import { fetchGooglePlaceDetails } from '@/lib/google-place-details';

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
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return errorJson({ error: 'Google Places API key not configured' });
    }

    if (!process.env.GOOGLE_PLACES_PLACE_ID) {
      return errorJson({
        error: 'GOOGLE_PLACES_PLACE_ID is not configured on the server',
      });
    }

    const details = await fetchGooglePlaceDetails();

    if (details.ok) {
      return NextResponse.json(
        {
          rating: details.data.rating,
          user_ratings_total: details.data.user_ratings_total,
          reviews: details.data.reviews,
          success: true,
          source: 'place_id'
        },
        { headers: { 'Cache-Control': SUCCESS_CACHE } }
      );
    }

    // 5xx, et ISR/CDN ei cache'iks veakeha tunniks. Kliendi fallback jääb JSON-i.
    console.error('Google Places details failed', {
      status: details.status,
      error_message: details.error_message || null
    });
    return errorJson({
      error: 'Google Places details failed',
      status: details.status,
      error_message: details.error_message || null
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return errorJson({ error: 'Failed to fetch reviews' }, 500);
  }
}
