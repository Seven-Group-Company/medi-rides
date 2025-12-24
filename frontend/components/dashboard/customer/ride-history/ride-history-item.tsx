'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Car, User, CreditCard, Navigation, FileText, DollarSign } from 'lucide-react';
import { RideHistory } from '@/types/ride-history.types';
import { useState } from 'react';

interface RideHistoryItemProps {
  ride: RideHistory;
  onViewDetails: (ride: RideHistory) => void;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  ASSIGNED: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
  CONFIRMED: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
  DRIVER_EN_ROUTE: { color: 'bg-purple-100 text-purple-800', label: 'Driver En Route' },
  PICKUP_ARRIVED: { color: 'bg-indigo-100 text-indigo-800', label: 'Arrived for Pickup' },
  IN_PROGRESS: { color: 'bg-orange-100 text-orange-800', label: 'In Progress' },
  COMPLETED: { color: 'bg-emerald-100 text-emerald-800', label: 'Completed' },
  CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  NO_SHOW: { color: 'bg-gray-100 text-gray-800', label: 'No Show' },
};

const serviceTypeConfig = {
  MEDICAL: { color: 'bg-red-50 text-red-700', icon: '🏥' },
  GENERAL: { color: 'bg-blue-50 text-blue-700', icon: '🚗' },
};

export default function RideHistoryItem({ ride, onViewDetails }: RideHistoryItemProps) {
  const [downloading, setDownloading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadInvoice = async () => {
    if (!ride.invoice?.id) {
      // Try to generate invoice first
      await generateAndDownloadInvoice();
      return;
    }

    try {
      setDownloading(true);
      const token = localStorage.getItem('access_token');
      
      // First, get the invoice details
      const invoiceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${ride.invoice.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!invoiceResponse.ok) {
        throw new Error('Failed to fetch invoice details');
      }

      const invoiceData = await invoiceResponse.json();
      const pdfUrl = invoiceData.data?.pdfUrl;

      if (pdfUrl) {
        // If PDF exists, open it
        const fullUrl = pdfUrl.startsWith('http')
          ? pdfUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`;
        window.open(fullUrl, '_blank');
      } else {
        // If no PDF, try to regenerate it
        await regenerateAndDownloadInvoice(ride.invoice.id);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again or contact support.');
    } finally {
      setDownloading(false);
    }
  };

  const generateAndDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/ride/${ride.id}/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate invoice');
      }

      const data = await response.json();
      
      if (data.data.pdfUrl) {
        const fullUrl = data.data.pdfUrl.startsWith('http')
          ? data.data.pdfUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${data.data.pdfUrl}`;
        window.open(fullUrl, '_blank');
      } else {
        // If generation succeeded but no PDF URL, try to download
        window.open(
          `${process.env.NEXT_PUBLIC_API_URL}/invoices/${data.data.id}/download`,
          '_blank'
        );
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate invoice: ${message}`);
    } finally {
      setDownloading(false);
    }
  };

  const regenerateAndDownloadInvoice = async (invoiceId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/regenerate-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to regenerate PDF');
      }

      const data = await response.json();
      
      if (data.data.pdfUrl) {
        const fullUrl = data.data.pdfUrl.startsWith('http')
          ? data.data.pdfUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${data.data.pdfUrl}`;
        window.open(fullUrl, '_blank');
      } else {
        window.open(
          `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/download`,
          '_blank'
        );
      }
    } catch (error) {
      console.error('Error regenerating invoice:', error);
      throw error;
    }
  };

  const status = statusConfig[ride.status] || statusConfig.PENDING;
  const serviceType = serviceTypeConfig[ride.serviceType as keyof typeof serviceTypeConfig] || serviceTypeConfig.GENERAL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${serviceType.color} flex items-center`}>
            <span className="mr-1">{serviceType.icon}</span>
            {ride.serviceType === 'MEDICAL' ? 'Medical' : 'General'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Ride ID</p>
          <p className="font-mono font-medium text-gray-900">#{ride.id.toString().padStart(6, '0')}</p>
        </div>
      </div>

      {/* Route Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Pickup</p>
            <p className="text-sm text-gray-600 line-clamp-2">{ride.pickup}</p>
          </div>
        </div>
        
        
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Drop-off</p>
            <p className="text-sm text-gray-600 line-clamp-2">{ride.dropoff}</p>
          </div>
        </div>

          <div className="flex items-start space-x-3">
          <DollarSign className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Amount</p>
            <p className="text-sm text-gray-600 line-clamp-2">{ride.finalPrice}</p>
          </div>
        </div>
      </div>


      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(ride.scheduledAt)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatTime(ride.scheduledAt)}</span>
        </div>

        {ride.distance && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Navigation className="w-4 h-4" />
            <span>{ride.distance.toFixed(1)} miles</span>
          </div>
        )}

        {ride.duration && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{ride.duration} min</span>
          </div>
        )}
      </div>

      {/* Driver and Payment Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {ride.driver && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{ride.driver.name}</p>
              <p className="text-xs text-gray-500">{ride.driver.vehicle}</p>
            </div>
          </div>
        )}

        {ride.payment && (
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                ${ride.payment.amount?.toFixed(2) || ride.finalPrice?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{ride.payment.status.toLowerCase()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <div>
          {ride.status === 'COMPLETED' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadInvoice}
              disabled={downloading}
              className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {downloading ? 'Downloading...' : (ride.invoice ? 'Download Invoice' : 'Generate Invoice')}
            </motion.button>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(ride)}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}