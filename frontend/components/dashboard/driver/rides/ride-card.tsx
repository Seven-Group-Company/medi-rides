'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Ride } from '@/types/ride.types';
import { useState } from 'react';

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
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('15');

  const handleQuickAction = async () => {
    if (!nextAction) return;
    
    if (nextAction.requiresETA && !showQuickAction) {
      setShowQuickAction(true);
      return;
    }
    
    try {
      if (nextAction.requiresETA) {
        const etaMinutes = parseInt(estimatedArrival) || 15;
        if (etaMinutes < 1 || etaMinutes > 180) {
          alert('Please enter an ETA between 1 and 180 minutes');
          return;
        }
        if (onAccept) {
          await onAccept(ride.id, etaMinutes);
        }
      } else if (onStatusUpdate) {
        await onStatusUpdate(ride.id, nextAction.nextStatus as Ride['status']);
      }
      setShowQuickAction(false);
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
              {ride.isGuest && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full mt-1">
                  Guest
                </span>
              )}
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
      </div>
    </motion.div>
  );
}