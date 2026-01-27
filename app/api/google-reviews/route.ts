import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!GOOGLE_PLACES_API_KEY) {
      // Fallback to static data if API key is not configured
      return NextResponse.json({
        rating: 5.0,
        user_ratings_total: 0,
        error: 'Google Places API key not configured'
      });
    }

    // Place ID for Papagoi Keskus (you may need to find the exact Place ID)
    // Alternative: use text search with name and location
    const placeName = 'Papagoi Keskus';
    const location = 'Tartu, Estonia';
    
    // First, search for the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName + ' ' + location)}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0) {
      const placeId = searchData.results[0].place_id;
      
      // Get place details including reviews
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      if (detailsData.result) {
        return NextResponse.json({
          rating: detailsData.result.rating || 5.0,
          user_ratings_total: detailsData.result.user_ratings_total || 0,
          success: true
        });
      }
    }
    
    // Fallback if place not found
    return NextResponse.json({
      rating: 5.0,
      user_ratings_total: 0,
      error: 'Place not found'
    });
    
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json({
      rating: 5.0,
      user_ratings_total: 0,
      error: 'Failed to fetch reviews'
    }, { status: 500 });
  }
}
