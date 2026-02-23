'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Clock } from 'lucide-react';
import { BookingStepProps } from '@/types/booking.types';
import AutocompleteInput from '@/components/dashboard/customer/booking/autocomplete-input';
import dynamic from 'next/dynamic';
const RouteMap = dynamic(() => import('@/components/dashboard/customer/booking/route-map'), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center h-[250px]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});
import { useCallback, useEffect } from 'react';

export default function LocationStep({ 
  formData, 
  updateFormData, 
  errors, 
  onNext 
}: BookingStepProps) {
  
  const calculateRoute = useCallback(async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
    if (!formData.pickup || !formData.dropoff) return;

    try {
      const response = await fetch(
        `${API_URL}/public/maps/route?pickup=${formData.pickup.lng},${formData.pickup.lat}&dropoff=${formData.dropoff.lng},${formData.dropoff.lat}`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const distance = data.routes[0].distance / 1000;
        const duration = data.routes[0].duration / 60;

        updateFormData({
          distanceKm: parseFloat(distance.toFixed(1)),
          estimatedTime: Math.ceil(duration),
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }, [formData.pickup, formData.dropoff, updateFormData]);

  useEffect(() => {
    if (formData.pickup && formData.dropoff) {
      calculateRoute();
    }
  }, [formData.pickup, formData.dropoff, calculateRoute]);

  const handleLocationSelect = (type: 'pickup' | 'dropoff', place: any) => {
    const lat = typeof place.geometry.location.lat === 'function' 
      ? place.geometry.location.lat() 
      : place.geometry.location.lat;
    const lng = typeof place.geometry.location.lng === 'function' 
      ? place.geometry.location.lng() 
      : place.geometry.location.lng;
    
    updateFormData({
      [type]: {
        address: place.formatted_address,
        lat,
        lng
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Where are you going?</h2>
        <p className="text-gray-600">Enter your pickup and drop-off locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location *
          </label>
          <AutocompleteInput
            placeholder="Enter pickup address"
            onPlaceSelected={(place) => handleLocationSelect('pickup', place)}
            className={errors.pickup ? 'border-red-500' : ''}
          />
          {errors.pickup && (
            <p className="mt-1 text-sm text-red-600">{errors.pickup}</p>
          )}
        </div>

        {/* Drop-off Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drop-off Location *
          </label>
          <AutocompleteInput
            placeholder="Enter drop-off address"
            onPlaceSelected={(place) => handleLocationSelect('dropoff', place)}
            className={errors.dropoff ? 'border-red-500' : ''}
          />
          {errors.dropoff && (
            <p className="mt-1 text-sm text-red-600">{errors.dropoff}</p>
          )}
        </div>
      </div>

      {/* Route Preview */}
      <AnimatePresence>
        {formData.pickup && formData.dropoff && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <RouteMap 
              pickup={formData.pickup} 
              dropoff={formData.dropoff} 
              height="250px"
            />
            
            {/* Distance & Time Info */}
            {formData.distanceKm && formData.estimatedTime && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center justify-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Navigation className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium">{formData.distanceKm} km</span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium">~{formData.estimatedTime} min</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Button */}
      <div className="flex justify-end pt-6">
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!formData.pickup || !formData.dropoff}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Continue to Schedule
        </motion.button>
      </div>
    </motion.div>
  );
}