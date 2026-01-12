'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, MapPin, Navigation, DollarSign, AlertCircle } from 'lucide-react';
import { Ride } from '@/types/ride.types';

interface RideDetailsProps {
  ride: Ride;
  onStatusUpdate: (rideId: number, newStatus: Ride['status'], estimatedArrival?: number) => Promise<void>;
  onAccept: (rideId: number, estimatedArrivalMinutes: number) => Promise<void>;
  isUpdating: boolean;
  getStatusColor: (status: Ride['status']) => string;
  getStatusIcon: (status: Ride['status']) => any;
  getNextStatusAction: (status: Ride['status']) => any;
}

export default function RideDetails({ 
  ride, 
  onStatusUpdate, 
  onAccept, 
  isUpdating, 
  getStatusColor, 
  getStatusIcon, 
  getNextStatusAction 
}: RideDetailsProps) {
  const StatusIcon = getStatusIcon(ride.status);
  const nextAction = getNextStatusAction(ride.status);
  const [eta, setEta] = useState(15);

  const handleAction = async () => {
    if (!nextAction) return;

    try {
      if (ride.status === 'ASSIGNED') {
        await onAccept(ride.id, eta);
      } else {
        await onStatusUpdate(ride.id, nextAction.nextStatus as Ride['status']);
      }
    } catch (error) {
      // Error handled in parent
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    
    try {
      await onStatusUpdate(ride.id, 'CANCELLED');
    } catch (error) {
      // Error handled in parent
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(ride.status)}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ride Details</h3>
              <p className="text-sm text-gray-500 capitalize">{ride.status.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">${ride.finalPrice || ride.basePrice}</p>
          </div>
        </div>

        {/* Passenger Info */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{ride.passengerName}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Phone className="w-4 h-4" />
              <span>{ride.passengerPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Information */}
      <div className="p-6 space-y-4">
        {/* Schedule */}
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Scheduled Time</p>
            <p className="text-sm text-gray-600">
              {new Date(ride.scheduledAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pickup Location</p>
              <p className="text-sm text-gray-600">{ride.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Dropoff Location</p>
              <p className="text-sm text-gray-600">{ride.dropoffAddress}</p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-900">Service Type</p>
            <p className="text-gray-600 capitalize">{ride.serviceType.toLowerCase()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Distance</p>
            <p className="text-gray-600">{ride.distance ? `${ride.distance} mi` : 'N/A'}</p>
          </div>
        </div>

        {/* Special Instructions */}
        {ride.specialNeeds && (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Special Needs</p>
            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{ride.specialNeeds}</p>
          </div>
        )}

        {ride.additionalNotes && (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Additional Notes</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{ride.additionalNotes}</p>
          </div>
        )}

        {/* ETA Input for Acceptance */}
        {ride.status === 'ASSIGNED' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Estimated Arrival Time (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={eta}
              onChange={(e) => setEta(parseInt(e.target.value) || 15)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          {nextAction && (
            <button
              onClick={handleAction}
              disabled={isUpdating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Processing...' : nextAction.label}
            </button>
          )}

          {['ASSIGNED', 'CONFIRMED', 'DRIVER_EN_ROUTE'].includes(ride.status) && (
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel Ride
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}