import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Activity, Clock, Users, Zap, Wind, Sun, Mountain,
  Thermometer, MapPin, Navigation, CheckCircle,
  LayoutGrid, Info, ShieldAlert, List
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
        <div className="bg-slate-50 p-6 flex flex-col items-center justify-center text-center space-y-3 rounded-2xl border border-dashed border-slate-300 h-full">
          <Activity size={32} className="text-slate-300" />
          <p className="text-xs font-medium text-slate-500 max-w-[200px]">
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="h-48 w-full bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" fontSize={9} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-2 shadow-xl rounded-lg text-xs font-bold">
                        {payload[0].value}% affluenza
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="popularity" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#2563eb' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider flex items-center gap-1.5 mb-1">
              <Clock size={12} /> {t('peak_time')}
            </span>
            <span className="text-lg font-black text-blue-900">{peakHour}:00</span>
          </div>
          <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider flex items-center gap-1.5 mb-1">
              <Users size={12} /> {t('dwell_time')}
            </span>
            <span className="text-lg font-black text-indigo-900">{dwellTime} min</span>
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
      <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Local Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <Clock size={18} />
             </div>
             <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{t('local_time')}</span>
           </div>
           <div className="text-xl font-black text-slate-900">{localTime || '--:--'}</div>
        </div>

        {/* Address Validation */}
        <div className={`p-4 rounded-2xl border col-span-2 flex items-center justify-between shadow-sm ${isAddressValid ? 'bg-green-50/50 border-green-100' : 'bg-orange-50/50 border-orange-100'}`}>
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isAddressValid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <MapPin size={18} />
             </div>
             <span className={`text-xs font-bold uppercase tracking-tight ${isAddressValid ? 'text-green-700' : 'text-orange-700'}`}>{t('address_quality')}</span>
           </div>
           <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-inherit">
             {isAddressValid && <CheckCircle size={14} className="text-green-600" />}
             <span className={`text-xs font-black ${isAddressValid ? 'text-green-800' : 'text-orange-800'}`}>
               {isAddressValid ? t('verified') : t('incomplete')}
             </span>
           </div>
        </div>

        {/* Air Quality */}
        <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <Wind size={20} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase">AQI</span>
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {airQuality?.indexes?.[0]?.aqi || '--'}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold bg-white/50 px-2 py-0.5 rounded-full inline-block truncate max-w-full">
            {airQuality?.indexes?.[0]?.category || t('unknown')}
          </div>
        </div>

        {/* Elevation */}
        <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <Mountain size={20} className="text-amber-600" />
            <span className="text-[10px] font-bold text-amber-600 uppercase">Elev</span>
          </div>
          <div className="text-2xl font-black text-amber-900">
            {elevation?.results?.[0]?.elevation ? Math.round(elevation.results[0].elevation) : '--'} m
          </div>
          <div className="text-[10px] text-amber-600 font-medium italic">
            {t('meters_above_sea')}
          </div>
        </div>

        {/* Distances to Competitors */}
        {distances && distances.rows?.[0]?.elements?.length > 0 && (
          <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100 col-span-2 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-tight">{t('nearby_competitors_travel')}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {distances.rows[0].elements.slice(0, 3).map((el, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-white/60 p-2 rounded-xl border border-indigo-50">
                  <span className="text-indigo-700 font-bold">{t('competitor_short')} #{i+1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">{el.distance?.text}</span>
                    <span className="text-indigo-900 font-black">{el.duration?.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solar */}
        <div className="bg-yellow-50/30 p-4 rounded-2xl border border-yellow-100 col-span-2 space-y-3 shadow-sm">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Sun size={20} className="text-yellow-600" />
               <span className="text-xs font-bold text-yellow-800 uppercase tracking-tight">{t('solar_potential')}</span>
             </div>
             {solar?.maxSunshineHoursPerYear && (
                <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-black">
                  {Math.round(solar.maxSunshineHoursPerYear)}{t('hours_per_year')}
                </span>
             )}
           </div>
           {solar ? (
             <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/60 p-2 rounded-xl border border-yellow-100">
                  <div className="text-sm font-black text-yellow-900">{solar.countOfPanels || 0}</div>
                  <div className="text-[10px] text-yellow-700 font-bold">{t('panels_max')}</div>
                </div>
                <div className="bg-white/60 p-2 rounded-xl border border-yellow-100">
                  <div className="text-sm font-black text-yellow-900">{Math.round(solar.maxEpcKwhPerYear || 0)}</div>
                  <div className="text-[10px] text-yellow-700 font-bold">{t('kwh_per_year')}</div>
                </div>
             </div>
           ) : (
             <div className="text-xs text-yellow-600 italic flex items-center gap-2">
               <ShieldAlert size={14} /> {t('no_solar_data')}
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
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white shadow-lg text-blue-600 scale-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'
              }`}
            >
              <Icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        {activeTab === 'competitors' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <CompetitorList competitors={competitors} onSelect={onSelectCompetitor} />
          </div>
        )}

        {activeTab === 'analytics' && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
               <Activity size={14} className="text-blue-500" /> {t('popularity')}
             </h3>
             {renderPopularity()}
           </div>
        )}

        {activeTab === 'environment' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Zap size={14} className="text-yellow-500" /> {t('location_insights')}
            </h3>
            {renderEnvironmental()}
          </div>
        )}
      </div>

      {venueName && (
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
             <Info size={16} className="text-slate-400 shrink-0" />
             <p className="text-[9px] text-slate-500 leading-tight italic">
               {t('analysis_for')} <span className="font-bold text-slate-700">{venueName}</span>. {t('data_disclaimer')}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
