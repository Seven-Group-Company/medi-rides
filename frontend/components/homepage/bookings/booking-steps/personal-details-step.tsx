'use client';

import { motion } from 'framer-motion';
import { User, Phone, ChevronRight } from 'lucide-react';
import { BookingStepProps } from '@/types/guest-booking-types';

export default function PersonalDetailsStep({ formData, updateFormData, errors, onNext }: BookingStepProps) {
  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.passengerName.trim()) newErrors.passengerName = 'Name required';
    
    if (!formData.passengerPhone.trim()) {
      newErrors.passengerPhone = 'Phone required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.passengerPhone.replace(/\D/g, ''))) {
      newErrors.passengerPhone = 'Invalid phone';
    }

    if (Object.keys(newErrors).length > 0) return;
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
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Details</h2>
        <p className="text-xs text-gray-600">For ride confirmation</p>
      </div>

      <div className="space-y-3">
        <div>
          <div className={`flex items-center p-3 border rounded-lg transition-colors ${
            errors.passengerName ? 'border-red-500' : 'border-gray-200 hover:border-blue-400'
          }`}>
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.passengerName}
              onChange={(e) => updateFormData({ passengerName: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-sm ml-2 placeholder-gray-400"
            />
          </div>
          {errors.passengerName && (
            <p className="mt-1 text-xs text-red-600">{errors.passengerName}</p>
          )}
        </div>

        <div>
          <div className={`flex items-center p-3 border rounded-lg transition-colors ${
            errors.passengerPhone ? 'border-red-500' : 'border-gray-200 hover:border-blue-400'
          }`}>
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="tel"
              placeholder="Mobile *"
              value={formData.passengerPhone}
              onChange={(e) => updateFormData({ passengerPhone: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-sm ml-2 placeholder-gray-400"
            />
          </div>
          {errors.passengerPhone && (
            <p className="mt-1 text-xs text-red-600">{errors.passengerPhone}</p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={validateAndProceed}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>
    </motion.div>
  );
}