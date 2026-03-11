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
import {
  fetchAirQualityFree,
  fetchElevationFree,
  fetchDistancesFree,
  fetchTimeZoneFree
} from './environmentalService';

// Fallback API Key (Note: In a real app this should be handled by the backend)
const DEFAULT_GOOGLE_KEY = ''; // Removed default key as per user request to use free APIs

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
      const geo = await geocodeAddress(address);
      if (geo) {
        setCurrentLocation(geo);

        // Fetch data using both Google (if key available) and Free alternatives
        const fetchPromises = [
          fetchCompetitors(geo.lat, geo.lng, radius, sector, activeKey),
          activeKey ? fetchAirQuality(geo.lat, geo.lng, activeKey) : fetchAirQualityFree(geo.lat, geo.lng),
          activeKey ? fetchPollen(geo.lat, geo.lng, activeKey) : Promise.resolve(null),
          activeKey ? fetchSolar(geo.lat, geo.lng, activeKey) : Promise.resolve(null),
          activeKey ? fetchElevation(geo.lat, geo.lng, activeKey) : fetchElevationFree(geo.lat, geo.lng),
          activeKey ? fetchTimeZone(geo.lat, geo.lng, activeKey) : fetchTimeZoneFree(geo.lat, geo.lng),
          activeKey ? validateAddress(address, activeKey) : Promise.resolve(null)
        ];

        const results = await Promise.allSettled(fetchPromises);

        const [compsRes, aqRes, pollenRes, solarRes, elevRes, tzRes, addrRes] = results;

        const foundCompetitors = compsRes.status === 'fulfilled' ? compsRes.value : { google: [], overpass: [] };
        setCompetitors(foundCompetitors);

        // Second batch: Logistics/Distances
        let distances = null;
        const allComps = [...foundCompetitors.google, ...foundCompetitors.overpass.map(o => ({
          geometry: { location: { lat: o.lat, lng: o.lon } }
        }))];

        if (allComps.length > 0) {
          try {
            const destinations = allComps.slice(0, 5).map(c => ({
              lat: c.geometry.location.lat,
              lng: c.geometry.location.lng
            }));

            if (activeKey) {
              distances = await fetchDistanceMatrix(geo, destinations, activeKey);
            } else {
              distances = await fetchDistancesFree(geo, destinations);
            }
          } catch (distErr) {
            console.warn('Distance fetch partially failed', distErr);
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
    setPopularityData(null);
  };

  return { handleSearch, handleSelectCompetitor };
};
