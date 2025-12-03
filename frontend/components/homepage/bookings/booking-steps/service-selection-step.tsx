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
    // No need to calculate price here, it will be calculated automatically
    // when serviceCategoryId changes in the parent component
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Ride</h2>
        <p className="text-gray-600 text-sm">Select the service that fits your needs</p>
      </div>

      {/* Error Message */}
      {errors.service && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4"
        >
          <p className="text-red-700 text-sm text-center">{errors.service}</p>
        </motion.div>
      )}

      {/* Service Options */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-gray-600">Loading available services...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Car className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No services available at the moment</p>
          <p className="text-gray-500 text-sm mt-1">Please try again later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleServiceSelect(service)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                formData.serviceCategoryId === service.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  formData.serviceCategoryId === service.id
                    ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  <Car className={`w-6 h-6 ${
                    formData.serviceCategoryId === service.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                  {service.basePrice > 0 && (
                    <div className="text-sm font-medium text-blue-600 mt-2">
                      Base fare: ${service.basePrice}
                    </div>
                  )}
                  {service.pricePerMile > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      ${service.pricePerMile}/mile after base distance
                    </div>
                  )}
                  {service.serviceType && (
                    <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${
                      service.serviceType === 'MEDICAL' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {service.serviceType}
                    </div>
                  )}
                </div>
                <ChevronRight className={`w-5 h-5 ${
                  formData.serviceCategoryId === service.id ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
            </motion.button>
          ))}
        </div>
      )}

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
          onClick={onNext}
          disabled={!formData.serviceCategoryId || categories.length === 0}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </motion.div>
  );
}