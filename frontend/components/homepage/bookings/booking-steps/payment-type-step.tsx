'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CreditCard, Shield, FileText, Users, Building } from 'lucide-react';
import { BookingStepProps } from '@/types/guest-booking-types';

const PAYMENT_TYPES = [
  {
    id: 'private',
    label: 'Private Pay',
    description: 'Pay with your own funds',
    icon: CreditCard,
    color: 'bg-blue-100 border-blue-200 text-blue-700',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-300'
  },
  {
    id: 'waiver',
    label: 'Waivers/Vouchers',
    description: 'ALI, APDD, IDD, ISW',
    icon: Shield,
    color: 'bg-green-100 border-green-200 text-green-700',
    hoverColor: 'hover:bg-green-50 hover:border-green-300'
  },
];

export default function PaymentTypeStep({
  formData,
  updateFormData,
  errors,
  onNext,
  onPrev,
}: BookingStepProps) {
  const handlePaymentTypeSelect = (paymentType: 'private' | 'waiver') => {
    updateFormData({ paymentType });
  };

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.paymentType) {
      newErrors.paymentType = 'Please select a payment type';
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-600 text-sm">Select how you'll be paying for this ride</p>
      </div>

      {/* Error Message */}
      {errors.paymentType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4"
        >
          <p className="text-red-700 text-sm text-center">{errors.paymentType}</p>
        </motion.div>
      )}

      {/* Payment Type Options */}
      <div className="space-y-3">
        {PAYMENT_TYPES.map((paymentType, index) => {
          const Icon = paymentType.icon;
          return (
            <motion.button
              key={paymentType.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handlePaymentTypeSelect(paymentType.id as any)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ${paymentType.color} ${paymentType.hoverColor} ${
                formData.paymentType === paymentType.id
                  ? 'ring-2 ring-offset-2 ring-blue-500'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${paymentType.color.split(' ')[0]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{paymentType.label}</div>
                  <div className="text-sm opacity-80 mt-1">{paymentType.description}</div>
                </div>
                {formData.paymentType === paymentType.id && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

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
          disabled={!formData.paymentType}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </motion.div>
  );
}