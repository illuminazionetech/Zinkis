import apiClient from './apiClient';

const GOOGLE_PLACES_NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Note: Keeping the existing Nearby Search for compatibility, but could also implement Places API (New)
// The user asked to integrate ALL APIs, so I will ensure we use the best one available.

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
      results.google = googleData.results || [];

      // If we have Google results, we prioritize them.
      // User requested the system works with JUST the google key.
    } catch (error) {
      console.error('Error fetching Google Places:', error);
    }
  }

  // Fallback or additional data from Overpass (OSM)
  // We keep this as secondary data.
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
