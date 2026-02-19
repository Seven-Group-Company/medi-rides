'use client';

import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import { getLeafletIcon } from '@/utils/leaflet-config';
import 'leaflet/dist/leaflet.css';

const ServiceAreaMapSection = () => {
  // Wasilla, Alaska coordinates
  const wasilla: [number, number] = [61.5816, -149.4394];

  // Nearby community markers
  const nearbyCommunities = [
    { name: 'Palmer', position: [61.5997, -149.1127] as [number, number] },
    { name: 'Big Lake', position: [61.5214, -149.9544] as [number, number] },
    { name: 'Houston', position: [61.6303, -149.8181] as [number, number] },
    { name: 'Willow', position: [61.7472, -150.0375] as [number, number] }
  ];

  return (
    <div className="w-full h-96 md:h-[500px]">
      <MapContainer
        center={wasilla}
        zoom={11}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Main Wasilla marker */}
        <Marker position={wasilla} icon={getLeafletIcon('service')}>
          <Popup>Wasilla Service Center</Popup>
        </Marker>

        {/* Service area circle (8km) */}
        <Circle
          center={wasilla}
          radius={8000}
          pathOptions={{
            color: '#0A2342',
            fillColor: '#B0D6FF',
            fillOpacity: 0.2,
            weight: 2
          }}
        />

        {/* Nearby community markers */}
        {nearbyCommunities.map((community, index) => (
          <Circle
            key={index}
            center={community.position}
            radius={300}
            pathOptions={{
              color: '#FFFFFF',
              fillColor: '#0A2342',
              fillOpacity: 0.8,
              weight: 2
            }}
          >
            <Popup>{community.name}</Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default ServiceAreaMapSection;