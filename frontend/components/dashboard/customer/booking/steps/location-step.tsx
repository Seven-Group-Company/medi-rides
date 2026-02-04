'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Clock } from 'lucide-react';
import { BookingStepProps } from '@/types/booking.types';
import AutocompleteInput from '@/components/dashboard/customer/booking/autocomplete-input';
import RouteMap from '@/components/dashboard/customer/booking/route-map';
import { useCallback, useEffect } from 'react';

export default function LocationStep({ 
  formData, 
  updateFormData, 
  errors, 
  onNext 
}: BookingStepProps) {
  
  const calculateRoute = useCallback(async () => {
    if (!window.google || !formData.pickup || !formData.dropoff) return;

    try {
      const service = new google.maps.DistanceMatrixService();
      const response = await service.getDistanceMatrix({
        origins: [new google.maps.LatLng(formData.pickup.lat, formData.pickup.lng)],
        destinations: [new google.maps.LatLng(formData.dropoff.lat, formData.dropoff.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      });

      if (response.rows[0].elements[0].status === 'OK') {
        const distance = response.rows[0].elements[0].distance.value / 1000;
        const duration = response.rows[0].elements[0].duration.value / 60;

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
    updateFormData({
      [type]: {
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
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
          Continue to Service Type
        </motion.button>
      </div>
    </motion.div>
  );
}