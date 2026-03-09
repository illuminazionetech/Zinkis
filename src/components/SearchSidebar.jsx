import React, { useState } from 'react';
import { Search, MapPin, Layers, Briefcase, Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COMMERCIAL_TYPES } from '../services/poiService';

const SearchSidebar = ({ onSearch, isLoading }) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState(COMMERCIAL_TYPES[0].value);
  const [radius, setRadius] = useState(500);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address) {
      onSearch({ address, sector, radius });
    }
  };

  return (
    <div className="w-full lg:w-96 bg-white shadow-lg z-[900] overflow-y-auto p-6 border-r border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-2 rounded-lg">
          <MapPin className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Zinkis</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Search size={16} /> {t('address')}
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            placeholder={t('search_placeholder')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Briefcase size={16} /> {t('sector')}
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all cursor-pointer"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            {COMMERCIAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {t(type.label_key)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Ruler size={16} /> {t('radius')}
            </label>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {radius}m
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !address}
          className={`w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Search size={20} /> {t('search')}
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed italic">
          Analisi intelligente della location basata su dati Google Maps, OSM e BestTime.
        </p>
      </div>
    </div>
  );
};

export default SearchSidebar;
