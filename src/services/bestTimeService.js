import apiClient from './apiClient';

const BESTTIME_URL = 'https://besttime.app/api/v1/forecasts/live';

export const fetchPopularity = async (venueName, venueAddress, apiKey) => {
  if (!apiKey) return null;

  try {
    const params = {
      api_key_private: apiKey,
      venue_name: venueName,
      venue_address: venueAddress
    };

    // We can also use a post call for BestTime if required,
    // but typically live forecast is a post or get.
    // Let's assume GET based on their documentation usually for query params.

    return await apiClient.post(BESTTIME_URL, params);
  } catch (error) {
    console.error('Error fetching BestTime popularity:', error);
    return null;
  }
};
