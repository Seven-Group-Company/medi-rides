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
      weekday: 'short',
      month: 'short',
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
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Review</h2>
        <p className="text-xs text-gray-600">Check details before booking</p>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <User className="w-3 h-3 mr-1" />
              Passenger
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded">
                <p className="text-xs text-gray-600">Name</p>
                <p className="font-medium text-sm">{formData.passengerName}</p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="text-xs text-gray-600">Phone</p>
                <p className="font-medium text-sm">{formData.passengerPhone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <MapPin className="w-3 h-3 mr-1" />
              Trip
            </div>
            <div className="bg-white p-2 rounded space-y-1">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">From</p>
                  <p className="font-medium text-sm truncate">{formData.pickup?.address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">To</p>
                  <p className="font-medium text-sm truncate">{formData.dropoff?.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded">
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <Car className="w-3 h-3 mr-1" />
                Service
              </div>
              <p className="font-medium text-sm truncate">{formData.serviceType}</p>
            </div>

            <div className="bg-white p-2 rounded">
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <Calendar className="w-3 h-3 mr-1" />
                Date
              </div>
              <p className="font-medium text-sm">{formatDate(formData.date)}</p>
            </div>

            <div className="bg-white p-2 rounded">
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <Clock className="w-3 h-3 mr-1" />
                Time
              </div>
              <p className="font-medium text-sm">{formatTime(formData.time)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2 rounded">
              <p className="text-xs text-gray-600">Distance</p>
              <p className="font-medium text-sm">{formData.distanceMiles} mi</p>
            </div>
            <div className="bg-white p-2 rounded">
              <p className="text-xs text-gray-600">Est. Time</p>
              <p className="font-medium text-sm">~{formData.estimatedTime} min</p>
            </div>
          </div>

          <div className="bg-white p-2 rounded">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <CreditCard className="w-3 h-3 mr-1" />
              Payment
            </div>
            <p className="font-medium text-sm capitalize">
              {formData.paymentType === 'waiver' ? 'Waiver/Voucher' : formData.paymentType}
            </p>
          </div>

          {formData.notes && (
            <div className="bg-white p-2 rounded">
              <p className="text-xs text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-900">{formData.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Edit
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm shadow hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-1" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirm
              </>
            )}
          </motion.button>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By confirming, you agree to Terms. Driver will contact 10-15 min before arrival.
          </p>
        </div>
      </div>
    </motion.div>
  );
}