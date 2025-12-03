'use client';

import { useEffect, useRef } from 'react';

const GoogleMapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onload = initializeMap;
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      // Wasilla, Alaska coordinates
      const wasilla = { lat: 61.5816, lng: -149.4394 };

      const map = new google.maps.Map(mapRef.current, {
        center: wasilla,
        zoom: 11,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#0A2342' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });

      // Add main Wasilla marker
      new google.maps.Marker({
        position: wasilla,
        map: map,
        title: 'Wasilla Service Center',
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMCA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDBDNi43MTU3MyAwIDAgNi43MTU3MyAwIDE1QzAgMjYgMTUgNDIgMTUgNDJDMTUgNDIgMzAgMjYgMzAgMTVDMzAgNi43MTU3MyAyMy4yODQzIDAgMTUgMFoiIGZpbGw9IiMwQTIzNDIiLz4KPHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMEMzLjEzNDAxIDAgMCAzLjEzNDAxIDAgN0MwIDEwLjg2NiAzLjEzNDAxIDE0IDcgMTRDMTAuODY2IDE0IDE0IDEwLjg2NiAxNCA3QzE0IDMuMTM0MDEgMTAuODY2IDAgNyAwWk03IDMuNUM3LjgyODQyIDMuNSA4LjUgNC4xNzE1OCA4LjUgNUM4LjUgNS44Mjg0MiA3LjgyODQyIDYuNSA3IDYuNUM2LjE3MTU4IDYuNSA1LjUgNS44Mjg0MiA1LjUgNUM1LjUgNC4xNzE1OCA2LjE3MTU4IDMuNSA3IDMuNVpNNyA3LjVCNy4yNzYxNCA3LjUgNy41IDcuNzc2MTQgNy41IDhWMTAuNUM3LjUgMTAuNzc2MSA3LjI3NjE0IDExIDcgMTFDNi43MjM4NiAxMSA2LjUgMTAuNzc2MSA2LjUgMTAuNVY4QzYuNSA3Ljc3NjE0IDYuNzIzODYgNy41IDcgNy41WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
          scaledSize: new google.maps.Size(30, 42),
        }
      });

      // Add service area circle
      new google.maps.Circle({
        strokeColor: '#B0D6FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#B0D6FF',
        fillOpacity: 0.2,
        map: map,
        center: wasilla,
        radius: 8000 // 8km radius around Wasilla
      });

      // Add nearby community markers
      const nearbyCommunities = [
        { name: 'Palmer', lat: 61.5997, lng: -149.1127 },
        { name: 'Big Lake', lat: 61.5214, lng: -149.9544 },
        { name: 'Houston', lat: 61.6303, lng: -149.8181 },
        { name: 'Willow', lat: 61.7472, lng: -150.0375 }
      ];

      nearbyCommunities.forEach(community => {
        new google.maps.Marker({
          position: community,
          map: map,
          title: community.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#0A2342',
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });
      });
    };

    loadGoogleMaps();
  }, []);

  return (
    <div className="w-full h-96 md:h-[500px]">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default GoogleMapComponent;