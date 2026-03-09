import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSidebar from './components/SearchSidebar';
import MapComponent from './components/MapContainer';
import SettingsPanel from './components/SettingsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import CompetitorList from './components/CompetitorList';
import { geocodeAddress } from './services/geocodingService';
import { fetchCompetitors } from './services/poiService';
import { fetchPopularity } from './services/bestTimeService';
import {
  fetchAirQuality,
  fetchPollen,
  fetchSolar,
  fetchElevation,
  fetchTimeZone,
  validateAddress,
  fetchDistanceMatrix
} from './services/googleApiService';
import { Globe, Settings, AlertTriangle } from 'lucide-react';
import './i18n/config';

function App() {
  const { t, i18n } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    google: localStorage.getItem('google_api_key') || '',
    bestTime: localStorage.getItem('besttime_api_key') || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [competitors, setCompetitors] = useState({ google: [], overpass: [] });
  const [searchRadius, setSearchRadius] = useState(500);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [popularityData, setPopularityData] = useState(null);

  // New State for Google APIs
  const [environmentalData, setEnvironmentalData] = useState({
    airQuality: null,
    pollen: null,
    solar: null,
    elevation: null,
    timeZone: null,
    addressValidation: null,
    distances: null
  });

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'it' ? 'en' : 'it');
  };

  const handleSearch = async ({ address, sector, radius }) => {
    if (!apiKeys.google) {
      setError(t('error_api_keys'));
      setIsSettingsOpen(true);
      return;
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

        // Initial batch of parallel data fetching
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

        // Second batch: Distance Matrix (depends on competitors found)
        let distances = null;
        if (foundCompetitors.google.length > 0) {
          const destinations = foundCompetitors.google.slice(0, 5).map(c => ({
            lat: c.geometry.location.lat,
            lng: c.geometry.location.lng
          }));
          distances = await fetchDistanceMatrix(geo, destinations, apiKeys.google);
        }

        setEnvironmentalData({
          airQuality: aqRes.status === 'fulfilled' ? aqRes.value : null,
          pollen: pollenRes.status === 'fulfilled' ? pollenRes.value : null,
          solar: solarRes.status === 'fulfilled' ? solarRes.value : null,
          elevation: elevRes.status === 'fulfilled' ? elevRes.value : null,
          timeZone: tzRes.status === 'fulfilled' ? tzRes.value : null,
          addressValidation: addrRes.status === 'fulfilled' ? addrRes.value : null,
          distances: distances
        });

      } else {
        setError("Indirizzo non trovato.");
      }
    } catch (err) {
      console.error(err);
      setError("Si è verificato un errore durante la ricerca.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompetitor = async (comp) => {
    setSelectedCompetitor(comp);
    if (apiKeys.bestTime) {
      const popData = await fetchPopularity(comp.name, comp.address, apiKeys.bestTime);
      setPopularityData(popData);
    } else {
      setPopularityData(null);
    }
  };

  const handleSaveKeys = (keys) => {
    setApiKeys({
      google: keys.googleKey,
      bestTime: keys.bestTimeKey
    });
    setError(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <SearchSidebar onSearch={handleSearch} isLoading={isLoading} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Navbar inside Main */}
        <div className="absolute top-4 right-4 z-[950] flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-bold text-slate-700"
          >
            <Globe size={16} className="text-blue-600" />
            {i18n.language.toUpperCase()}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-bold text-slate-700"
          >
            <Settings size={16} className="text-slate-500" />
            {t('settings')}
          </button>
        </div>

        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[950] bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
            <AlertTriangle size={18} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <MapComponent
          location={currentLocation}
          competitors={competitors}
          radius={searchRadius}
        />

        <div className="absolute top-4 left-4 z-[950] max-w-sm pointer-events-none">
          <div className="pointer-events-auto space-y-4">
             {/* Stats would go here */}
          </div>
        </div>

        {/* Dynamic Analytics & Competitors Sidebar (Right) */}
        <div className="absolute top-4 right-4 bottom-4 w-80 lg:w-96 hidden xl:flex flex-col gap-4 pointer-events-none pr-0">
          <div className="mt-16 pointer-events-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 flex flex-col h-full overflow-hidden p-4">
            <CompetitorList competitors={competitors} onSelect={handleSelectCompetitor} />
            <AnalyticsPanel
              popularityData={popularityData}
              venueName={selectedCompetitor ? selectedCompetitor.name : ''}
              environmentalData={environmentalData}
            />
          </div>
        </div>
      </main>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveKeys}
      />
    </div>
  );
}

export default App;
