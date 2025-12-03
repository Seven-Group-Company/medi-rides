'use client';

import { motion } from 'framer-motion';
import { Ride } from '@/types/ride.types';
import RideCard from './ride-card';
import EmptyState from './empty-state';

interface RidesListProps {
  activeRides: Ride[];
  completedRides: Ride[];
  searchTerm: string;
  statusFilter: string;
  selectedRide: Ride | null;
  onSelectRide: (ride: Ride) => void;
  onStatusUpdate: (rideId: number, newStatus: Ride['status'], estimatedArrival?: number) => Promise<void>;
  onAcceptRide: (rideId: number, estimatedArrivalMinutes: number) => Promise<void>;
  isUpdating: boolean;
  getStatusColor: (status: Ride['status']) => string;
  getStatusIcon: (status: Ride['status']) => any;
  getNextStatusAction: (status: Ride['status']) => any;
}

export default function RidesList({
  activeRides,
  completedRides,
  searchTerm,
  statusFilter,
  selectedRide,
  onSelectRide,
  onStatusUpdate,
  onAcceptRide,
  isUpdating,
  getStatusColor,
  getStatusIcon,
  getNextStatusAction,
}: RidesListProps) {
  const hasRides = activeRides.length > 0 || completedRides.length > 0;

  if (!hasRides) {
    return <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />;
  }

  return (
    <div className="lg:col-span-2">
      {/* Active Rides */}
      {activeRides.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Rides ({activeRides.length})</h2>
          <div className="space-y-4">
            {activeRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onSelect={onSelectRide}
                onStatusUpdate={onStatusUpdate}
                onAccept={onAcceptRide}
                isUpdating={isUpdating}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getNextStatusAction={getNextStatusAction}
                isSelected={selectedRide?.id === ride.id}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Completed Rides */}
      {completedRides.length > 0 && statusFilter !== 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Rides ({completedRides.length})</h2>
          <div className="space-y-4">
            {completedRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onSelect={onSelectRide}
                isSelected={selectedRide?.id === ride.id}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}