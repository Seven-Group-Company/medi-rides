'use client';

import { motion } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  User, 
  DollarSign,
  Phone,
  Mail,
  FileText,
  Navigation
} from 'lucide-react';
import { Ride } from '@/types/dashboard.types';
import { useState } from 'react';

interface RideDetailsModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
  ASSIGNED: { color: 'bg-purple-100 text-purple-800', label: 'Assigned' },
  IN_PROGRESS: { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
  COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
};

export default function RideDetailsModal({ 
  ride, 
  isOpen, 
  onClose,
  userRole 
}: RideDetailsModalProps) {
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  if (!isOpen) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const handleDownloadInvoice = async () => {
    if (!ride.invoice?.id) return;
    
    try {
      setDownloadingInvoice(true);
      const token = localStorage.getItem('access_token');
      
      if (ride.invoice.pdfUrl) {
        const fullUrl = ride.invoice.pdfUrl.startsWith('http')
          ? ride.invoice.pdfUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${ride.invoice.pdfUrl}`;
        window.open(fullUrl, '_blank');
        return;
      }
      
      // Generate invoice if not exists
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${ride.invoice.id}/regenerate-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data.pdfUrl) {
          const fullUrl = data.data.pdfUrl.startsWith('http')
            ? data.data.pdfUrl
            : `${process.env.NEXT_PUBLIC_API_URL}${data.data.pdfUrl}`;
          window.open(fullUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const { date, time } = formatDateTime(ride.scheduledAt);
  const status = statusConfig[ride.status as keyof typeof statusConfig] || statusConfig.PENDING;

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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ride Details</h2>
            <p className="text-gray-600">Ride ID: #{ride.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Service Type */}
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {ride.serviceType}
            </span>
          </div>

          {/* Route Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Navigation className="w-5 h-5 mr-2" />
              Route Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                  <p className="text-gray-600">{ride.pickup}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Drop-off Location</p>
                  <p className="text-gray-600">{ride.dropoff}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{time}</span>
                </div>
              </div>
            </div>

            {/* Price Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Price Details
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Price:</span>
                  <span className="font-medium">
                    ${(ride.estimatedPrice || 0).toFixed(2)}
                  </span>
                </div>
                {ride.finalPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Final Price:</span>
                    <span className="font-medium text-lg">
                      ${ride.finalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Driver Information */}
          {ride.driverName && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Driver Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Driver Name:</span>
                  <span className="font-medium">{ride.driverName}</span>
                </div>
                {ride.vehicle && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{ride.vehicle}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passenger Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Passenger Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{ride.passengerName}</span>
              </div>
              {userRole === 'ADMIN' && (
                <div className="text-sm text-gray-500">
                  Note: Full passenger details are available in the admin panel
                </div>
              )}
            </div>
          </div>

          {/* Invoice Section (for completed rides) */}
          {ride.status === 'COMPLETED' && ride.invoice && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Invoice
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{ride.invoice.invoiceNumber || `INV-${ride.invoice.id}`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Available
                  </span>
                </div>
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="w-full px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
            >
              Close
            </button>
            
            {userRole === 'ADMIN' && (
              <button
                onClick={() => {
                  // Navigate to admin ride management
                  window.location.href = `/dashboard/booking-management`;
                }}
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors duration-200"
              >
                Manage Ride
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}