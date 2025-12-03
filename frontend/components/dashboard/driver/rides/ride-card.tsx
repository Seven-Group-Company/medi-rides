'use client';

import { motion } from 'framer-motion';
import { MapPin, CheckCircle, Clock, Navigation, PlayCircle, Flag, AlertCircle, XCircle } from 'lucide-react';
import { Ride } from '@/types/ride.types';

interface RideCardProps {
  ride: Ride;
  onSelect: (ride: Ride) => void;
  onStatusUpdate?: (rideId: number, newStatus: Ride['status'], estimatedArrival?: number) => Promise<void>;
  onAccept?: (rideId: number, estimatedArrivalMinutes: number) => Promise<void>;
  isUpdating?: boolean;
  getStatusColor: (status: Ride['status']) => string;
  getStatusIcon: (status: Ride['status']) => any;
  getNextStatusAction?: (status: Ride['status']) => any;
  isSelected?: boolean;
}

export default function RideCard({ 
  ride, 
  onSelect, 
  onStatusUpdate, 
  onAccept, 
  isUpdating, 
  getStatusColor, 
  getStatusIcon, 
  getNextStatusAction,
  isSelected 
}: RideCardProps) {
  const StatusIcon = getStatusIcon(ride.status);
  const nextAction = getNextStatusAction?.(ride.status);

  const handleQuickAction = async () => {
    if (!nextAction || !onStatusUpdate) return;
    
    if (nextAction.requiresETA) {
      return;
    }
    
    try {
      await onStatusUpdate(ride.id, nextAction.nextStatus as Ride['status']);
    } catch (error) {
      // Error handled in parent
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(ride)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(ride.status)}`}>
              <StatusIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{ride.passengerName}</h3>
              <p className="text-sm text-gray-500">
                {new Date(ride.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">${ride.finalPrice || ride.basePrice}</p>
            <p className="text-xs text-gray-500 capitalize">{ride.serviceType.toLowerCase()}</p>
          </div>
        </div>

        {/* Route */}
        <div className="space-y-2 mb-3">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pickup</p>
              <p className="text-xs text-gray-600 truncate">{ride.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Dropoff</p>
              <p className="text-xs text-gray-600 truncate">{ride.dropoffAddress}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {nextAction && onStatusUpdate && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-600">{ride.status.replace('_', ' ')}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction();
              }}
              disabled={isUpdating}
              className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : nextAction.label}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}