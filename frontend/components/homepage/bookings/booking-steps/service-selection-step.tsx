'use client';

import { motion } from 'framer-motion';
import { Car, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { ServiceCategory } from '@/services/guest-booking.service';
import { BookingStepProps } from '@/types/guest-booking-types';

export default function ServiceSelectionStep({
  formData,
  updateFormData,
  errors,
  onNext,
  onPrev,
  categories,
  isLoading
}: BookingStepProps) {
  const handleServiceSelect = (service: ServiceCategory) => {
    updateFormData({ 
      serviceCategoryId: service.id,
      serviceType: service.name 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose Ride</h2>
        <p className="text-xs text-gray-600">Select service type</p>
      </div>

      {errors.service && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-100 rounded-lg p-2 mb-3"
        >
          <p className="text-red-700 text-xs text-center">{errors.service}</p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600 mb-2" />
          <p className="text-xs text-gray-600">Loading services...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Car className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-xs text-gray-600">No services available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleServiceSelect(service)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 border ${
                formData.serviceCategoryId === service.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${
                  formData.serviceCategoryId === service.id
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}>
                  <Car className={`w-5 h-5 ${
                    formData.serviceCategoryId === service.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{service.name}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{service.description}</div>
                </div>
                <ChevronRight className={`w-4 h-4 ${
                  formData.serviceCategoryId === service.id ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3">
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
          onClick={onNext}
          disabled={!formData.serviceCategoryId || categories.length === 0}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm shadow hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>
    </motion.div>
  );
}