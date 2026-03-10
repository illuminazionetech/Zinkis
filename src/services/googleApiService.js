import apiClient from './apiClient';

/**
 * Google Maps Platform API Service
 * Handles specialized data points: Air Quality, Pollen, Solar, Elevation, etc.
 */

const AIR_QUALITY_URL = 'https://airquality.googleapis.com/v1/currentConditions:lookup';
const POLLEN_URL = 'https://pollen.googleapis.com/v1/forecast:lookup';
const SOLAR_URL = 'https://solar.googleapis.com/v1/buildingInsights:findClosest';
const ELEVATION_URL = 'https://maps.googleapis.com/maps/api/elevation/json';
const DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const TIMEZONE_URL = 'https://maps.googleapis.com/maps/api/timezone/json';
const ADDRESS_VALIDATION_URL = 'https://addressvalidation.googleapis.com/v1:validateAddress';
const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

/**
 * Air Quality API
 */
export const fetchAirQuality = async (lat, lng, apiKey) => {
  if (!apiKey) return null;
  try {
    return await apiClient.post(`${AIR_QUALITY_URL}?key=${apiKey}`, {
      location: { latitude: lat, longitude: lng },
      extraComputations: ["HEALTH_ADVISORY", "POLLUTANT_ADDITIONAL_INFO"]
    }, {
      'X-Goog-Api-Key': apiKey
    });
  } catch (error) {
    console.error('Air Quality Fetch Error:', error);
    return null;
  }
};

/**
 * Routes (New) API
 */
export const fetchRoutes = async (origin, destination, apiKey) => {
  if (!apiKey) return null;
  try {
    return await apiClient.post(`${ROUTES_URL}?key=${apiKey}`, {
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } }
      },
      destination: {
        location: { latLng: { latitude: destination.lat, longitude: destination.lng } }
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE'
    });
  } catch (error) {
    console.error('Routes API Error:', error);
    return null;
  }
};

/**
 * Time Zone API
 */
export const fetchTimeZone = async (lat, lng, apiKey) => {
  if (!apiKey) return null;
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    return await apiClient.get(TIMEZONE_URL, {
      location: `${lat},${lng}`,
      timestamp: timestamp,
      key: apiKey
    });
  } catch (error) {
    console.error('TimeZone API Error:', error);
    return null;
  }
};

/**
 * Address Validation API
 */
export const validateAddress = async (address, apiKey) => {
  if (!apiKey) return null;
  try {
    return await apiClient.post(`${ADDRESS_VALIDATION_URL}?key=${apiKey}`, {
      address: {
        addressLines: [address]
      }
    }, {
      'X-Goog-Api-Key': apiKey
    });
  } catch (error) {
    console.error('Address Validation API Error:', error);
    return null;
  }
};

/**
 * Pollen API
 */
export const fetchPollen = async (lat, lng, apiKey) => {
  if (!apiKey) return null;
  try {
    return await apiClient.get(POLLEN_URL, {
      'location.latitude': lat,
      'location.longitude': lng,
      'days': 1,
      'key': apiKey
    });
  } catch (error) {
    console.error('Pollen API Error:', error);
    return null;
  }
};

/**
 * Solar (Building Insights) API
 */
export const fetchSolar = async (lat, lng, apiKey) => {
  if (!apiKey) return null;
  try {
    return await apiClient.get(SOLAR_URL, {
      'location.latitude': lat,
      'location.longitude': lng,
      'key': apiKey
    });
  } catch (error) {
    console.error('Solar API Error:', error);
    return null;
  }
};

/**
 * Elevation API
 */
export const fetchElevation = async (lat, lng, apiKey) => {
  if (!apiKey) return null;
  try {
    return await apiClient.get(ELEVATION_URL, {
      locations: `${lat},${lng}`,
      key: apiKey
    });
  } catch (error) {
    console.error('Elevation API Error:', error);
    return null;
  }
};

/**
 * Distance Matrix API
 */
export const fetchDistanceMatrix = async (origin, destinations, apiKey) => {
  if (!apiKey || !destinations.length) return null;
  try {
    const destString = destinations.map(d => `${d.lat},${d.lng}`).join('|');
    return await apiClient.get(DISTANCE_MATRIX_URL, {
      origins: `${origin.lat},${origin.lng}`,
      destinations: destString,
      mode: 'driving',
      key: apiKey
    });
  } catch (error) {
    console.error('Distance Matrix API Error:', error);
    return null;
  }
};
