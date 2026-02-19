'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';

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
  error
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== value) {
        searchAddress(inputValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, searchAddress, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: any) => {
    const formattedPlace = {
      formatted_address: suggestion.display_name,
      geometry: {
        location: {
          lat: () => parseFloat(suggestion.lat),
          lng: () => parseFloat(suggestion.lon)
        }
      },
      name: suggestion.display_name.split(',')[0]
    };

    setInputValue(suggestion.display_name);
    setShowSuggestions(false);
    onPlaceSelected(formattedPlace);
    onChange?.(suggestion.display_name);
  };

  return (
    <div className="relative" ref={containerRef}>
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
          onChange?.(e.target.value);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={`pl-10 w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${className}`}
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left p-3 hover:bg-gray-50 flex items-start gap-3 transition-colors border-b last:border-0 border-gray-100"
              onClick={() => handleSelect(suggestion)}
            >
              <Search className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{suggestion.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}