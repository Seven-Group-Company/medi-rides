import { useState, useCallback, useEffect } from 'react';
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
  serviceType: string;
  isActive: boolean;
}

export const useBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    pickup: null,
    dropoff: null,
    serviceType: '',
    serviceCategoryId: 0,
    serviceName: '',
    serviceIcon: '',
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
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

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

  // Use hardcoded categories instead of fetching
  useEffect(() => {
    const hardcodedCategories = [
      {
        id: 1,
        name: 'Non-Emergency Medical Transportation',
        value: 'medical-transport',
        description: 'Transport to medical facilities and appointments',
        icon: 'Stethoscope',
        basePrice: 25,
        pricePerMile: 2.5,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 2,
        name: 'Doctor\'s Appointments',
        value: 'doctor-appointment',
        description: 'Transportation for routine doctor visits',
        icon: 'Stethoscope',
        basePrice: 25,
        pricePerMile: 2.5,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 3,
        name: 'Non-Emergency Hospital Visits',
        value: 'hospital-visit',
        description: 'Transport for hospital outpatient visits',
        icon: 'Building',
        basePrice: 30,
        pricePerMile: 2.8,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 4,
        name: 'Hospital Discharge',
        value: 'hospital-discharge',
        description: 'Transport home after hospital stay',
        icon: 'Home',
        basePrice: 35,
        pricePerMile: 3.0,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 5,
        name: 'Dialysis',
        value: 'dialysis',
        description: 'Regular transport for dialysis treatment',
        icon: 'Heart',
        basePrice: 30,
        pricePerMile: 2.5,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 6,
        name: 'Physical Therapy Rehabilitation',
        value: 'physical-therapy',
        description: 'Transport to physical therapy sessions',
        icon: 'Stethoscope',
        basePrice: 25,
        pricePerMile: 2.5,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 7,
        name: 'Stroke Rehabilitation',
        value: 'stroke-rehab',
        description: 'Transport for stroke recovery therapy',
        icon: 'Heart',
        basePrice: 30,
        pricePerMile: 2.8,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 8,
        name: 'Pulmonary & Cardiac Rehabilitation',
        value: 'cardiac-rehab',
        description: 'Transport for heart and lung rehabilitation',
        icon: 'Heart',
        basePrice: 30,
        pricePerMile: 2.8,
        serviceType: 'MEDICAL',
        isActive: true,
      },
      {
        id: 9,
        name: 'General Transportation & Personal Travel',
        value: 'general-transport',
        description: 'Personal transportation within the valley',
        icon: 'Car',
        basePrice: 20,
        pricePerMile: 2.0,
        serviceType: 'GENERAL',
        isActive: true,
      },
      {
        id: 10,
        name: 'Airports',
        value: 'airport',
        description: 'Transport to/from Phoenix Sky Harbor and other airports',
        icon: 'Plane',
        basePrice: 35,
        pricePerMile: 3.0,
        serviceType: 'GENERAL',
        isActive: true,
      },
      {
        id: 11,
        name: 'Long Distance Trips',
        value: 'long-distance',
        description: 'Extended trips outside the valley',
        icon: 'Car',
        basePrice: 50,
        pricePerMile: 2.0,
        serviceType: 'GENERAL',
        isActive: true,
      },
      {
        id: 12,
        name: 'Train or Bus Stations',
        value: 'station',
        description: 'Transport to/from transportation hubs',
        icon: 'Building',
        basePrice: 25,
        pricePerMile: 2.5,
        serviceType: 'GENERAL',
        isActive: true,
      },
      {
        id: 13,
        name: 'Sporting Events',
        value: 'sports',
        description: 'Transport to games and sporting events',
        icon: 'Ticket',
        basePrice: 30,
        pricePerMile: 2.8,
        serviceType: 'GENERAL',
        isActive: true,
      },
      {
        id: 14,
        name: 'Special & Family Events',
        value: 'events',
        description: 'Transport for weddings, parties, and gatherings',
        icon: 'Ticket',
        basePrice: 30,
        pricePerMile: 2.8,
        serviceType: 'GENERAL',
        isActive: true,
      },
      {
        id: 15,
        name: 'Library or Museum Trips',
        value: 'cultural',
        description: 'Transport for educational and cultural visits',
        icon: 'Library',
        basePrice: 25,
        pricePerMile: 2.5,
        serviceType: 'GENERAL',
        isActive: true,
      },
      {
        id: 16,
        name: 'Wheelchair Transportation',
        value: 'wheelchair',
        description: 'Specialized transport for wheelchair users',
        icon: 'Shield',
        basePrice: 40,
        pricePerMile: 3.5,
        serviceType: 'WHEELCHAIR',
        isActive: true,
      },
    ];
    setServiceCategories(hardcodedCategories);
    setIsLoadingCategories(false);
  }, []);

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
      
      case 2: // Service type step
        if (!formData.serviceCategoryId) newErrors.serviceType = 'Please select a service type';
        if (!formData.chargeOption) newErrors.chargeOption = 'Please select a payment method';
        break;
      
      case 3: // Date/time step
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        
        if (formData.date && formData.time) {
          const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
          if (selectedDateTime <= new Date()) {
            newErrors.date = 'Date and time must be in the future';
          }
        }
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
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const bookingData: CreateRideDto = {
        pickup: formData.pickup!.address,
        dropoff: formData.dropoff!.address,
        serviceType: mapServiceTypeToEnum(formData.serviceName),
        serviceCategoryId: formData.serviceCategoryId!,
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
      serviceType: '',
      serviceCategoryId: 0,
      serviceName: '',
      serviceIcon: '',
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
    serviceCategories,
    isLoadingCategories,
    nextStep,
    prevStep,
    submitBooking,
    resetBooking,
    validateStep,
  };
};