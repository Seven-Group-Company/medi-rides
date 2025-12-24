'use client';

import { motion } from 'framer-motion';
import { MapPin, Car, Calendar, Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  steps: Array<{ id: number; title: string; icon: any }>;
}

export default function ProgressIndicator({ currentStep, steps }: ProgressIndicatorProps) {
  return (
    <div className="px-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isFuture = step.id > currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step */}
              <div className="relative flex flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center relative z-10 border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-100'
                      : isFuture
                      ? 'bg-gray-100 border-gray-300 text-gray-400'
                      : ''
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </motion.div>

                {/* Step Title */}
                <span className={`mt-3 text-xs md:text-sm font-medium transition-colors ${
                  isCompleted ? 'text-green-600' :
                  isCurrent ? 'text-blue-600' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </span>

                {/* Active Line Indicator */}
                {isCurrent && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="absolute top-5 h-0.5 bg-blue-600 -z-10"
                    style={{ width: '100%' }}
                  />
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-12 md:w-24 h-0.5 mx-2 transition-colors duration-300 ${
                  step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}