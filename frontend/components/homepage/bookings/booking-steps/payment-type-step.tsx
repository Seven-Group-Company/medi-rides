'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CreditCard, Shield } from 'lucide-react';
import { BookingStepProps } from '@/types/guest-booking-types';

const PAYMENT_TYPES = [
  {
    id: 'private',
    label: 'Private Pay',
    description: 'Pay with own funds',
    icon: CreditCard,
    color: 'bg-blue-100 border-blue-200 text-blue-700',
  },
  {
    id: 'waiver',
    label: 'Waiver/Voucher',
    description: 'ALI, APDD, IDD',
    icon: Shield,
    color: 'bg-green-100 border-green-200 text-green-700',
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
    if (!formData.paymentType) return;
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
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment</h2>
        <p className="text-xs text-gray-600">Select payment method</p>
      </div>

      {errors.paymentType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border border-red-100 rounded-lg p-2 mb-3"
        >
          <p className="text-red-700 text-xs text-center">{errors.paymentType}</p>
        </motion.div>
      )}

      <div className="space-y-2">
        {PAYMENT_TYPES.map((paymentType, index) => {
          const Icon = paymentType.icon;
          return (
            <motion.button
              key={paymentType.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handlePaymentTypeSelect(paymentType.id as any)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 border ${paymentType.color} ${
                formData.paymentType === paymentType.id
                  ? 'ring-2 ring-offset-1 ring-blue-500'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${paymentType.color.split(' ')[0]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{paymentType.label}</div>
                  <div className="text-xs opacity-80 mt-0.5">{paymentType.description}</div>
                </div>
                {formData.paymentType === paymentType.id && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

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
          onClick={validateAndProceed}
          disabled={!formData.paymentType}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm shadow hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>
    </motion.div>
  );
}