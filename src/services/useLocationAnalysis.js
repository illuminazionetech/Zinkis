import { useAnalysis } from './AnalysisContext';
import { geocodeAddress } from './geocodingService';
import { fetchCompetitors } from './poiService';
import {
  fetchAirQuality,
  fetchPollen,
  fetchSolar,
  fetchElevation,
  fetchTimeZone,
  validateAddress,
  fetchDistanceMatrix
} from './googleApiService';

// Fallback API Key (Note: In a real app this should be handled by the backend)
const DEFAULT_GOOGLE_KEY = 'YOUR_DEFAULT_API_KEY_HERE';

export const useLocationAnalysis = () => {
  const {
    apiKeys,
    setIsLoading,
    setError,
    setCurrentLocation,
    setCompetitors,
    setSearchRadius,
    setSelectedCompetitor,
    setPopularityData,
    setEnvironmentalData,
    t
  } = useAnalysis();

  const handleSearch = async ({ address, sector, radius }) => {
    const activeKey = apiKeys.google || DEFAULT_GOOGLE_KEY;

    setIsLoading(true);
    setError(null);
    setSearchRadius(radius);
    setPopularityData(null);
    setSelectedCompetitor(null);
    setEnvironmentalData({
      airQuality: null,
      pollen: null,
      solar: null,
      elevation: null,
      timeZone: null,
      addressValidation: null,
      distances: null
    });

    try {
      const geo = await geocodeAddress(address, activeKey);
      if (geo) {
        setCurrentLocation(geo);

        // First batch: Geolocation-based data
        const results = await Promise.allSettled([
          fetchCompetitors(geo.lat, geo.lng, radius, sector, activeKey),
          fetchAirQuality(geo.lat, geo.lng, activeKey),
          fetchPollen(geo.lat, geo.lng, activeKey),
          fetchSolar(geo.lat, geo.lng, activeKey),
          fetchElevation(geo.lat, geo.lng, activeKey),
          fetchTimeZone(geo.lat, geo.lng, activeKey),
          validateAddress(address, activeKey)
        ]);

        const [compsRes, aqRes, pollenRes, solarRes, elevRes, tzRes, addrRes] = results;

        const foundCompetitors = compsRes.status === 'fulfilled' ? compsRes.value : { google: [], overpass: [] };
        setCompetitors(foundCompetitors);

        // Second batch: Logistics/Distances (requires results from the first)
        let distances = null;
        if (foundCompetitors.google.length > 0) {
          try {
            const destinations = foundCompetitors.google.slice(0, 5).map(c => ({
              lat: c.geometry.location.lat,
              lng: c.geometry.location.lng
            }));
            distances = await fetchDistanceMatrix(geo, destinations, activeKey);
          } catch (distErr) {
            console.warn('Distance matrix fetch partially failed', distErr);
          }
        }

        setEnvironmentalData({
          airQuality: aqRes.status === 'fulfilled' ? aqRes.value : null,
          pollen: pollenRes.status === 'fulfilled' ? pollenRes.value : null,
          solar: solarRes.status === 'fulfilled' ? solarRes.value : null,
          elevation: elevRes.status === 'fulfilled' ? elevRes.value : null,
          timeZone: tzRes.status === 'fulfilled' ? tzRes.value : null,
          addressValidation: addrRes.status === 'fulfilled' ? addrRes.value : null,
          distances
        });

      } else {
        setError(t('address_not_found'));
      }
    } catch (err) {
      console.error(err);
      setError(t('error_general_search'));
    } finally {
      setIsLoading(false);
    }
    return { openSettings: false };
  };

  const handleSelectCompetitor = async (comp) => {
    setSelectedCompetitor(comp);
    // Since we no longer use BestTime, popularityData could be derived from
    // user_ratings_total or other Google metrics if needed,
    // or just set to null as we handle it in AnalyticsPanel.
    setPopularityData(null);
  };

  return { handleSearch, handleSelectCompetitor };
};
