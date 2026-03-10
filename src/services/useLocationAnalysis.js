import { useAnalysis } from './AnalysisContext';
import { geocodeAddress } from './geocodingService';
import { fetchCompetitors } from './poiService';
import { fetchPopularity } from './bestTimeService';
import {
  fetchAirQuality,
  fetchPollen,
  fetchSolar,
  fetchElevation,
  fetchTimeZone,
  validateAddress,
  fetchDistanceMatrix
} from './googleApiService';

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
    if (!apiKeys.google) {
      setError(t('error_api_keys'));
      return { openSettings: true };
    }

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
      const geo = await geocodeAddress(address, apiKeys.google);
      if (geo) {
        setCurrentLocation(geo);

        // First batch: Geolocation-based data
        const results = await Promise.allSettled([
          fetchCompetitors(geo.lat, geo.lng, radius, sector, apiKeys.google),
          fetchAirQuality(geo.lat, geo.lng, apiKeys.google),
          fetchPollen(geo.lat, geo.lng, apiKeys.google),
          fetchSolar(geo.lat, geo.lng, apiKeys.google),
          fetchElevation(geo.lat, geo.lng, apiKeys.google),
          fetchTimeZone(geo.lat, geo.lng, apiKeys.google),
          validateAddress(address, apiKeys.google)
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
            distances = await fetchDistanceMatrix(geo, destinations, apiKeys.google);
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
    if (apiKeys.bestTime) {
      try {
        const popData = await fetchPopularity(comp.name, comp.address, apiKeys.bestTime);
        setPopularityData(popData);
      } catch (bestTimeErr) {
        console.warn('BestTime popularity fetch failed', bestTimeErr);
        setPopularityData(null);
      }
    } else {
      setPopularityData(null);
    }
  };

  return { handleSearch, handleSelectCompetitor };
};
