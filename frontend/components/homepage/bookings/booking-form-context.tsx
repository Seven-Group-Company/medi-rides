'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
    serviceType: '',
    serviceCategoryId: 0,
    date: new Date().toISOString().split('T')[0],
    time: new Date(Date.now() + 30 * 60 * 1000).toTimeString().slice(0, 5),
    notes: '',
    distanceMiles: 0,
    estimatedTime: 0,
    estimatedPrice: 0,
    paymentType: 'private',
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const newErrors = { ...errors };
    Object.keys(data).forEach(key => {
      if (newErrors[key]) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  // FIXED: Changed from 5 to 6 to accommodate all 6 steps (Details, Location, Service, Payment, Schedule, Review)
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const resetForm = () => {
    setFormData({
      passengerName: '',
      passengerPhone: '',
      pickup: null,
      dropoff: null,
      serviceType: '',
      serviceCategoryId: 0,
      date: new Date().toISOString().split('T')[0],
      time: new Date(Date.now() + 30 * 60 * 1000).toTimeString().slice(0, 5),
      notes: '',
      distanceMiles: 0,
      estimatedTime: 0,
      paymentType: 'private',
      estimatedPrice: 0
    });
    setCurrentStep(1);
    setErrors({});
  };

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