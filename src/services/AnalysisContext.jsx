import React, { createContext, useContext, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState({
    google: localStorage.getItem('google_api_key') || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [competitors, setCompetitors] = useState({ google: [], overpass: [] });
  const [searchRadius, setSearchRadius] = useState(500);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [popularityData, setPopularityData] = useState(null);

  const [environmentalData, setEnvironmentalData] = useState({
    airQuality: null,
    pollen: null,
    solar: null,
    elevation: null,
    timeZone: null,
    addressValidation: null,
    distances: null
  });

  const value = useMemo(() => ({
    apiKeys, setApiKeys,
    isLoading, setIsLoading,
    error, setError,
    currentLocation, setCurrentLocation,
    competitors, setCompetitors,
    searchRadius, setSearchRadius,
    selectedCompetitor, setSelectedCompetitor,
    popularityData, setPopularityData,
    environmentalData, setEnvironmentalData,
    t
  }), [apiKeys, isLoading, error, currentLocation, competitors, searchRadius, selectedCompetitor, popularityData, environmentalData, t]);

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
