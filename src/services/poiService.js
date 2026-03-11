import apiClient from './apiClient';

const GOOGLE_PLACES_NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Map Google Types to friendly names/OSM equivalents
 */
export const COMMERCIAL_TYPES = [
  { value: 'convenience_store', label_key: 'convenience_store', osm_tag: 'shop', osm_value: 'convenience' },
  { value: 'grocery_or_supermarket', label_key: 'grocery_or_supermarket', osm_tag: 'shop', osm_value: 'supermarket' },
  { value: 'cafe', label_key: 'cafe', osm_tag: 'amenity', osm_value: 'cafe' },
  { value: 'restaurant', label_key: 'restaurant', osm_tag: 'amenity', osm_value: 'restaurant' },
  { value: 'pharmacy', label_key: 'pharmacy', osm_tag: 'amenity', osm_value: 'pharmacy' },
  { value: 'clothing_store', label_key: 'clothing_store', osm_tag: 'shop', osm_value: 'clothes' },
  { value: 'electronics_store', label_key: 'electronics_store', osm_tag: 'shop', osm_value: 'electronics' },
  { value: 'furniture_store', label_key: 'furniture_store', osm_tag: 'shop', osm_value: 'furniture' },
  { value: 'home_goods_store', label_key: 'home_goods_store', osm_tag: 'shop', osm_value: 'houseware' },
  { value: 'shoe_store', label_key: 'shoe_store', osm_tag: 'shop', osm_value: 'shoes' }
];

/**
 * fetchCompetitors searches for nearby businesses using Google Places and Overpass API (OSM)
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters
 * @param {string} type - Commercial sector/type (Google type)
 * @param {string} googleApiKey - User's Google Maps API Key
 * @returns {Promise<{google: Array, overpass: Array}>}
 */
export const fetchCompetitors = async (lat, lng, radius, type, googleApiKey) => {
  const results = {
    google: [],
    overpass: []
  };

  const sectorInfo = COMMERCIAL_TYPES.find(t => t.value === type) || COMMERCIAL_TYPES[0];

  // Parallel fetch: OSM (always) and Google (if key available)
  const fetchPromises = [];

  // Overpass Fetch (Free)
  const osmQuery = `
    [out:json][timeout:25];
    (
      node["${sectorInfo.osm_tag}"="${sectorInfo.osm_value}"](around:${radius},${lat},${lng});
      way["${sectorInfo.osm_tag}"="${sectorInfo.osm_value}"](around:${radius},${lat},${lng});
      relation["${sectorInfo.osm_tag}"="${sectorInfo.osm_value}"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  fetchPromises.push(
    apiClient.get(OVERPASS_URL, { data: osmQuery })
      .then(osmData => {
        results.overpass = (osmData.elements || []).map(el => ({
          ...el,
          lat: el.lat || (el.center && el.center.lat),
          lon: el.lon || (el.center && el.center.lon)
        }));
      })
      .catch(err => console.error('Overpass Error:', err))
  );

  // Google Fetch (If key provided)
  if (googleApiKey) {
    fetchPromises.push(
      apiClient.get(GOOGLE_PLACES_NEARBY_URL, {
        location: `${lat},${lng}`,
        radius,
        type,
        key: googleApiKey
      })
      .then(async (googleData) => {
        const basicResults = googleData.results || [];
        const enrichedResults = await Promise.all(
          basicResults.slice(0, 8).map(async (place) => {
            try {
              const details = await apiClient.get(GOOGLE_PLACES_DETAILS_URL, {
                place_id: place.place_id,
                fields: 'price_level,rating,user_ratings_total,business_status,vicinity,name,geometry,opening_hours,website,formatted_phone_number',
                key: googleApiKey
              });
              return { ...place, ...details.result };
            } catch (e) {
              return place;
            }
          })
        );
        results.google = enrichedResults.length > 0 ? enrichedResults : basicResults;
      })
      .catch(err => console.error('Google Places Error:', err))
    );
  }

  await Promise.allSettled(fetchPromises);

  return results;
};
