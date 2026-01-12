'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Car, Star, Phone, MapPin } from 'lucide-react';
import { Driver, RideRequest, Vehicle } from '@/types/admin.types';

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideRequest | null;
  drivers: Driver[];
  vehicles: Vehicle[];
  onAssign: (driverId: number, vehicleId: number) => void;
}

export default function AssignDriverModal({
  isOpen,
  onClose,
  ride,
  drivers,
  vehicles,
  onAssign
}: AssignDriverModalProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  if (!isOpen || !ride) return null;

  const handleAssign = () => {
    if (selectedDriver && selectedVehicle) {
      onAssign(selectedDriver.id, selectedVehicle.id);
      setSelectedDriver(null);
      setSelectedVehicle(null);
    }
  };

  const filteredVehicles = selectedDriver 
    ? vehicles.filter(v => v.driver?.id === selectedDriver.id || !v.driver)
    : vehicles;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assign Driver & Vehicle</h2>
            <p className="text-gray-600">Ride ID: #{ride.id.toString().padStart(6, '0')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Ride Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Customer</p>
                <p className="text-gray-600">{ride.customer?.name || 'Guest'}</p>
                <p className="text-sm text-gray-500">{ride.customer?.phone || ride.passengerPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Schedule</p>
                <p className="text-gray-600">{formatDateTime(ride.scheduledAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Pickup</p>
                <p className="text-gray-600 flex items-start">
                  <MapPin className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  {ride.pickupAddress}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Drop-off</p>
                <p className="text-gray-600 flex items-start">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  {ride.dropoffAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Driver Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Driver</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {drivers.map((driver) => (
                  <motion.div
                    key={driver.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDriver?.id === driver.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{driver.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {driver.phone}
                        </p>
                        <p className="text-sm text-gray-500">
                          {driver.totalRides} rides • {driver.vehicle?.type}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Vehicle</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredVehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedVehicle?.id === vehicle.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">
                            {vehicle.make} {vehicle.model}
                          </h4>
                          <span className="text-sm font-medium text-gray-500">
                            {vehicle.year}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {vehicle.licensePlate} • {vehicle.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Capacity: {vehicle.capacity} • {vehicle.driver ? `Assigned to ${vehicle.driver.name}` : 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedDriver || !selectedVehicle}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-medium transition-colors duration-200 flex items-center"
            >
              <User className="w-4 h-4 mr-2" />
              Assign to Ride
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}