let googleMapsLoadingPromise: Promise<void> | null = null;
let isGoogleMapsLoaded = false;

declare global {
  interface Window {
    google: any;
  }
}

export function loadGoogleMaps(): Promise<void> {
  // Return if already loaded
  if (isGoogleMapsLoaded && window.google) {
    return Promise.resolve();
  }

  // Return existing promise if loading
  if (googleMapsLoadingPromise) {
    return googleMapsLoadingPromise;
  }

  // Check if script is already in DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    googleMapsLoadingPromise = new Promise((resolve) => {
      const checkGoogle = () => {
        if (window.google) {
          isGoogleMapsLoaded = true;
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    });
    return googleMapsLoadingPromise;
  }

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key is missing'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps:', error);
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
}