'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
        const distanceMiles = response.rows[0].elements[0].distance.value / 1609.34;
        const duration = response.rows[0].elements[0].duration.value / 60;

        updateFormData({
          distanceMiles: parseFloat(distanceMiles.toFixed(1)),
          estimatedTime: Math.ceil(duration),
        });
      }
    } catch (error) {
      console.error('Route calc error:', error);
    }
  }, [updateFormData]);

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
    if (!formData.pickup || !formData.dropoff) {
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Where to?</h2>
        <p className="text-xs text-gray-600">Enter pickup & drop-off</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Pickup *
            </label>
            <AutocompleteInput
              placeholder="Pickup address"
              onPlaceSelected={(place) => handleLocationSelect('pickup', place)}
              value={formData.pickup?.address || ''}
              className={errors.pickup ? 'border-red-500' : ''}
              error={!!errors.pickup}
            />
            {errors.pickup && (
              <p className="mt-1 text-xs text-red-600">{errors.pickup}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Drop-off *
            </label>
            <AutocompleteInput
              placeholder="Destination"
              onPlaceSelected={(place) => handleLocationSelect('dropoff', place)}
              value={formData.dropoff?.address || ''}
              className={errors.dropoff ? 'border-red-500' : ''}
              error={!!errors.dropoff}
            />
            {errors.dropoff && (
              <p className="mt-1 text-xs text-red-600">{errors.dropoff}</p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {formData.pickup && formData.dropoff && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <RouteMap 
                pickup={formData.pickup} 
                dropoff={formData.dropoff} 
                height="150px"
              />
              
              {formData.distanceMiles && formData.estimatedTime && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center justify-center text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    <Navigation className="w-3 h-3 mr-1 text-blue-600" />
                    <span className="font-medium">{formData.distanceMiles} mi</span>
                  </div>
                  <div className="flex items-center justify-center text-xs text-gray-600 bg-blue-50 p-2 rounded">
                    <Clock className="w-3 h-3 mr-1 text-blue-600" />
                    <span className="font-medium">~{formData.estimatedTime} min</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPrev}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={validateAndProceed}
            disabled={!formData.pickup || !formData.dropoff}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm shadow hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}