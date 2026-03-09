import apiClient from './apiClient';

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

export const geocodeAddress = async (address, apiKey) => {
  if (!apiKey) {
    console.error('Google API Key is required for geocoding');
    return null;
  }

  try {
    const data = await apiClient.get(GOOGLE_GEOCODE_URL, {
      address: address,
      key: apiKey
    });

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        display_name: result.formatted_address,
        place_id: result.place_id
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address with Google:', error);
    return null;
  }
};
