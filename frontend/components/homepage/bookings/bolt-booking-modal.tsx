'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { BookingFormProvider, useBookingForm } from './booking-form-context';
import StepIndicator from './step-indicator';
import PersonalDetailsStep from './booking-steps/personal-details-step';
import LocationStep from './booking-steps/location-step';
import ServiceSelectionStep from './booking-steps/service-selection-step';
import ScheduleStep from './booking-steps/schedule-step';
import ReviewSummaryStep from './booking-steps/review-summary-step';
import SuccessModal from '@/components/dashboard/customer/booking/success-modal';
import { GuestBookingService, ServiceCategory } from '@/services/guest-booking.service';
import PaymentTypeStep from './booking-steps/payment-type-step';

interface BoltBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (bookingData: any) => void;
}

function BoltBookingModalContent({ isOpen, onClose, onBookingSuccess }: BoltBookingModalProps) {
  const { currentStep, formData, nextStep, prevStep, resetForm, setErrors, updateFormData } = useBookingForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<any>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load service categories
  useEffect(() => {
    const loadCategories = async () => {
      if (isOpen) {
        setIsLoadingCategories(true);
        try {
          const categories = await GuestBookingService.getServiceCategories();
          const activeCategories = categories.filter(cat => cat.isActive);
          setServiceCategories(activeCategories);
        } catch (error) {
          console.error('Failed to load services:', error);
          setServiceCategories([]);
          setErrors({ 
            service: 'Failed to load services' 
          });
        } finally {
          setIsLoadingCategories(false);
        }
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const calculatePrice = useCallback(async () => {
    if (formData.serviceCategoryId && formData.distanceMiles && formData.distanceMiles > 0 && formData.date && formData.time) {
      try {
        const price = await GuestBookingService.calculateEstimatedPrice(
          formData.serviceCategoryId,
          formData.distanceMiles,
          formData.date,
          formData.time
        );
        updateFormData({ estimatedPrice: price });
      } catch (error) {
        console.error('Price calc failed:', error);
        updateFormData({ estimatedPrice: 0 });
      }
    }
  }, [formData.serviceCategoryId, formData.distanceMiles, formData.date, formData.time, updateFormData]);

  useEffect(() => {
    if (formData.serviceCategoryId && formData.distanceMiles && formData.distanceMiles > 0) {
      calculatePrice();
    }
  }, [calculatePrice]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.passengerName.trim()) errors.passengerName = 'Name required';
        if (!formData.passengerPhone.trim()) errors.passengerPhone = 'Phone required';
        else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.passengerPhone.replace(/\D/g, ''))) {
          errors.passengerPhone = 'Invalid phone';
        }
        break;
      case 2:
        if (!formData.pickup) errors.pickup = 'Pickup required';
        if (!formData.dropoff) errors.dropoff = 'Drop-off required';
        break;
      case 3:
        if (!formData.serviceCategoryId) errors.service = 'Select service';
        break;
      case 4:
        if (!formData.paymentType) errors.paymentType = 'Select payment type';
        break;
      case 5:
        if (!formData.date) errors.date = 'Date required';
        if (!formData.time) errors.time = 'Time required';
        break;
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) nextStep();
  };

  const handleSubmit = async () => {
    if (!formData.passengerName || !formData.passengerPhone || 
        !formData.pickup || !formData.dropoff || 
        !formData.serviceCategoryId || !formData.paymentType || 
        !formData.date || !formData.time) {
      setErrors({ form: 'Complete all fields' });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const bookingData = {
        passengerName: formData.passengerName,
        passengerPhone: formData.passengerPhone,
        pickup: formData.pickup!.address,
        dropoff: formData.dropoff!.address,
        serviceType: formData.serviceType,
        serviceCategoryId: formData.serviceCategoryId,
        date: formData.date,
        time: formData.time,
        notes: `${formData.notes || ''}`.trim() || undefined,
        distanceKm: formData.distanceMiles ? formData.distanceMiles * 1.60934 : 0,
        paymentType: formData.paymentType,
        estimatedTime: formData.estimatedTime || 0,
        estimatedPrice: formData.estimatedPrice || 0
      };

      const response = await GuestBookingService.createGuestRide(bookingData);
      
      setBookingSummary({
        id: response.id.toString(),
        bookingId: `B-${response.id.toString().padStart(6, '0')}`,
        pickup: formData.pickup!.address,
        dropoff: formData.dropoff!.address,
        serviceType: formData.serviceType,
        date: formData.date,
        time: formData.time,
        passengerName: formData.passengerName,
        passengerPhone: formData.passengerPhone,
        distanceMiles: formData.distanceMiles,
        estimatedTime: formData.estimatedTime,
        estimatedPrice: formData.estimatedPrice,
        paymentType: formData.paymentType,
        status: response.status,
        scheduledAt: response.scheduledAt
      });

      setShowSuccess(true);
      if (onBookingSuccess) onBookingSuccess(response);
      
    } catch (error: any) {
      console.error('Booking failed:', error);
      setErrors({ form: error.message || 'Booking failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      errors: {},
      categories: serviceCategories,
      isLoading: isLoadingCategories,
      setEstimatedPrice: (price: number | null) => updateFormData({ estimatedPrice: price || 0 })
    };

    switch (currentStep) {
      case 1: return <PersonalDetailsStep {...commonProps} onNext={handleNextStep} />;
      case 2: return <LocationStep {...commonProps} onNext={handleNextStep} onPrev={prevStep} />;
      case 3: return <ServiceSelectionStep {...commonProps} onNext={handleNextStep} onPrev={prevStep} />;
      case 4: return <PaymentTypeStep {...commonProps} onNext={handleNextStep} onPrev={prevStep} />;
      case 5: return <ScheduleStep {...commonProps} onNext={handleNextStep} onPrev={prevStep} />;
      case 6: return <ReviewSummaryStep 
        {...commonProps}
        onPrev={prevStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />;
      default: return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              <div className="px-4 pt-2 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="text-center flex-1 px-2">
                    <h2 className="text-base font-semibold text-gray-900">Book Ride</h2>
                    <div className="mt-1">
                      <StepIndicator currentStep={currentStep} />
                    </div>
                  </div>
                  <div className="w-10"></div>
                </div>
              </div>

              <div className="px-4 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                {renderStep()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showSuccess && bookingSummary && (
        <SuccessModal
          bookingSummary={bookingSummary}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}

export default function BoltBookingModal(props: BoltBookingModalProps) {
  return (
    <BookingFormProvider>
      <BoltBookingModalContent {...props} />
    </BookingFormProvider>
  );
}