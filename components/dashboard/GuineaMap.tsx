'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour les icônes Leaflet dans Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Données GeoJSON simplifiées pour la Guinée
const guineaGeoJSON = {
  type: 'Feature',
  properties: {
    name: 'Guinea'
  },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-13.7, 9.0],
      [-13.0, 10.0],
      [-12.0, 10.8],
      [-11.0, 10.9],
      [-10.0, 10.8],
      [-9.0, 10.5],
      [-8.5, 10.0],
      [-8.0, 9.5],
      [-8.0, 8.5],
      [-8.5, 8.0],
      [-9.0, 7.8],
      [-10.0, 7.5],
      [-11.0, 7.8],
      [-12.0, 8.3],
      [-13.0, 8.5],
      [-13.7, 9.0]
    ]]
  }
};

// Principales villes de Guinée
const cities = [
  { name: 'Conakry', position: [9.6412, -13.5784], population: 1660973 },
  { name: 'Kankan', position: [10.3833, -9.3000], population: 194671 },
  { name: 'Kindia', position: [10.0500, -12.8667], population: 117062 },
  { name: 'Nzérékoré', position: [7.7500, -8.8167], population: 132728 },
  { name: 'Labé', position: [11.3167, -12.2833], population: 58649 }
];

const GuineaMap = () => {
  // Définir le centre et le zoom comme des variables
  const center: [number, number] = [9.9456, -9.6966];
  const zoom = 6;
  
  return (
    <MapContainer 
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <GeoJSON 
        data={guineaGeoJSON as any}
        style={() => ({
          fillColor: '#60a5fa',
          weight: 2,
          opacity: 1,
          color: '#3b82f6',
          fillOpacity: 0.5
        })}
      />
      
      {cities.map((city) => (
        <Marker 
          key={city.name} 
          position={city.position as [number, number]}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #3b82f6; width: ${Math.log(city.population) * 2}px; height: ${Math.log(city.population) * 2}px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })}
        >
          <Popup>
            <div>
              <strong>{city.name}</strong>
              <div>Population: {city.population.toLocaleString()}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default GuineaMap;
