'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Car, CheckCircle2, MapPin } from 'lucide-react';
import { useBooking } from '@/hooks/useBooking';
import ProgressIndicator from '@/components/dashboard/customer/booking/progress-indicator';
import LocationStep from '@/components/dashboard/customer/booking/steps/location-step';
import ServiceTypeStep from '@/components/dashboard/customer/booking/steps/service-type-step';
import DateTimeStep from '@/components/dashboard/customer/booking/steps/datetime-step';
import ReviewStep from '@/components/dashboard/customer/booking/steps/review-step';
import SuccessModal from '@/components/dashboard/customer/booking/success-modal';

const steps = [
  { id: 1, title: 'Location', icon: MapPin },
  { id: 2, title: 'Service', icon: Car },
  { id: 3, title: 'Schedule', icon: Calendar },
  { id: 4, title: 'Review', icon: CheckCircle2 },
];

export default function BookRidePage() {
  const {
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
    serviceCategories,
    isLoadingCategories,
  } = useBooking();

  const handleSubmit = async () => {
    try {
      await submitBooking();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleSuccessModalClose = () => {
    resetBooking();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LocationStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
case 2:
  return (
    <ServiceTypeStep
      formData={formData}
      updateFormData={updateFormData}
      errors={errors}
      onNext={nextStep}
      onBack={prevStep}
      serviceCategories={serviceCategories}
      isLoadingCategories={isLoadingCategories}
    />
  );
      case 3:
        return (
          <DateTimeStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <ReviewStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onBack={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serviceCategories={serviceCategories}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Car className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Compassionate Medi Rides</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book your compassionate transportation service with care and comfort
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} steps={steps} />

        {/* Booking Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {bookingResult && (
          <SuccessModal
            bookingSummary={{
              id: bookingResult.id,
              pickup: formData.pickup!.address,
              dropoff: formData.dropoff!.address,
              serviceType: formData.serviceType,
              date: formData.date,
              time: formData.time,
              distanceKm: formData.distanceKm,
              estimatedTime: formData.estimatedTime,
              status: bookingResult.status,
            }}
            onClose={handleSuccessModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}