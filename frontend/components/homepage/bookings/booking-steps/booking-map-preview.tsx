'use client';

import { useEffect, useState, useCallback } from 'react';
import { Location } from '@/types/booking.types';
import { Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getLeafletIcon } from '@/utils/leaflet-config';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  pickup: Location;
  dropoff: Location;
  height?: string;
}

// Helper to fit bounds
function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [bounds, map]);
  return null;
}

export default function RouteMap({ pickup, dropoff, height = '250px' }: RouteMapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async () => {
    if (!pickup || !dropoff) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
        setRoute(coordinates);
      } else {
        throw new Error('No route found');
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Could not load map');
    } finally {
      setLoading(false);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center" style={{ height }}>
        <div className="text-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading route...</p>
        </div>
      </div>
    );
  }

  const bounds = L.latLngBounds([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]);
  if (route.length > 0) {
    route.forEach(coord => bounds.extend(coord));
  }

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={[pickup.lat, pickup.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[pickup.lat, pickup.lng]} icon={getLeafletIcon('pickup')} />
        <Marker position={[dropoff.lat, dropoff.lng]} icon={getLeafletIcon('dropoff')} />
        {route.length > 0 && (
          <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.8} />
        )}
        <ChangeView bounds={bounds} />
      </MapContainer>
    </div>
  );
}