'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, AlertCircle, Clock, CheckCircle, Navigation, MapPin, PlayCircle, Flag, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Ride } from '@/types/ride.types';
import { DriverRidesService } from '@/services/driver-rides.service';
import RidesHeader from '@/components/dashboard/driver/rides/rides-header';
import RidesFilters from '@/components/dashboard/driver/rides/rides-filters';
import RidesList from '@/components/dashboard/driver/rides/rides-list';
import RideDetails from '@/components/dashboard/driver/rides/ride-details';

export default function RidesPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch driver's rides
  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [assignedRides, activeRides, historyRides] = await Promise.all([
        DriverRidesService.getAssignedRides(),
        DriverRidesService.getActiveRides(),
        DriverRidesService.getRideHistory()
      ]);

      const allRides = [...assignedRides, ...activeRides, ...historyRides];
      setRides(allRides);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  // Update ride status
  const updateRideStatus = async (rideId: number, newStatus: Ride['status'], estimatedArrival?: number) => {
    try {
      setIsUpdating(true);
      
      const updatedRide = await DriverRidesService.updateRideStatus(rideId, newStatus, estimatedArrival);
      
      // Update local state
      setRides(prev => prev.map(ride => 
        ride.id === rideId ? { ...ride, ...updatedRide } : ride
      ));
      
      if (selectedRide?.id === rideId) {
        setSelectedRide(prev => prev ? { ...prev, ...updatedRide } : null);
      }
    } catch (err) {
      console.error('Error updating ride status:', err);
      setError('Failed to update ride status');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Accept a ride
  const acceptRide = async (rideId: number, estimatedArrivalMinutes: number) => {
    try {
      setIsUpdating(true);
      
      const acceptedRide = await DriverRidesService.acceptRide(rideId, estimatedArrivalMinutes);
      
      // Update local state
      setRides(prev => prev.map(ride => 
        ride.id === rideId ? { ...ride, ...acceptedRide } : ride
      ));
      
      if (selectedRide?.id === rideId) {
        setSelectedRide(prev => prev ? { ...prev, ...acceptedRide } : null);
      }
    } catch (err) {
      console.error('Error accepting ride:', err);
      setError('Failed to accept ride');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Complete a ride
  const completeRide = async (rideId: number, actualDistance?: number, actualDuration?: number) => {
    try {
      setIsUpdating(true);
      
      const completedRide = await DriverRidesService.completeRide(rideId, actualDistance, actualDuration);
      
      // Update local state
      setRides(prev => prev.map(ride => 
        ride.id === rideId ? { ...ride, ...completedRide } : ride
      ));
      
      if (selectedRide?.id === rideId) {
        setSelectedRide(prev => prev ? { ...prev, ...completedRide } : null);
      }
    } catch (err) {
      console.error('Error completing ride:', err);
      setError('Failed to complete ride');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter rides based on search and status
  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && 
        ['ASSIGNED', 'CONFIRMED', 'DRIVER_EN_ROUTE', 'PICKUP_ARRIVED', 'IN_PROGRESS'].includes(ride.status)) ||
      (statusFilter === 'completed' && ride.status === 'COMPLETED') ||
      (statusFilter === 'upcoming' && ride.status === 'ASSIGNED');

    return matchesSearch && matchesStatus;
  });

  // Group rides by status for better organization
  const activeRides = filteredRides.filter(ride => 
    ['ASSIGNED', 'CONFIRMED', 'DRIVER_EN_ROUTE', 'PICKUP_ARRIVED', 'IN_PROGRESS'].includes(ride.status)
  );

  const completedRides = filteredRides.filter(ride => 
    ride.status === 'COMPLETED'
  );

  // Status utilities
  const getStatusColor = (status: Ride['status']) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      DRIVER_EN_ROUTE: 'bg-purple-100 text-purple-800',
      PICKUP_ARRIVED: 'bg-indigo-100 text-indigo-800',
      IN_PROGRESS: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: Ride['status']) => {
    const icons = {
      PENDING: Clock,
      ASSIGNED: AlertCircle,
      CONFIRMED: CheckCircle,
      DRIVER_EN_ROUTE: Navigation,
      PICKUP_ARRIVED: MapPin,
      IN_PROGRESS: PlayCircle,
      COMPLETED: Flag,
      CANCELLED: XCircle,
    };
    return icons[status] || Clock;
  };

  const getNextStatusAction = (currentStatus: Ride['status']) => {
    const actions = {
      ASSIGNED: { label: 'Accept Ride', nextStatus: 'CONFIRMED', requiresETA: true },
      CONFIRMED: { label: 'Start Ride', nextStatus: 'DRIVER_EN_ROUTE' },
      DRIVER_EN_ROUTE: { label: 'Arrived at Pickup', nextStatus: 'PICKUP_ARRIVED' },
      PICKUP_ARRIVED: { label: 'Start Trip', nextStatus: 'IN_PROGRESS' },
      IN_PROGRESS: { label: 'Complete Ride', nextStatus: 'COMPLETED' },
    };
    return actions[currentStatus as keyof typeof actions];
  };

  useEffect(() => {
    fetchRides();
    
    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(fetchRides, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <RidesHeader activeRidesCount={activeRides.length} />
      
      <RidesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RidesList
          activeRides={activeRides}
          completedRides={completedRides}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          selectedRide={selectedRide}
          onSelectRide={setSelectedRide}
          onStatusUpdate={updateRideStatus}
          onAcceptRide={acceptRide}
          isUpdating={isUpdating}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getNextStatusAction={getNextStatusAction}
        />

        {/* Ride Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedRide ? (
            <RideDetails
              ride={selectedRide}
              onStatusUpdate={updateRideStatus}
              onAccept={acceptRide}
              isUpdating={isUpdating}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getNextStatusAction={getNextStatusAction}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
            >
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Ride</h3>
              <p className="text-gray-500">Click on a ride to view details and take action</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}