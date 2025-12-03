'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingStepProps } from '@/types/guest-booking-types';
import AutocompleteInput from '../autocomplete-input';
import RouteMap from '@/components/dashboard/customer/booking/route-map';
import { useCallback, useEffect } from 'react';

export default function LocationStep({ 
  formData, 
  updateFormData, 
  errors, 
  onNext,
  onPrev 
}: BookingStepProps & { onPrev: () => void }) {
  
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

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pickup) {
      newErrors.pickup = 'Pickup location is required';
    }
    
    if (!formData.dropoff) {
      newErrors.dropoff = 'Drop-off location is required';
    }

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Where to?</h2>
        <p className="text-gray-600 text-sm">Enter your pickup and drop-off locations</p>
      </div>

      <div className="space-y-4">
        {/* Location Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Pickup Location *
            </label>
            <AutocompleteInput
              placeholder="Enter pickup address"
              onPlaceSelected={(place) => handleLocationSelect('pickup', place)}
              className={errors.pickup ? 'border-red-500' : ''}
              error={!!errors.pickup}
            />
            {errors.pickup && (
              <p className="mt-1 text-sm text-red-600">{errors.pickup}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Drop-off Location *
            </label>
            <AutocompleteInput
              placeholder="Enter drop-off address"
              onPlaceSelected={(place) => handleLocationSelect('dropoff', place)}
              className={errors.dropoff ? 'border-red-500' : ''}
              error={!!errors.dropoff}
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
                height="200px"
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

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPrev}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={validateAndProceed}
            disabled={!formData.pickup || !formData.dropoff}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}