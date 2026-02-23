'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { FormData } from '@/types/guest-booking-types';

interface BookingFormContextType {
  formData: FormData;
  currentStep: number;
  errors: Record<string, string>;
  updateFormData: (data: Partial<FormData>) => void;
  setErrors: (errors: Record<string, string>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
}

const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined);

export const useBookingForm = () => {
  const context = useContext(BookingFormContext);
  if (!context) {
    throw new Error('useBookingForm must be used within BookingFormProvider');
  }
  return context;
};

interface BookingFormProviderProps {
  children: ReactNode;
}

export const BookingFormProvider: React.FC<BookingFormProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    passengerName: '',
    passengerPhone: '',
    pickup: null,
    dropoff: null,
    date: new Date().toISOString().split('T')[0],
    time: new Date(Date.now() + 30 * 60 * 1000).toTimeString().slice(0, 5),
    notes: '',
    distanceKm: 0,
    estimatedTime: 0,
    paymentType: 'private',
  });

  const updateFormData = useCallback((data: Partial<FormData>) => {
    console.log('[BookingFormContext] updateFormData called with:', data);
    setFormData(prev => {
      const newData = { ...prev, ...data };
      console.log('[BookingFormContext] New formData state:', newData);
      return newData;
    });
    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(data).forEach(key => {
        if (newErrors[key]) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, []);

  // Updated to 5 steps (Details, Location, Payment, Schedule, Review) - Service Selection removed
  const nextStep = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, 5)), []);
  const prevStep = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 1)), []);

  const resetForm = useCallback(() => {
    setFormData({
      passengerName: '',
      passengerPhone: '',
      pickup: null,
      dropoff: null,
      date: new Date().toISOString().split('T')[0],
      time: new Date(Date.now() + 30 * 60 * 1000).toTimeString().slice(0, 5),
      notes: '',
      distanceKm: 0,
      estimatedTime: 0,
      paymentType: 'private',
    });
    setCurrentStep(1);
    setErrors({});
  }, []);

  return (
    <BookingFormContext.Provider
      value={{
        formData,
        currentStep,
        errors,
        updateFormData,
        setErrors,
        setCurrentStep,
        nextStep,
        prevStep,
        resetForm
      }}
    >
      {children}
    </BookingFormContext.Provider>
  );
};