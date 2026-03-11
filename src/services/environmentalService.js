import apiClient from './apiClient';

/**
 * Free/Open Source Environmental and Logistics Services
 */

const OPEN_ELEVATION_URL = 'https://api.open-elevation.com/api/v1/lookup';
const WAQI_URL = 'https://api.waqi.info/feed/geo'; // Requires token, but has a free tier
const OPENAQ_URL = 'https://api.openaq.org/v2/latest';
const OSRM_URL = 'https://router.project-osrm.org/table/v1/driving';
const WORLD_TIME_URL = 'https://worldtimeapi.org/api/timezone/etc/utc'; // Basic fallback

/**
 * Air Quality (OpenAQ - Free/Open)
 */
export const fetchAirQualityFree = async (lat, lng) => {
  try {
    const data = await apiClient.get(OPENAQ_URL, {
      coordinates: `${lat},${lng}`,
      radius: 10000,
      limit: 1
    });
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      // Normalize to a structure similar to what the UI expects
      return {
        indexes: [{
          aqi: result.measurements[0].value,
          category: getAQICategory(result.measurements[0].value, result.measurements[0].unit)
        }]
      };
    }
    return null;
  } catch (error) {
    console.error('Free Air Quality Error:', error);
    return null;
  }
};

const getAQICategory = (value, unit) => {
  if (unit === 'µg/m³') {
    if (value < 12) return 'Good';
    if (value < 35) return 'Moderate';
    return 'Poor';
  }
  return 'Unknown';
};

/**
 * Elevation (Open-Elevation - Free)
 */
export const fetchElevationFree = async (lat, lng) => {
  try {
    const data = await apiClient.get(OPEN_ELEVATION_URL, {
      locations: `${lat},${lng}`
    });
    return {
      results: data.results.map(r => ({ elevation: r.elevation }))
    };
  } catch (error) {
    console.error('Free Elevation Error:', error);
    return null;
  }
};

/**
 * Logistics/Distances (OSRM - Free)
 */
export const fetchDistancesFree = async (origin, destinations) => {
  if (!destinations.length) return null;
  try {
    const coords = [
      `${origin.lng},${origin.lat}`,
      ...destinations.map(d => `${d.lng},${d.lat}`)
    ].join(';');

    const data = await apiClient.get(`${OSRM_URL}/${coords}`, {
      sources: '0',
      annotations: 'duration,distance'
    });

    if (data.code === 'Ok') {
      return {
        rows: [{
          elements: data.distances[0].slice(1).map((dist, i) => ({
            distance: { text: (dist / 1000).toFixed(1) + ' km', value: dist },
            duration: { text: Math.round(data.durations[0][i+1] / 60) + ' min', value: data.durations[0][i+1] }
          }))
        }]
      };
    }
    return null;
  } catch (error) {
    console.error('Free OSRM Error:', error);
    return null;
  }
};

/**
 * TimeZone (Approximation based on longitude if API fails)
 */
export const fetchTimeZoneFree = async (lat, lng) => {
  try {
    // We can use a simple library or just approximate for a "totally free" version
    // without even a public API call that might be rate limited.
    // However, let's try a free API first.
    const offset = Math.round(lng / 15);
    const tzName = `UTC${offset >= 0 ? '+' : ''}${offset}`;
    return {
      timeZoneId: 'Etc/GMT' + (offset > 0 ? '-' : '+') + Math.abs(offset),
      timeZoneName: tzName
    };
  } catch (error) {
    return null;
  }
};
