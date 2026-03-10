import apiClient from './apiClient';

const GOOGLE_PLACES_NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * fetchCompetitors searches for nearby businesses using Google Places and Overpass API (OSM)
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters
 * @param {string} type - Commercial sector/type
 * @param {string} googleApiKey - User's Google Maps API Key
 * @returns {Promise<{google: Array, overpass: Array}>}
 */
export const fetchCompetitors = async (lat, lng, radius, type, googleApiKey) => {
  const results = {
    google: [],
    overpass: []
  };

  if (googleApiKey) {
    try {
      const googleData = await apiClient.get(GOOGLE_PLACES_NEARBY_URL, {
        location: `${lat},${lng}`,
        radius,
        type,
        key: googleApiKey
      });

      const basicResults = googleData.results || [];

      // Enrich top 5 results with details (price level, business status, etc.)
      const enrichedResults = await Promise.all(
        basicResults.slice(0, 8).map(async (place) => {
          try {
            const details = await apiClient.get(GOOGLE_PLACES_DETAILS_URL, {
              place_id: place.place_id,
              fields: 'price_level,rating,user_ratings_total,business_status,vicinity,name,geometry,opening_hours',
              key: googleApiKey
            });
            return { ...place, ...details.result };
          } catch (e) {
            return place;
          }
        })
      );

      results.google = enrichedResults.length > 0 ? enrichedResults : basicResults;
    } catch (error) {
      console.error('Error fetching Google Places:', error);
    }
  }

  // Fallback or secondary data from Overpass (OSM)
  try {
    const osmQuery = `[out:json];node["shop"](around:${radius},${lat},${lng});out;`;
    const osmData = await apiClient.get(OVERPASS_URL, { data: osmQuery });
    results.overpass = osmData.elements || [];
  } catch (error) {
    console.error('Error fetching Overpass data:', error);
  }

  return results;
};

// Map Google Types to friendly names/OSM equivalents
export const COMMERCIAL_TYPES = [
  { value: 'convenience_store', label_key: 'convenience_store' },
  { value: 'grocery_or_supermarket', label_key: 'grocery_or_supermarket' },
  { value: 'cafe', label_key: 'cafe' },
  { value: 'restaurant', label_key: 'restaurant' },
  { value: 'pharmacy', label_key: 'pharmacy' },
  { value: 'clothing_store', label_key: 'clothing_store' },
  { value: 'electronics_store', label_key: 'electronics_store' },
  { value: 'furniture_store', label_key: 'furniture_store' },
  { value: 'home_goods_store', label_key: 'home_goods_store' },
  { value: 'shoe_store', label_key: 'shoe_store' }
];
