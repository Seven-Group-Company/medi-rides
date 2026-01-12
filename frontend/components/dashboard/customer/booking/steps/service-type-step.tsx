'use client';

import { motion } from 'framer-motion';
import { Car, Stethoscope, Plane, Building, Heart, Home, Ticket, BookOpen, DollarSign, Shield, Loader, Check } from 'lucide-react';
import { BookingStepProps } from '@/types/booking.types';
import { useState } from 'react';

const iconMap: { [key: string]: any } = {
  'Stethoscope': Stethoscope,
  'Car': Car,
  'Plane': Plane,
  'Building': Building,
  'Heart': Heart,
  'Home': Home,
  'Ticket': Ticket,
  'BookOpen': BookOpen,
  'DollarSign': DollarSign,
  'Shield': Shield,
};


// Charge options
const chargeOptions = [
  { id: 'private', name: 'Private Pay', description: 'Pay directly for service' },
  { id: 'waiver', name: 'Waiver/Voucher', description: 'ALI, APDD, ISW' },
];

  const serviceCategoriesList = [
  {
    id: 1,
    name: 'Non-Emergency Medical Transportation',
    value: 'medical-transport',
    description: 'Transport to medical facilities and appointments',
    icon: 'Stethoscope',
    basePrice: 25,
    pricePerMile: 2.5,
    serviceType: 'MEDICAL',
  },
  {
    id: 2,
    name: 'Doctor\'s Appointments',
    value: 'doctor-appointment',
    description: 'Transportation for routine doctor visits',
    icon: 'Stethoscope',
    basePrice: 25,
    pricePerMile: 2.5,
    serviceType: 'MEDICAL',
  },
  {
    id: 3,
    name: 'Non-Emergency Hospital Visits',
    value: 'hospital-visit',
    description: 'Transport for hospital outpatient visits',
    icon: 'Building',
    basePrice: 30,
    pricePerMile: 2.8,
    serviceType: 'MEDICAL',
  },
  {
    id: 4,
    name: 'Hospital Discharge',
    value: 'hospital-discharge',
    description: 'Transport home after hospital stay',
    icon: 'Home',
    basePrice: 35,
    pricePerMile: 3.0,
    serviceType: 'MEDICAL',
  },
  {
    id: 5,
    name: 'Dialysis',
    value: 'dialysis',
    description: 'Regular transport for dialysis treatment',
    icon: 'Heart',
    basePrice: 30,
    pricePerMile: 2.5,
    serviceType: 'MEDICAL',
  },
  {
    id: 6,
    name: 'Physical Therapy Rehabilitation',
    value: 'physical-therapy',
    description: 'Transport to physical therapy sessions',
    icon: 'Stethoscope',
    basePrice: 25,
    pricePerMile: 2.5,
    serviceType: 'MEDICAL',
  },
  {
    id: 7,
    name: 'Stroke Rehabilitation',
    value: 'stroke-rehab',
    description: 'Transport for stroke recovery therapy',
    icon: 'Heart',
    basePrice: 30,
    pricePerMile: 2.8,
    serviceType: 'MEDICAL',
  },
  {
    id: 8,
    name: 'Pulmonary & Cardiac Rehabilitation',
    value: 'cardiac-rehab',
    description: 'Transport for heart and lung rehabilitation',
    icon: 'Heart',
    basePrice: 30,
    pricePerMile: 2.8,
    serviceType: 'MEDICAL',
  },
  {
    id: 9,
    name: 'General Transportation & Personal Travel',
    value: 'general-transport',
    description: 'Personal transportation within the valley',
    icon: 'Car',
    basePrice: 20,
    pricePerMile: 2.0,
    serviceType: 'GENERAL',
  },
  {
    id: 10,
    name: 'Airports',
    value: 'airport',
    description: 'Transport to/from Phoenix Sky Harbor and other airports',
    icon: 'Plane',
    basePrice: 35,
    pricePerMile: 3.0,
    serviceType: 'GENERAL',
  },
  {
    id: 11,
    name: 'Long Distance Trips',
    value: 'long-distance',
    description: 'Extended trips outside the valley',
    icon: 'Car',
    basePrice: 50,
    pricePerMile: 2.0,
    serviceType: 'GENERAL',
  },
  {
    id: 12,
    name: 'Train or Bus Stations',
    value: 'station',
    description: 'Transport to/from transportation hubs',
    icon: 'Building',
    basePrice: 25,
    pricePerMile: 2.5,
    serviceType: 'GENERAL',
  },
  {
    id: 13,
    name: 'Sporting Events',
    value: 'sports',
    description: 'Transport to games and sporting events',
    icon: 'Ticket',
    basePrice: 30,
    pricePerMile: 2.8,
    serviceType: 'GENERAL',
  },
  {
    id: 14,
    name: 'Special & Family Events',
    value: 'events',
    description: 'Transport for weddings, parties, and gatherings',
    icon: 'Ticket',
    basePrice: 30,
    pricePerMile: 2.8,
    serviceType: 'GENERAL',
  },
  {
    id: 15,
    name: 'Library or Museum Trips',
    value: 'cultural',
    description: 'Transport for educational and cultural visits',
    icon: 'Library',
    basePrice: 25,
    pricePerMile: 2.5,
    serviceType: 'GENERAL',
  },
  {
    id: 16,
    name: 'Wheelchair Transportation',
    value: 'wheelchair',
    description: 'Specialized transport for wheelchair users',
    icon: 'Shield',
    basePrice: 40,
    pricePerMile: 3.5,
    serviceType: 'WHEELCHAIR',
  },
];

export default function ServiceTypeStep({ 
  formData, 
  updateFormData, 
  errors, 
  onNext, 
  onBack,
  serviceCategories = serviceCategoriesList,
  isLoadingCategories = false
}: BookingStepProps) {
  
  const [selectedChargeOption, setSelectedChargeOption] = useState<string>(formData.chargeOption || 'private');

  const handleServiceSelect = (category: any) => {
    updateFormData({ 
      serviceType: category.value,
      serviceCategoryId: category.id,
      serviceName: category.name,
      serviceIcon: category.icon
    });
  };

  const handleChargeOptionSelect = (optionId: string) => {
    setSelectedChargeOption(optionId);
    updateFormData({ chargeOption: optionId });
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Car;
    return <IconComponent className="w-6 h-6" />;
  };

  if (isLoadingCategories) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Select Service Type</h2>
          <p className="text-gray-600">Choose the service that best fits your needs</p>
        </div>
        <div className="flex justify-center items-center py-16">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Select Service Type</h2>
        <p className="text-gray-600 mb-6">Choose the service that best fits your needs</p>

        {/* Service Categories Grid */}
        <div className="flex flex-col gap-4 mb-8 h-64 overflow-y-auto">
          {serviceCategories.map((category) => {
            const isSelected = formData.serviceCategoryId === category.id;
            
            return (
              <motion.button
                key={category.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleServiceSelect(category)}
                className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getIconComponent(category.icon)}
                  </div>
                  <div className="flex-1">
                    <span className={`block font-medium mb-1 ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </span>
                    <span className={`text-sm ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Payment Method Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        
        {/* Payment Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {chargeOptions.map((option) => (
            <motion.button
              key={option.id}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChargeOptionSelect(option.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedChargeOption === option.id
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-left">
                <span className={`font-medium block mb-1 ${
                  selectedChargeOption === option.id ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {option.name}
                </span>
                <p className={`text-xs ${
                  selectedChargeOption === option.id ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
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
      <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-200">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3.5 px-6 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200 sm:flex-1"
        >
          Back
        </motion.button>
        
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!formData.serviceCategoryId || !selectedChargeOption}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3.5 px-6 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 sm:flex-1"
        >
          Continue to Schedule
        </motion.button>
      </div>
    </motion.div>
  );
}