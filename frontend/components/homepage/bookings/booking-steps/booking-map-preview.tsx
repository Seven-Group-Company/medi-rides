'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Location } from '@/types/booking.types';
import { Loader2, MapPin } from 'lucide-react';
import { loadGoogleMaps } from '@/utils/google-maps-loader';

interface RouteMapProps {
  pickup: Location;
  dropoff: Location;
  height?: string;
}

export default function RouteMap({ pickup, dropoff, height = '250px' }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeMap = useCallback(async () => {
    if (!pickup || !dropoff || !mapRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load Google Maps if needed
      if (!window.google) {
        await loadGoogleMaps();
      }

      if (!window.google || !mapRef.current) {
        throw new Error('Map initialization failed');
      }

      // Initialize map
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: pickup.lat, lng: pickup.lng },
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e0f2fe' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#e2e8f0' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false
      });

      // Add markers
      new google.maps.Marker({
        position: { lat: pickup.lat, lng: pickup.lng },
        map: mapInstanceRef.current,
        title: 'Pickup Location',
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjM0Y4M0Y2Ii8+Cjwvc3ZnPg==',
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });

      new google.maps.Marker({
        position: { lat: dropoff.lat, lng: dropoff.lng },
        map: mapInstanceRef.current,
        title: 'Drop-off Location',
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjMTBBODc0Ii8+Cjwvc3ZnPg==',
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });

      // Initialize directions renderer
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });

      // Calculate route
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: dropoff.lat, lng: dropoff.lng },
        travelMode: google.maps.TravelMode.DRIVING
      });

      directionsRendererRef.current.setDirections(result);

      // Fit bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(pickup.lat, pickup.lng));
      bounds.extend(new google.maps.LatLng(dropoff.lat, dropoff.lng));
      result.routes[0].legs[0].steps.forEach(step => {
        bounds.extend(step.start_location);
        bounds.extend(step.end_location);
      });
      mapInstanceRef.current.fitBounds(bounds, 50);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Could not load map');
      setLoading(false);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    initializeMap();

    // Cleanup
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMap]);

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

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center" style={{ height }}>
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">{error}</p>
          <div className="mt-2 text-xs text-gray-500">
            <p>Pickup: {pickup.address}</p>
            <p>Dropoff: {dropoff.address}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full"
      />
    </div>
  );
}