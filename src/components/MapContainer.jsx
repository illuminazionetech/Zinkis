import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetinaIcon from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconRetinaUrl: markerRetinaIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom red icon for selected location
const RedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SetViewOnSearch = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 15);
    }
  }, [location, map]);
  return null;
};

const MapComponent = ({ location, competitors, radius }) => {
  const { t } = useTranslation();
  const [showTraffic, setShowTraffic] = useState(false);

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={location || [41.9028, 12.4964]} // Rome default
        zoom={13}
        className="h-full w-full z-[800]"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay name={t('traffic_layer')}>
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=h@169000000,traffic|kg:1&x={x}&y={y}&z={z}"
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            />
          </LayersControl.Overlay>
        </LayersControl>

        {location && (
          <>
            <SetViewOnSearch location={location} />
            <Marker position={[location.lat, location.lng]} icon={RedIcon}>
              <Popup className="font-bold">Location</Popup>
            </Marker>
            <Circle
              center={[location.lat, location.lng]}
              radius={radius}
              pathOptions={{ fillColor: 'blue', color: 'blue', weight: 1, fillOpacity: 0.1 }}
            />
          </>
        )}

        {competitors.google.map((comp, idx) => (
          <Marker key={`google-${idx}`} position={[comp.geometry.location.lat, comp.geometry.location.lng]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-gray-800">{comp.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{comp.vicinity}</p>
                {comp.rating && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                    ★ {comp.rating} <span className="text-gray-400 font-normal">({comp.user_ratings_total})</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {competitors.overpass.map((comp, idx) => (
          <Marker key={`osm-${idx}`} position={[comp.lat, comp.lon]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-gray-800">{comp.tags.name || 'Unknown Competitor'}</h3>
                <p className="text-xs text-gray-600">{comp.tags.shop || 'Shop'}</p>
                <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded uppercase font-bold mt-1 inline-block">OSM Data</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
