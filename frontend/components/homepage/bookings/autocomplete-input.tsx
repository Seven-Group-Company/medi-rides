'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { loadGoogleMaps } from '@/utils/google-maps-loader';

interface AutocompleteInputProps {
  placeholder: string;
  onPlaceSelected: (place: any) => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export default function AutocompleteInput({ 
  placeholder, 
  onPlaceSelected, 
  className = '',
  value = '',
  onChange,
  error = false
}: AutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const isInitializedRef = useRef(false);

  // Update input value when external value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const initAutocomplete = async () => {
      if (!inputRef.current || isInitializedRef.current) return;

      try {
        setLoading(true);
        
        // Load Google Maps if not already loaded
        if (!window.google) {
          await loadGoogleMaps();
        }

        if (!window.google || !inputRef.current) {
          throw new Error('Google Maps not available');
        }

        // Initialize autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'name'],
          types: ['geocode']
        });

        const handlePlaceChanged = () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.geometry && place.formatted_address) {
            onPlaceSelected(place);
            setInputValue(place.formatted_address);
            if (onChange) {
              onChange(place.formatted_address);
            }
          }
        };

        autocompleteRef.current.addListener('place_changed', handlePlaceChanged);

        // Prevent form submission on enter
        inputRef.current.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        });

        isInitializedRef.current = true;

      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      } finally {
        setLoading(false);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current && isInitializedRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleInputFocus = () => {
    // Clear the input on focus to allow re-selection
    if (inputRef.current && inputValue) {
      // Optional: Allow users to clear and re-select
      
      // Uncomment the next line if you want the input cleared on focus
      // setInputValue('');
    }
  };

  const borderColor = error ? 'border-red-500' : 'border-gray-200 hover:border-blue-400';
  const focusRing = error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500';

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={loading ? "Loading maps..." : placeholder}
        disabled={loading}
        className={`pl-10 w-full p-3 border-2 ${borderColor} rounded-lg ${focusRing} transition-colors ${
          className
        } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}