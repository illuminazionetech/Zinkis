import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Clock, Users, Zap, Wind, Sun, Mountain, Thermometer, MapPin, Navigation, CheckCircle } from 'lucide-react';

const AnalyticsPanel = ({ popularityData, venueName, environmentalData }) => {
  const { t } = useTranslation();

  const { airQuality, pollen, solar, elevation, timeZone, addressValidation, distances } = environmentalData || {};

  const renderPopularity = () => {
    if (!popularityData || !popularityData.forecast_data) {
      return (
        <div className="bg-slate-50 p-4 flex flex-col items-center justify-center text-center space-y-2 rounded-xl border border-dashed border-slate-300">
          <Activity size={24} className="text-slate-300" />
          <p className="text-[10px] font-medium text-slate-500">
            Dati BestTime non disponibili per questa location.
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
      <div className="space-y-4">
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="hour" fontSize={8} tick={{ fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-1 shadow-md rounded border border-gray-100 text-[10px] font-bold text-gray-700">
                        {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="popularity" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#2563eb' : '#93c5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex flex-col">
            <span className="text-[8px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
              <Clock size={8} /> {t('peak_time')}
            </span>
            <span className="text-xs font-black text-blue-800">{peakHour}:00</span>
          </div>
          <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex flex-col">
            <span className="text-[8px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1">
              <Users size={8} /> {t('dwell_time')}
            </span>
            <span className="text-xs font-black text-blue-800">{dwellTime} min</span>
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
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Local Time */}
        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Clock size={14} className="text-slate-600" />
             <span className="text-[10px] font-bold text-slate-700 uppercase">{t('local_time')}</span>
           </div>
           <div className="text-sm font-black text-slate-900">{localTime || '--:--'}</div>
        </div>

        {/* Address Validation */}
        <div className={`p-3 rounded-xl border col-span-2 flex items-center justify-between ${isAddressValid ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
           <div className="flex items-center gap-2">
             <MapPin size={14} className={isAddressValid ? 'text-green-600' : 'text-orange-600'} />
             <span className={`text-[10px] font-bold uppercase ${isAddressValid ? 'text-green-700' : 'text-orange-700'}`}>{t('address_quality')}</span>
           </div>
           <div className="flex items-center gap-1">
             {isAddressValid && <CheckCircle size={12} className="text-green-600" />}
             <span className={`text-[10px] font-black ${isAddressValid ? 'text-green-800' : 'text-orange-800'}`}>
               {isAddressValid ? t('verified') : t('incomplete')}
             </span>
           </div>
        </div>

        {/* Air Quality */}
        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-1">
          <div className="flex items-center justify-between">
            <Wind size={14} className="text-emerald-600" />
            <span className="text-[8px] font-bold text-emerald-600 uppercase">AQI</span>
          </div>
          <div className="text-lg font-black text-emerald-800">
            {airQuality?.indexes?.[0]?.aqi || '--'}
          </div>
          <div className="text-[8px] text-emerald-600 font-medium truncate">
            {airQuality?.indexes?.[0]?.category || t('unknown')}
          </div>
        </div>

        {/* Elevation */}
        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 space-y-1">
          <div className="flex items-center justify-between">
            <Mountain size={14} className="text-amber-600" />
            <span className="text-[8px] font-bold text-amber-600 uppercase">{t('elevation')}</span>
          </div>
          <div className="text-lg font-black text-amber-800">
            {elevation?.results?.[0]?.elevation ? Math.round(elevation.results[0].elevation) : '--'} m
          </div>
          <div className="text-[8px] text-amber-600 font-medium italic">
            {t('meters_above_sea')}
          </div>
        </div>

        {/* Distances to Competitors */}
        {distances && distances.rows?.[0]?.elements?.length > 0 && (
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <Navigation size={14} className="text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-800 uppercase">{t('nearby_competitors_travel')}</span>
            </div>
            <div className="space-y-1">
              {distances.rows[0].elements.slice(0, 3).map((el, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-indigo-700 font-medium">Competitor #{i+1}</span>
                  <span className="text-indigo-900 font-black">{el.distance?.text} ({el.duration?.text})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solar */}
        <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100 col-span-2 space-y-2">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Sun size={14} className="text-yellow-600" />
               <span className="text-[10px] font-bold text-yellow-800 uppercase">{t('solar_potential')}</span>
             </div>
             {solar?.maxSunshineHoursPerYear && (
                <span className="text-[8px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full font-bold">
                  {Math.round(solar.maxSunshineHoursPerYear)}h/yr
                </span>
             )}
           </div>
           {solar ? (
             <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-bold text-yellow-900">{solar.countOfPanels || 0} {t('panels_max')}</div>
                  <div className="text-[8px] text-yellow-700">{t('yearly_energy')}: {Math.round(solar.maxEpcKwhPerYear || 0)} kWh</div>
                </div>
                <div className="text-[8px] text-yellow-600 italic max-w-[120px] text-right">
                  {t('solar_description')}
                </div>
             </div>
           ) : (
             <div className="text-[10px] text-yellow-600 italic">{t('no_solar_data')}</div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pr-1 mt-4 space-y-6">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> {t('popularity')}
          </h3>
          {popularityData && (
            <span className="text-[8px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase">BestTime</span>
          )}
        </div>
        {renderPopularity()}
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Zap size={14} className="text-yellow-500" /> {t('location_insights')}
        </h3>
        {renderEnvironmental()}
      </section>

      {venueName && (
        <p className="text-[8px] text-slate-400 text-center italic border-t border-slate-100 pt-4">
          * {t('analysis_for')} {venueName}. {t('data_disclaimer')}
        </p>
      )}
    </div>
  );
};

export default AnalyticsPanel;
