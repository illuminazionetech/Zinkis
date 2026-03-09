import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Clock, Users, Zap } from 'lucide-react';

const AnalyticsPanel = ({ popularityData, venueName }) => {
  const { t } = useTranslation();

  if (!popularityData || !popularityData.forecast_data) {
    return (
      <div className="bg-white/90 p-6 flex flex-col items-center justify-center text-center space-y-4 rounded-xl shadow-lg border border-gray-100 mt-4">
        <Activity size={40} className="text-gray-300 animate-pulse" />
        <p className="text-sm font-medium text-gray-500 max-w-[280px]">
          Seleziona un concorrente o una location con una chiave BestTime.app valida per vedere l'affluenza oraria.
        </p>
      </div>
    );
  }

  const { forecast_data } = popularityData;
  const currentHour = new Date().getHours();

  // Format data for Recharts (hours 0-23)
  const chartData = forecast_data.map((val, hour) => ({
    hour: `${hour}:00`,
    popularity: val,
    isCurrent: hour === currentHour
  }));

  const maxPop = Math.max(...forecast_data);
  const peakHour = forecast_data.indexOf(maxPop);
  const dwellTime = popularityData.venue_info?.venue_dwell_time_min || 45;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity size={18} className="text-blue-600" /> {t('popularity')}
        </h2>
        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          BestTime Data
        </span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="hour" fontSize={10} tick={{ fill: '#9ca3af' }} />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 shadow-md rounded border border-gray-100 text-xs font-bold text-gray-700">
                      {payload[0].value}%
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="popularity" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#2563eb' : '#93c5fd'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Clock size={10} /> {t('peak_time')}
          </div>
          <div className="text-lg font-black text-slate-800">{peakHour}:00</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Users size={10} /> {t('dwell_time')}
          </div>
          <div className="text-lg font-black text-slate-800">{dwellTime} min</div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center italic">
        * Dati previsionali basati sull'intelligenza artificiale per {venueName}.
      </p>
    </div>
  );
};

export default AnalyticsPanel;
