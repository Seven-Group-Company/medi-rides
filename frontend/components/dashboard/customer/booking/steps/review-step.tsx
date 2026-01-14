'use client';

import { motion } from 'framer-motion';
import { MapPin, Car, Calendar, Clock, Navigation, Wallet, FileText, AlertCircle } from 'lucide-react';
import { BookingStepProps } from '@/types/booking.types';
import { useMemo } from 'react';

export default function ReviewStep({
  formData,
  updateFormData,
  errors,
  onBack,
  isSubmitting,
  onSubmit,
  serviceCategories = []
}: BookingStepProps & { onSubmit: () => void; serviceCategories?: any[] }) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getChargeOptionName = (optionId: string) => {
    const options: Record<string, string> = {
      'private': 'Private Pay',
      'ALI': 'ALI Waiver',
      'APDD': 'APDD Waiver',
      'IDD': 'IDD Waiver',
      'ISW': 'ISW Waiver',
    };
    return options[optionId] || 'Private Pay';
  };

  const serviceCategoryName = useMemo(() => {
    const category = serviceCategories.find(cat => cat.id === formData.serviceCategoryId);
    return category?.name || formData.serviceName;
  }, [formData.serviceCategoryId, formData.serviceName, serviceCategories]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Review Your Booking</h2>
        <p className="text-gray-600 mb-6">Please review all details before confirming your booking</p>
      </div>

      {/* Booking Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Details Card */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            Trip Details
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                <p className="text-sm text-gray-600">{formData.pickup?.address}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Drop-off Location</p>
                <p className="text-sm text-gray-600">{formData.dropoff?.address}</p>
              </div>
            </div>

            {formData.distanceKm && formData.estimatedTime && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Navigation className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">{Math.round(formData.distanceKm * 0.621371 * 10) / 10} miles</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">~{formData.estimatedTime} min</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service & Schedule Card */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Service & Schedule
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Car className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Service Type</p>
                <p className="text-sm text-gray-600">{serviceCategoryName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {formatDate(formData.date)} at {formData.time}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Wallet className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Method</p>
                <p className="text-sm text-gray-600">{formData.chargeOption === 'ALI' ? 'Waiver/Voucher' : 'Private'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Additional Notes (Optional)
        </label>
        <textarea
          rows={4}
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          placeholder="Any special requirements, medical equipment, mobility aids, oxygen tanks, or notes for the driver..."
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Important Notice</p>
            <p className="text-sm text-yellow-700 mt-1">
              Please ensure all information is correct. Our team will contact you within 24 hours to confirm your booking details.
            </p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 text-center"
        >
          {errors.submit}
        </motion.p>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-200">
        <motion.button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3.5 px-6 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium disabled:bg-gray-300 transition-colors duration-200 sm:flex-1"
        >
          Back
        </motion.button>

        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-3.5 px-6 bg-green-600 text-white hover:bg-green-700 rounded-xl font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 sm:flex-1 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Confirm Booking
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}