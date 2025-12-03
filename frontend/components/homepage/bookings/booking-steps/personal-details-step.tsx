'use client';

import { motion } from 'framer-motion';
import { User, Phone, ChevronRight } from 'lucide-react';
import { BookingStepProps } from '@/types/guest-booking-types';

export default function PersonalDetailsStep({ formData, updateFormData, errors, onNext }: BookingStepProps) {
  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.passengerName.trim()) {
      newErrors.passengerName = 'Name is required';
    }
    
    if (!formData.passengerPhone.trim()) {
      newErrors.passengerPhone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.passengerPhone.replace(/\D/g, ''))) {
      newErrors.passengerPhone = 'Please enter a valid phone number';
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Details</h2>
        <p className="text-gray-600 text-sm">We'll use this to confirm your ride</p>
      </div>

      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <div className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors ${
            errors.passengerName ? 'border-red-500' : 'border-gray-200 hover:border-blue-400'
          }`}>
            <User className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.passengerName}
              onChange={(e) => updateFormData({ passengerName: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-400"
            />
          </div>
          {errors.passengerName && (
            <p className="mt-1 text-sm text-red-600">{errors.passengerName}</p>
          )}
        </div>

        {/* Phone Input */}
        <div>
          <div className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors ${
            errors.passengerPhone ? 'border-red-500' : 'border-gray-200 hover:border-blue-400'
          }`}>
            <Phone className="w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Mobile Number *"
              value={formData.passengerPhone}
              onChange={(e) => updateFormData({ passengerPhone: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-400"
            />
          </div>
          {errors.passengerPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.passengerPhone}</p>
          )}
        </div>

        {/* Continue Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={validateAndProceed}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </motion.div>
  );
}