'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'You' },
    { number: 2, label: 'Where' },
    { number: 3, label: 'Ride' },
    { number: 4, label: 'Pay' },
    { number: 5, label: 'When' },
    { number: 6, label: 'Review' }
  ];

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
      {steps.map((step) => (
        <div key={step.number} className="flex items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: currentStep >= step.number ? 1.1 : 1,
              backgroundColor: currentStep >= step.number ? '#3b82f6' : '#e5e7eb'
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
              currentStep >= step.number 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <span className="text-xs font-medium">{step.number}</span>
          </motion.div>
          <span className={`ml-1 text-xs font-medium hidden xs:inline ${
            currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {step.label}
          </span>
          {step.number < 6 && (
            <div className={`h-0.5 w-3 sm:w-4 ml-1 ${
              currentStep > step.number ? 'bg-blue-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}