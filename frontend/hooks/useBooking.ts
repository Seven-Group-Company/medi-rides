import { useState, useCallback } from 'react';
import { BookingFormData, CreateRideDto } from '@/types/booking.types';
import { RidesService } from '@/services/rides.service';

export interface ServiceCategory {
  id: number;
  name: string;
  value: string;
  description: string;
  icon: string;
  basePrice: number;
  pricePerMile: number;
  isActive: boolean;
}

export const useBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    pickup: null,
    dropoff: null,
    date: '',
    time: '',
    notes: '',
    chargeOption: 'private',
    distanceKm: 0, // Keep as km for backend compatibility
    estimatedTime: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const mapServiceTypeToEnum = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('medical') || name.includes('appointment') || name.includes('hospital') || 
        name.includes('dialysis') || name.includes('rehabilitation') || name.includes('therapy')) {
      return 'Medical Appointment';
    } else if (name.includes('wheelchair')) {
      return 'Wheelchair Transport';
    } else if (name.includes('airport') || name.includes('shuttle')) {
      return 'Airport Shuttle';
    } else if (name.includes('long distance') || name.includes('valley')) {
      return 'Long Distance';
    }
    return 'General Transportation';
  };


  const updateFormData = useCallback((data: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Clear errors when data is updated
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(data).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Location step
        if (!formData.pickup) newErrors.pickup = 'Pickup location is required';
        if (!formData.dropoff) newErrors.dropoff = 'Drop-off location is required';
        break;
      
      case 2: // Date/time step
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        
        if (formData.date && formData.time) {
          const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
          if (selectedDateTime <= new Date()) {
            newErrors.date = 'Date and time must be in the future';
          }
        }
        break;

      case 3: // Review step - validate payment
        if (!formData.chargeOption) newErrors.chargeOption = 'Please select a payment method';
        // Service type validation removed as step is gone, but we might want to default it
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const submitBooking = useCallback(async (): Promise<any> => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const bookingData: CreateRideDto = {
        pickup: formData.pickup!.address,
        dropoff: formData.dropoff!.address,
        date: formData.date,
        time: formData.time,
        notes: `${formData.notes || ''}`.trim(),
        distanceKm: formData.distanceKm || 0,
        paymentType: formData.chargeOption as "private" | "waiver" | undefined,
        estimatedTime: formData.estimatedTime,
      };

      const result = await RidesService.createRide(bookingData);
      setBookingResult(result.data);
      return result.data;
    } catch (error: any) {
      setErrors({ submit: error.message });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateStep]);

  const resetBooking = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      pickup: null,
      dropoff: null,
      date: '',
      time: '',
      notes: '',
      chargeOption: 'private',
      distanceKm: 0,
      estimatedTime: 0,
    });
    setErrors({});
    setBookingResult(null);
  }, []);

  return {
    currentStep,
    formData,
    updateFormData,
    errors,
    isSubmitting,
    bookingResult,
    nextStep,
    prevStep,
    submitBooking,
    resetBooking,
    validateStep,
  };
};