'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Car, Check, MapPin, ChevronRight, Shield, AlertCircle } from 'lucide-react';
import { useBooking } from '@/hooks/useBooking';
import ProgressIndicator from '@/components/dashboard/customer/booking/progress-indicator';
import LocationStep from '@/components/dashboard/customer/booking/steps/location-step';
import ServiceTypeStep from '@/components/dashboard/customer/booking/steps/service-type-step';
import DateTimeStep from '@/components/dashboard/customer/booking/steps/datetime-step';
import ReviewStep from '@/components/dashboard/customer/booking/steps/review-step';
import SuccessModal from '@/components/dashboard/customer/booking/success-modal';
import { useState } from 'react';

const steps = [
  { id: 1, title: 'Location', icon: MapPin },
  { id: 2, title: 'Service', icon: Car },
  { id: 3, title: 'Schedule', icon: Calendar },
  { id: 4, title: 'Confirm', icon: Check },
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

  const [bookedDates, setBookedDates] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      await submitBooking();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleSuccessModalClose = () => {
    resetBooking();
    // Refresh booked dates after successful booking
    const fetchBookedDates = async () => {
      try {
        const response = await fetch(`/api/rides/my-booked-dates`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setBookedDates(data.data || []);
        }
      } catch (error) {
        console.error('Failed to refresh booked dates:', error);
      }
    };
    fetchBookedDates();
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
            bookedDates={bookedDates}
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Book a Ride</h1>
                <p className="text-gray-600 mt-1">Secure, reliable transportation when you need it</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>100% Secure Booking</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="mb-10">
          <ProgressIndicator currentStep={currentStep} steps={steps} />
        </div>

        {/* Booked Dates Warning */}
        {bookedDates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4"
          >
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">
                  You have {bookedDates.length} booked date{bookedDates.length > 1 ? 's' : ''}
                </h4>
                <p className="text-sm text-amber-700">
                  Please select a different date if you see a date marked as "Booked" in the calendar.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Card */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Booking Summary & Info */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                Booking Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Coverage Area</p>
                    <p className="text-sm text-gray-600">Maricopa County & Surrounding Areas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Safety First</p>
                    <p className="text-sm text-gray-600">Certified drivers & sanitized vehicles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <span className="text-sm font-medium text-gray-900">View FAQ</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Contact Support</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Pricing Guide</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
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