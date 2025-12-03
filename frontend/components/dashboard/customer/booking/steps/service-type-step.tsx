'use client';

import { motion } from 'framer-motion';
import { Car, Stethoscope, Plane, ShoppingCart, Type, Loader } from 'lucide-react';
import { BookingStepProps } from '@/types/booking.types';

// Icon mapping for service categories
const iconMap: { [key: string]: any } = {
  'Stethoscope': Stethoscope,
  'Car': Car,
  'Plane': Plane,
  'ShoppingCart': ShoppingCart,
  'Type': Type,
};

export default function ServiceTypeStep({ 
  formData, 
  updateFormData, 
  errors, 
  onNext, 
  onBack,
  serviceCategories = [],
  isLoadingCategories = false
}: BookingStepProps) {
  
  const handleServiceSelect = (category: any) => {
    updateFormData({ 
      serviceType: category.value,
      serviceCategoryId: category.id 
    });
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Type;
    return <IconComponent className="w-8 h-8 mb-3" />;
  };

  if (isLoadingCategories) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What type of service do you need?</h2>
          <p className="text-gray-600">Choose the service that best fits your needs</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading services...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">What type of service do you need?</h2>
        <p className="text-gray-600">Choose the service that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceCategories.map((category) => {
          const isSelected = formData.serviceCategoryId === category.id;
          
          return (
            <motion.button
              key={category.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
              onClick={() => handleServiceSelect(category)}
            >
              {getIconComponent(category.icon)}
              <span className={`block text-lg font-semibold mb-2 ${
                isSelected ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {category.name}
              </span>
              <span className={`text-sm ${
                isSelected ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {category.description}
              </span>
              {category.basePrice && (
                <div className={`mt-2 text-xs ${
                  isSelected ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Starting from ${category.basePrice}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {errors.serviceType && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 text-center"
        >
          {errors.serviceType}
        </motion.p>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
        >
          Back
        </motion.button>
        
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!formData.serviceCategoryId}
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