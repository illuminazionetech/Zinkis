import apiClient from './apiClient';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export const geocodeAddress = async (address) => {
  try {
    const data = await apiClient.get(NOMINATIM_URL, {
      q: address,
      format: 'json',
      limit: 1
    });

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};
