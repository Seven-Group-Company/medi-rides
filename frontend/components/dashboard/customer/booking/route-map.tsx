'use client';

import { useEffect, useRef, useState } from 'react';
import { Location } from '@/types/booking.types';
import { Loader2, MapPin } from 'lucide-react';
import { loadGoogleMaps } from '@/utils/google-maps-loader';

interface RouteMapProps {
  pickup: Location;
  dropoff: Location;
  height?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function RouteMap({ pickup, dropoff, height = '300px' }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pickup || !dropoff) return;

    const init = async () => {
      try {
        setLoading(true);
        await loadGoogleMaps();
        setMapsLoaded(true);
        initializeMap();
      } catch (err) {
        console.error('Map loading failed:', err);
        setError('Failed to load maps');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [pickup, dropoff]);


  const initializeMap = () => {
    if (!window.google || !mapRef.current) {
      // If ref is not ready, try again in a bit
      setTimeout(initializeMap, 100);
      return;
    }

    try {
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
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });

      // Add markers for pickup and dropoff
      new google.maps.Marker({
        position: { lat: pickup.lat, lng: pickup.lng },
        map: mapInstanceRef.current,
        title: 'Pickup Location',
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjM0Y4M0Y2Ii8+Cjwvc3ZnPg==',
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 24)
        }
      });

      new google.maps.Marker({
        position: { lat: dropoff.lat, lng: dropoff.lng },
        map: mapInstanceRef.current,
        title: 'Drop-off Location',
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjMTBBODc0Ii8+Cjwvc3ZnPg==',
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 24)
        }
      });

      // Initialize directions renderer
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true, // We're using custom markers
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });

      // Calculate and display route
      calculateRoute();

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map');
    }
  };

  const calculateRoute = async () => {
    if (!directionsRendererRef.current || !mapInstanceRef.current) return;

    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: dropoff.lat, lng: dropoff.lng },
        travelMode: google.maps.TravelMode.DRIVING
      });

      directionsRendererRef.current.setDirections(result);

      // Adjust map bounds to show entire route
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(pickup.lat, pickup.lng));
      bounds.extend(new google.maps.LatLng(dropoff.lat, dropoff.lng));
      
      result.routes[0].legs[0].steps.forEach(step => {
        bounds.extend(step.start_location);
        bounds.extend(step.end_location);
      });
      
      mapInstanceRef.current.fitBounds(bounds, 50);

    } catch (error) {
      console.error('Error calculating route:', error);
      setError('Could not calculate route');
      
      // Fallback: just show both points
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(pickup.lat, pickup.lng));
      bounds.extend(new google.maps.LatLng(dropoff.lat, dropoff.lng));
      mapInstanceRef.current?.fitBounds(bounds, 50);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <p className="text-gray-600 text-sm mt-1">Pickup: {pickup.address}</p>
          <p className="text-gray-600 text-sm">Dropoff: {dropoff.address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full"
      />
    </div>
  );
}