import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Activity, Clock, Users, Zap, Wind, Sun, Mountain,
  Thermometer, MapPin, Navigation, CheckCircle,
  LayoutGrid, Info, ShieldAlert, List, ChevronRight
} from 'lucide-react';
import CompetitorList from './CompetitorList';

const AnalyticsPanel = ({
  popularityData,
  venueName,
  environmentalData,
  competitors,
  onSelectCompetitor
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('competitors');

  const { airQuality, pollen, solar, elevation, timeZone, addressValidation, distances } = environmentalData || {};

  const renderPopularity = () => {
    if (!popularityData || !popularityData.forecast_data) {
      return (
        <div className="bg-slate-50 p-8 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-dashed border-slate-200 h-64">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <Activity size={32} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-[220px] leading-relaxed">
            {t('besttime_not_available')}
          </p>
        </div>
      );
    }

    const { forecast_data } = popularityData;
    const currentHour = new Date().getHours();
    const chartData = forecast_data.map((val, hour) => ({
      hour: `${hour}:00`,
      popularity: val,
      isCurrent: hour === currentHour
    }));

    const maxPop = Math.max(...forecast_data);
    const peakHour = forecast_data.indexOf(maxPop);
    const dwellTime = popularityData.venue_info?.venue_dwell_time_min || 45;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" fontSize={10} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 shadow-2xl rounded-xl text-xs font-bold">
                          {payload[0].value}% {t('popularity')}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="popularity" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isCurrent ? '#3b82f6' : '#e2e8f0'}
                      className="transition-all duration-300 hover:fill-blue-400"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 flex flex-col group hover:bg-blue-50 transition-colors">
            <span className="text-[10px] uppercase font-black text-blue-500 tracking-widest flex items-center gap-2 mb-2">
              <Clock size={14} /> {t('peak_time')}
            </span>
            <span className="text-2xl font-black text-blue-900">{peakHour}:00</span>
          </div>
          <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50 flex flex-col group hover:bg-indigo-50 transition-colors">
            <span className="text-[10px] uppercase font-black text-indigo-500 tracking-widest flex items-center gap-2 mb-2">
              <Users size={14} /> {t('dwell_time')}
            </span>
            <span className="text-2xl font-black text-indigo-900">{dwellTime} min</span>
          </div>
        </div>
      </div>
    );
  };

  const renderEnvironmental = () => {
    const localTime = timeZone ? new Date().toLocaleTimeString(t('lang_code') === 'it' ? 'it-IT' : 'en-US', {
      timeZone: timeZone.timeZoneId,
      hour: '2-digit',
      minute: '2-digit'
    }) : null;
    const isAddressValid = addressValidation?.result?.verdict?.addressComplete;

    return (
      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
        {/* Local Time */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm col-span-2 flex items-center justify-between group hover:border-blue-100 transition-colors">
           <div className="flex items-center gap-4">
             <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                <Clock size={20} />
             </div>
             <div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t('local_time')}</span>
               <div className="text-2xl font-black text-slate-900">{localTime || '--:--'}</div>
             </div>
           </div>
           <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 italic">
             {timeZone?.timeZoneName || 'UTC'}
           </div>
        </div>

        {/* Address Validation */}
        <div className={`p-5 rounded-3xl border col-span-2 flex items-center justify-between shadow-sm transition-all ${isAddressValid ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
           <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${isAddressValid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                <MapPin size={20} />
             </div>
             <div>
               <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 ${isAddressValid ? 'text-emerald-700' : 'text-amber-700'}`}>{t('address_quality')}</span>
               <div className={`text-sm font-black ${isAddressValid ? 'text-emerald-900' : 'text-amber-900'}`}>
                 {isAddressValid ? t('verified') : t('incomplete')}
               </div>
             </div>
           </div>
           {isAddressValid && <CheckCircle size={20} className="text-emerald-500 mr-2" />}
        </div>

        {/* Air Quality */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-3 shadow-sm group hover:border-emerald-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <Wind size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AQI</span>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {airQuality?.indexes?.[0]?.aqi || '--'}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50/50 px-2 py-0.5 rounded-lg inline-block truncate max-w-full mt-1">
              {airQuality?.indexes?.[0]?.category || t('unknown')}
            </div>
          </div>
        </div>

        {/* Elevation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-3 shadow-sm group hover:border-amber-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
              <Mountain size={20} />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Alt</span>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {elevation?.results?.[0]?.elevation ? Math.round(elevation.results[0].elevation) : '--'} m
            </div>
            <div className="text-[10px] text-amber-600 font-medium italic mt-1">
              {t('meters_above_sea')}
            </div>
          </div>
        </div>

        {/* Distances to Competitors */}
        {distances && distances.rows?.[0]?.elements?.length > 0 && (
          <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100 col-span-2 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                <Navigation size={18} />
              </div>
              <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">{t('nearby_competitors_travel')}</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {distances.rows[0].elements.slice(0, 3).map((el, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-indigo-50 hover:border-indigo-200 transition-all cursor-default shadow-sm">
                  <span className="text-slate-600 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black">{i+1}</span>
                    {t('competitor_short')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">{el.distance?.text}</span>
                    <span className="text-indigo-900 font-black bg-indigo-50 px-2 py-1 rounded-lg">{el.duration?.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solar */}
        <div className="bg-yellow-50/30 p-6 rounded-3xl border border-yellow-100 col-span-2 space-y-4 shadow-sm">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
                  <Sun size={20} />
                </div>
                <span className="text-xs font-black text-yellow-900 uppercase tracking-widest">{t('solar_potential')}</span>
             </div>
             {solar?.maxSunshineHoursPerYear && (
                <span className="text-[10px] bg-yellow-200/50 text-yellow-800 px-3 py-1.5 rounded-full font-black border border-yellow-200">
                  {Math.round(solar.maxSunshineHoursPerYear)} {t('hours_per_year')}
                </span>
             )}
           </div>

           {solar ? (
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 p-4 rounded-2xl border border-yellow-100 shadow-sm">
                  <div className="text-xl font-black text-yellow-900">{solar.countOfPanels || 0}</div>
                  <div className="text-[10px] text-yellow-700 font-bold uppercase tracking-tight">{t('panels_max')}</div>
                </div>
                <div className="bg-white/80 p-4 rounded-2xl border border-yellow-100 shadow-sm">
                  <div className="text-xl font-black text-yellow-900">{Math.round(solar.maxEpcKwhPerYear || 0)}</div>
                  <div className="text-[10px] text-yellow-700 font-bold uppercase tracking-tight">{t('kwh_per_year')}</div>
                </div>
             </div>
           ) : (
             <div className="text-xs text-yellow-700 italic flex items-center gap-3 bg-white/50 p-4 rounded-2xl border border-yellow-100/50">
               <ShieldAlert size={18} className="text-yellow-500 shrink-0" /> {t('no_solar_data')}
             </div>
           )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'competitors', label: t('competitors'), icon: List },
    { id: 'analytics', label: t('popularity'), icon: Activity },
    { id: 'environment', label: t('location_insights'), icon: Zap },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Navigation */}
      <nav className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-[24px] mb-8 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all duration-300 relative ${
                isActive
                  ? 'bg-white shadow-xl text-blue-600 scale-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-[0.98]'
              }`}
            >
              <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
              <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 -mr-3 pb-8">
        {activeTab === 'competitors' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
             <CompetitorList competitors={competitors} onSelect={onSelectCompetitor} />
          </div>
        )}

        {activeTab === 'analytics' && (
           <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="flex items-center justify-between mb-6 px-1">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                 <Activity size={16} className="text-blue-500" /> {t('popularity')}
               </h3>
               {venueName && <div className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{venueName}</div>}
             </div>
             {renderPopularity()}
           </div>
        )}

        {activeTab === 'environment' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-6 px-1">
              <Zap size={16} className="text-yellow-500" /> {t('location_insights')}
            </h3>
            {renderEnvironmental()}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {venueName && (
        <div className="mt-auto pt-6 border-t border-slate-100 shrink-0">
          <div className="bg-blue-50/30 p-4 rounded-2xl flex items-center gap-4 group">
             <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-50 group-hover:rotate-12 transition-transform">
               <Info size={18} className="text-blue-500 shrink-0" />
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed italic">
               {t('analysis_for')} <span className="font-black text-slate-800 tracking-tight">{venueName}</span>. {t('data_disclaimer')}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
