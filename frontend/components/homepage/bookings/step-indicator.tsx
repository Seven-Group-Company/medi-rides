'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Location' },
    { number: 3, label: 'Service' },
    { number: 4, label: 'Schedule' },
    { number: 5, label: 'Review' } // Added review step
  ];

  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step) => (
        <div key={step.number} className="flex items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: currentStep >= step.number ? 1.1 : 1,
              backgroundColor: currentStep >= step.number ? '#3b82f6' : '#e5e7eb'
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep >= step.number 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <span className="text-sm font-semibold">{step.number}</span>
          </motion.div>
          <span className={`ml-2 text-sm font-medium hidden sm:inline ${
            currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {step.label}
          </span>
          {step.number < 5 && (
            <div className={`h-0.5 w-6 ml-2 ${
              currentStep > step.number ? 'bg-blue-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}