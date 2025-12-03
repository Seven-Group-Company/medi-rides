'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { GuestBookingService } from '@/services/guest-booking.service';
import { useState, useEffect } from 'react';
import { BookingStepProps } from '@/types/guest-booking-types';

export default function ScheduleStep({
  formData,
  updateFormData,
  onPrev,
  onSubmit,
  isSubmitting,
  errors,
  categories,
  isLoading,
}: BookingStepProps) {
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // Calculate price when form data changes
  useEffect(() => {
    const calculatePrice = async () => {
      if (!formData.serviceCategoryId || !formData.distanceKm || formData.distanceKm === 0 || !formData.date || !formData.time) {
        return;
      }

      setIsCalculatingPrice(true);
      try {
        const price = await GuestBookingService.calculateEstimatedPrice(
          formData.serviceCategoryId,
          formData.distanceKm,
          formData.date,
          formData.time
        );
        updateFormData({ estimatedPrice: price });
      } catch (error) {
        console.error('Failed to calculate price:', error);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    const timer = setTimeout(() => {
      calculatePrice();
    }, 500); // Debounce to avoid too many calculations

    return () => clearTimeout(timer);
  }, [formData.serviceCategoryId, formData.distanceKm, formData.date, formData.time, updateFormData]);

  const handleDateChange = (value: string) => {
    updateFormData({ date: value });
  };

  const handleTimeChange = (value: string) => {
    updateFormData({ time: value });
  };

  const handleNotesChange = (value: string) => {
    updateFormData({ notes: value });
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Find selected service
  const selectedService = categories.find(cat => cat.id === formData.serviceCategoryId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Ride</h2>
        <p className="text-gray-600 text-sm">When do you need the ride?</p>
      </div>

      <div className="space-y-4">
        {/* Error Message */}
        {errors.date && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4"
          >
            <p className="text-red-700 text-sm text-center">{errors.date}</p>
          </motion.div>
        )}

        {errors.time && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4"
          >
            <p className="text-red-700 text-sm text-center">{errors.time}</p>
          </motion.div>
        )}

        {/* Date and Time Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={today}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Time *
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Selected Service Info */}
        {selectedService && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{selectedService.name}</div>
                <div className="text-xs text-blue-600 mt-1">
                  Base: ${selectedService.basePrice} • Rate: ${selectedService.pricePerMile}/mile
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Display */}
        {formData.distanceKm && formData.distanceKm > 0 && formData.estimatedPrice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Estimated Price</div>
                  <div className="text-xs text-green-600">
                    {isCalculatingPrice ? 'Calculating...' : 'Including all charges'}
                  </div>
                </div>
              </div>
              {isCalculatingPrice ? (
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
              ) : (
                <div className="text-2xl font-bold text-green-700">${formData.estimatedPrice.toFixed(2)}</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Any special requirements, medical equipment, or notes for the driver..."
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 resize-none placeholder-gray-400"
          />
          <p className="text-xs text-gray-500">
            Let us know if you have any special requirements or instructions for the driver.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={isSubmitting || !formData.date || !formData.time}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                Review Booking
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}