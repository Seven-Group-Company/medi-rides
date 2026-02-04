'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Calendar, Clock, Car, X } from 'lucide-react';

interface BookingSummary {
  id: string;
  pickup: string;
  dropoff: string;
  serviceType?: string;
  date: string;
  time: string;
  distanceKm?: number;
  estimatedTime?: number;
  status?: string;
}

interface SuccessModalProps {
  bookingSummary: BookingSummary;
  onClose: () => void;
}

export default function SuccessModal({ bookingSummary, onClose }: SuccessModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Icon */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ride Request Submitted!
          </h2>
          <p className="text-gray-600">
            Your ride request has been submitted and is pending approval.
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
          
          <div className="space-y-3">
            {/* Pickup */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pickup</p>
                <p className="text-sm text-gray-600">{bookingSummary.pickup}</p>
              </div>
            </div>

            {/* Drop-off */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Drop-off</p>
                <p className="text-sm text-gray-600">{bookingSummary.dropoff}</p>
              </div>
            </div>

            {/* Service Type - only show if provided */}
            {bookingSummary.serviceType && (
              <div className="flex items-start space-x-3">
                <Car className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Service</p>
                  <p className="text-sm text-gray-600">{bookingSummary.serviceType}</p>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {formatDate(bookingSummary.date)} at {bookingSummary.time}
                </p>
              </div>
            </div>

            {/* Distance & Time */}
            {(bookingSummary.distanceKm || bookingSummary.estimatedTime) && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Trip Details</p>
                  <p className="text-sm text-gray-600">
                    {bookingSummary.distanceKm && `${bookingSummary.distanceKm} km`}
                    {bookingSummary.distanceKm && bookingSummary.estimatedTime && ' • '}
                    {bookingSummary.estimatedTime && `~${bookingSummary.estimatedTime} min`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation ID */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Confirmation ID: <span className="font-mono font-medium">{bookingSummary.id}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Book Another Ride
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Print Summary
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}