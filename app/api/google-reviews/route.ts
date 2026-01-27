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

    // If Place ID is configured explicitly, use that (kõige kindlam variant)
    if (EXPLICIT_PLACE_ID) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${EXPLICIT_PLACE_ID}&fields=rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.result) {
        return NextResponse.json({
          rating: detailsData.result.rating || 5.0,
          user_ratings_total: detailsData.result.user_ratings_total || 0,
          success: true,
          source: 'place_id'
        });
      }

      // Kui midagi läks valesti, logime ja kukume allapoole textsearch variandi peale
      console.error('Google Places details error:', detailsData);
    }

    // ------------------------------
    // Fallback: Text Search variandi kasutamine
    // ------------------------------
    const placeName = 'Papagoi Keskus';
    const fullAddress = 'Papagoi Keskus, Tartu mnt 80, Soinaste, Kambja vald, Estonia';

    // Text Search – proovime kõigepealt täpset aadressi
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      fullAddress
    )}&type=establishment&region=ee&key=${GOOGLE_PLACES_API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
      const placeId = searchData.results[0].place_id;

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.result) {
        return NextResponse.json({
          rating: detailsData.result.rating || 5.0,
          user_ratings_total: detailsData.result.user_ratings_total || 0,
          success: true,
          source: 'textsearch',
          placeId
        });
      }

      console.error('Google Places details (from textsearch) error:', detailsData);
    } else {
      console.error('Google Places textsearch error:', searchData);
    }

    // Fallback if place not found
    return NextResponse.json({
      rating: 5.0,
      user_ratings_total: 0,
      error: 'Place not found (configure GOOGLE_PLACES_PLACE_ID for reliable results)'
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
