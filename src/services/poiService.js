import apiClient from './apiClient';

const GOOGLE_PLACES_NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

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
    } catch (error) {
      console.error('Error fetching Google Places:', error);
    }
  }

  // Fallback or additional data from Overpass (OSM)
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
  { value: 'pharmacy', label_key: 'pharmacy' }
];
