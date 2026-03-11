import apiClient from './apiClient';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export const geocodeAddress = async (address) => {
  try {
    const data = await apiClient.get(NOMINATIM_URL, {
      q: address,
      format: 'json',
      addressdetails: 1,
      limit: 1
    });

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        place_id: result.place_id
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address with Nominatim:', error);
    return null;
  }
};
