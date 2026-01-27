import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const EXPLICIT_PLACE_ID = process.env.GOOGLE_PLACES_PLACE_ID;

    if (!GOOGLE_PLACES_API_KEY) {
      // Fallback to static data if API key is not configured
      return NextResponse.json({
        rating: 5.0,
        user_ratings_total: 0,
        error: 'Google Places API key not configured'
      });
    }

    if (!EXPLICIT_PLACE_ID) {
      return NextResponse.json({
        rating: 5.0,
        user_ratings_total: 0,
        error: 'GOOGLE_PLACES_PLACE_ID is not configured on the server'
      });
    }

    // Kasutame ainult Place ID-d – see on kõige kindlam ja üheselt mõistetav
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${EXPLICIT_PLACE_ID}&fields=rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status === 'OK' && detailsData.result) {
      return NextResponse.json({
        rating: detailsData.result.rating || 5.0,
        user_ratings_total: detailsData.result.user_ratings_total || 0,
        success: true,
        source: 'place_id'
      });
    }

    // Tagastame täpsema vea, et näha Google API vastust
    return NextResponse.json({
      rating: 5.0,
      user_ratings_total: 0,
      error: 'Google Places details failed',
      status: detailsData.status,
      error_message: detailsData.error_message || null
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      {
        rating: 5.0,
        user_ratings_total: 0,
        error: 'Failed to fetch reviews'
      },
      { status: 500 }
    );
  }
}
