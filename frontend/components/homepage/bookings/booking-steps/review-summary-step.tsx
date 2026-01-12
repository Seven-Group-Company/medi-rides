'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  DollarSign,
  ChevronLeft,
  Loader,
  CreditCard
} from 'lucide-react';
import { BookingStepProps } from '@/types/guest-booking-types';

export default function ReviewSummaryStep({
  formData,
  onPrev,
  onSubmit,
  isSubmitting,
}: Omit<BookingStepProps, 'categories' | 'updateFormData' | 'errors'>) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Booking</h2>
        <p className="text-gray-600 text-sm">Please review your details before confirming</p>
      </div>

      <div className="space-y-4">
        {/* Summary Card */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          {/* Passenger Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Passenger Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{formData.passengerName}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{formData.passengerPhone}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Trip Details
            </h3>
            <div className="bg-white p-3 rounded-lg space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Pickup</p>
                  <p className="font-medium">{formData.pickup?.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Drop-off</p>
                  <p className="font-medium">{formData.dropoff?.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Car className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600">Service</p>
              </div>
              <p className="font-medium">{formData.serviceType}</p>
            </div>

                    <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Payment Type</p>
              <p className="font-medium capitalize">{formData.paymentType === 'waiver' ? 'Waiver/Voucher' : formData.paymentType}</p>
            </div>
          </div>
        </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600">Date</p>
              </div>
              <p className="font-medium">{formatDate(formData.date)}</p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600">Time</p>
              </div>
              <p className="font-medium">{formatTime(formData.time)}</p>
            </div>
          </div>

          {/* Trip Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Distance</p>
              <p className="font-medium text-lg">{formData.distanceMiles} miles</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Est. Time</p>
              <p className="font-medium text-lg">~{formData.estimatedTime} min</p>
            </div>
          </div>

          {/* Notes */}
          {formData.notes && (
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Special Notes</p>
              <p className="text-gray-900">{formData.notes}</p>
            </div>
          )}
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
            Edit Details
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Booking
              </>
            )}
          </motion.button>
        </div>

        {/* Disclaimer */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By confirming, you agree to our Terms of Service. Your driver will contact you 10-15 minutes before arrival.
          </p>
        </div>
      </div>
    </motion.div>
  );
}