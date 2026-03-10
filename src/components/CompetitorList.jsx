import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, ExternalLink, Info } from 'lucide-react';

const CompetitorList = ({ competitors, onSelect }) => {
  const { t } = useTranslation();

  const allComps = [
    ...competitors.google.map(c => ({
      id: c.place_id,
      name: c.name,
      address: c.vicinity,
      rating: c.rating,
      reviews: c.user_ratings_total,
      price_level: c.price_level,
      business_status: c.business_status,
      opening_hours: c.opening_hours,
      source: 'Google'
    })),
    ...competitors.overpass.map((c, i) => ({
      id: `osm-${i}`,
      name: c.tags.name || 'Unknown',
      address: c.tags['addr:street'] || 'OSM Address',
      rating: null,
      source: 'OSM'
    }))
  ];

  if (allComps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
        <MapPin size={40} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">{t('no_competitors')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {t('competitors')}
        </h2>
        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
          {allComps.length}
        </span>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {allComps.map((comp) => (
          <div
            key={comp.id}
            onClick={() => onSelect(comp)}
            className="group p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-300 relative overflow-hidden"
          >
            {comp.source === 'Google' && (
              <div className="absolute top-0 right-0 p-1 bg-yellow-400 text-[8px] font-black uppercase text-yellow-900 rounded-bl-lg tracking-widest px-2">
                Google
              </div>
            )}
            {comp.source === 'OSM' && (
              <div className="absolute top-0 right-0 p-1 bg-green-500 text-[8px] font-black uppercase text-white rounded-bl-lg tracking-widest px-2">
                OSM
              </div>
            )}

            <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors pr-10 truncate">
              {comp.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2 truncate flex items-center gap-1">
               {comp.address}
            </p>

            {comp.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-500 text-xs font-bold gap-1 bg-yellow-50 px-2 py-0.5 rounded">
                  <Star size={10} fill="currentColor" /> {comp.rating}
                </div>
                <span className="text-[10px] text-gray-400">({comp.reviews} {t('rating')})</span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                <Info size={10} /> Dettagli affluenza
              </span>
              <ExternalLink size={12} className="text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorList;
