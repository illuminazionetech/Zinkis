import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSidebar from './components/SearchSidebar';
import MapComponent from './components/MapContainer';
import SettingsPanel from './components/SettingsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import { useAnalysis } from './services/AnalysisContext';
import { useLocationAnalysis } from './services/useLocationAnalysis';
import { Globe, Settings, AlertTriangle, Menu, X, ChevronRight, BarChart2 } from 'lucide-react';
import './i18n/config';

function App() {
  const { t, i18n } = useTranslation();
  const {
    apiKeys, setApiKeys, isLoading, error, setError,
    currentLocation, competitors, searchRadius,
    selectedCompetitor, popularityData, environmentalData
  } = useAnalysis();

  const { handleSearch, handleSelectCompetitor } = useLocationAnalysis();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'it' ? 'en' : 'it');
  };

  const onSearch = async (params) => {
    const result = await handleSearch(params);
    if (result.openSettings) {
      setIsSettingsOpen(true);
    } else {
      // Auto-open analytics on search if results found
      setIsAnalyticsOpen(true);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleSaveKeys = (keys) => {
    const newKeys = {
      google: keys.googleKey
    };
    setApiKeys(newKeys);
    localStorage.setItem('google_api_key', keys.googleKey);
    setError(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-[1000] bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main Search Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[900] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <SearchSidebar onSearch={onSearch} isLoading={isLoading} />
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Top Control Bar */}
        <header className="absolute top-4 right-4 z-[850] flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="bg-white/95 backdrop-blur-sm border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-bold text-slate-700"
          >
            <Globe size={18} className="text-blue-600" />
            <span className="hidden sm:inline">{i18n.language.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white/95 backdrop-blur-sm border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-bold text-slate-700"
          >
            <Settings size={18} className="text-slate-500" />
            <span className="hidden sm:inline">{t('settings')}</span>
          </button>

          <button
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className={`xl:hidden bg-white/95 backdrop-blur-sm border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-bold ${isAnalyticsOpen ? 'text-blue-600 border-blue-200 bg-blue-50/50' : 'text-slate-700'}`}
          >
            <BarChart2 size={18} />
            <span className="hidden sm:inline">{t('analytics')}</span>
          </button>
        </header>

        {/* Floating Notifications */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[850] bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="text-sm font-bold">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:bg-red-100 p-1 rounded-full"><X size={14}/></button>
          </div>
        )}

        {/* Map Experience */}
        <div className="flex-1 w-full h-full">
          <MapComponent
            location={currentLocation}
            competitors={competitors}
            radius={searchRadius}
          />
        </div>

        {/* Responsive Analytics Drawer/Sidebar */}
        <div className={`fixed xl:absolute inset-y-0 right-0 z-[950] w-full sm:w-96 xl:w-[420px] transform ${isAnalyticsOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-500 ease-in-out flex pointer-events-none xl:p-4`}>
          <div className="pointer-events-auto bg-white flex flex-col w-full h-full shadow-2xl xl:rounded-3xl border-l xl:border border-slate-200 overflow-hidden">
             {/* Header for Mobile Drawer */}
             <div className="xl:hidden flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
               <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                 <BarChart2 className="text-blue-600" />
                 {t('analytics')}
               </h2>
               <button onClick={() => setIsAnalyticsOpen(false)} className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">
                 <X size={20} />
               </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-hidden p-4 lg:p-6">
                <AnalyticsPanel
                  popularityData={popularityData}
                  venueName={selectedCompetitor ? selectedCompetitor.name : ''}
                  environmentalData={environmentalData}
                  competitors={competitors}
                  onSelectCompetitor={handleSelectCompetitor}
                />
             </div>
          </div>

          {/* Desktop Toggle Handle */}
          <button
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className="hidden xl:flex absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 pointer-events-auto bg-white border border-slate-200 border-r-0 p-3 rounded-l-2xl shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] group hover:bg-slate-50 transition-colors"
          >
            {isAnalyticsOpen ? <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600" /> : <BarChart2 size={20} className="text-slate-400 group-hover:text-blue-600" />}
          </button>
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
