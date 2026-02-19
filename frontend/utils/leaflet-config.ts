// Defer importing Leaflet and related CSS to runtime on the client
// so this module can be imported safely during SSR.

export const DEFAULT_VIEW = {
  lat: 61.5816,
  lng: -149.4394,
  zoom: 11,
};

export const getLeafletIcon = (type: 'pickup' | 'dropoff' | 'service') => {
  if (typeof window === 'undefined') {
    // On server, return a lightweight stub to avoid referencing `window`.
    // Consumers should only call this on the client.
    return null as any;
  }

  // Require Leaflet and styles at runtime on the client only
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require('leaflet');
  try {
    require('leaflet/dist/leaflet.css');
  } catch (e) {
    // ignore in environments where CSS imports aren't supported
  }
  try {
    require('leaflet-defaulticon-compatibility');
    require('leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css');
  } catch (e) {
    // optional compatibility package may not be present
  }

  const colors = {
    pickup: '#3b82f6',
    dropoff: '#10A874',
    service: '#0A2342',
  };

  const color = colors[type];

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${color}"/>
    </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};
