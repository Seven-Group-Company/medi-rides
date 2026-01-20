import React, { useState, useEffect } from 'react';
import { Driver, Vehicle, VehicleType, VehicleStatus } from '@/types/driver';
import { useVehicles } from '@/hooks/useVehicles';
import { toast } from 'react-hot-toast';

interface AssignVehiclesModalProps {
  driver: Driver;
  onClose: () => void;
  onSubmit: (vehicleIds: number[]) => void;
}

const AssignVehiclesModal: React.FC<AssignVehiclesModalProps> = ({ driver, onClose, onSubmit }) => {
  const { 
    vehicles, 
    loading, 
    error,
    refetch 
  } = useVehicles();
  
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'assigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    // Initialize selected vehicles with currently assigned vehicles
    const assignedVehicleIds = driver.driverProfile?.vehicles?.map(v => v.id) || [];
    setSelectedVehicleIds(assignedVehicleIds);
    setInternalLoading(false);
  }, [driver]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load vehicles');
    }
  }, [error]);

  const handleVehicleToggle = (vehicleId: number) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedVehicleIds);
  };

  const handleRefresh = () => {
    setInternalLoading(true);
    refetch().finally(() => setInternalLoading(false));
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [VehicleType.SEDAN]: 'Sedan',
      [VehicleType.SUV]: 'SUV',
      [VehicleType.VAN]: 'Van',
      [VehicleType.WHEELCHAIR_VAN]: 'Wheelchair Van',
      [VehicleType.STRETCHER_VAN]: 'Stretcher Van',
    };
    return labels[type] || type;
  };

  const getVehicleStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      [VehicleStatus.AVAILABLE]: 'Available',
      [VehicleStatus.IN_USE]: 'In Use',
      [VehicleStatus.MAINTENANCE]: 'Maintenance',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      [VehicleStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [VehicleStatus.IN_USE]: 'bg-blue-100 text-blue-800',
      [VehicleStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Filter vehicles based on search and filter criteria
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'available' && vehicle.status === VehicleStatus.AVAILABLE) ||
      (filter === 'assigned' && selectedVehicleIds.includes(vehicle.id));
    
    return matchesSearch && matchesFilter;
  });

  // Get available vehicles (not currently assigned to this driver)
  const availableVehicles = filteredVehicles.filter(vehicle => 
    !driver.driverProfile?.vehicles?.some(assignedVehicle => assignedVehicle.id === vehicle.id)
  );

  if (loading || internalLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading vehicles...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Assign Vehicles to {driver.name}
            </h2>
            <p className="text-gray-600 mt-1">
              Currently assigned: {driver.driverProfile?.vehicles?.length || 0} vehicles
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Vehicles ({vehicles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('available')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'available'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Available ({vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('assigned')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'assigned'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Selected ({selectedVehicleIds.length})
                </button>
              </div>
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by license plate, make, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Selected Vehicles Summary */}
          {selectedVehicleIds.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedVehicleIds.length} vehicles</strong> selected for assignment
              </p>
            </div>
          )}

          {/* Available Vehicles Grid */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Available Vehicles ({availableVehicles.length})
            </h4>
            
            {availableVehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                {searchQuery || filter !== 'all' ? (
                  <p>No vehicles match your search criteria.</p>
                ) : (
                  <p>No available vehicles found.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedVehicleIds.includes(vehicle.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      vehicle.status !== VehicleStatus.AVAILABLE ? 'opacity-60' : ''
                    }`}
                    onClick={() => vehicle.status === VehicleStatus.AVAILABLE && handleVehicleToggle(vehicle.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedVehicleIds.includes(vehicle.id)}
                        onChange={() => vehicle.status === VehicleStatus.AVAILABLE && handleVehicleToggle(vehicle.id)}
                        disabled={vehicle.status !== VehicleStatus.AVAILABLE}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-gray-900">{getVehicleTypeLabel(vehicle.type)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="text-gray-900">{vehicle.capacity} passengers</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                            vehicle.status
                          )}`}
                        >
                          {getVehicleStatusLabel(vehicle.status)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Features:</span>
                        <span className="text-gray-900">
                          {vehicle.hasWheelchairAccess && '♿ '}
                          {vehicle.hasOxygenSupport && '💨 '}
                          {!vehicle.hasWheelchairAccess && !vehicle.hasOxygenSupport && 'Standard'}
                        </span>
                      </div>
                      {vehicle.status !== VehicleStatus.AVAILABLE && (
                        <div className="text-xs text-orange-600 mt-2">
                          Vehicle is {getVehicleStatusLabel(vehicle.status).toLowerCase()} and cannot be assigned
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Currently Assigned Vehicles */}
          {(driver.driverProfile?.vehicles?.length || 0) > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Currently Assigned Vehicles ({driver.driverProfile?.vehicles?.length || 0})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {driver.driverProfile?.vehicles?.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h5>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          vehicle.status
                        )}`}
                      >
                        {getVehicleStatusLabel(vehicle.status)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">License Plate:</span>
                        <span className="text-gray-900 font-medium">{vehicle.licensePlate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-gray-900">{getVehicleTypeLabel(vehicle.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="text-gray-900">{vehicle.capacity} passengers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedVehicleIds.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Selected Vehicles ({selectedVehicleIds.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignVehiclesModal;