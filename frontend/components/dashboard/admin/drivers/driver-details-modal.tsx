import React from 'react';
import { Driver, VehicleType, VehicleStatus } from '@/types/driver';

interface DriverDetailsModalProps {
  driver: Driver;
  onClose: () => void;
}

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({ driver, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVehicleTypeLabel = (type: VehicleType) => {
    const labels: Record<VehicleType, string> = {
      [VehicleType.SEDAN]: 'Sedan',
      [VehicleType.SUV]: 'SUV',
      [VehicleType.VAN]: 'Van',
      [VehicleType.WHEELCHAIR_VAN]: 'Wheelchair Van',
      [VehicleType.STRETCHER_VAN]: 'Stretcher Van',
    };
    return labels[type];
  };

  const getVehicleStatusLabel = (status: VehicleStatus) => {
    const labels: Record<VehicleStatus, string> = {
      [VehicleStatus.AVAILABLE]: 'Available',
      [VehicleStatus.IN_USE]: 'In Use',
      [VehicleStatus.MAINTENANCE]: 'Maintenance',
    };
    return labels[status];
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Driver Details: {driver.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={driver.avatar || '/default-avatar.png'}
              alt={driver.name}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
              <p className="text-gray-600">{driver.email}</p>
              <p className="text-gray-600">{driver.phone}</p>
              <div className="flex space-x-2 mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    driver.driverProfile.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {driver.driverProfile.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    driver.isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {driver.isActive ? 'Active' : 'Inactive'}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    driver.isVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {driver.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{driver.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{driver.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="text-sm text-gray-900">{formatDate(driver.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                  <dd className="text-sm text-gray-900">
                    {driver.lastLoginAt ? formatDateTime(driver.lastLoginAt) : 'Never'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* License Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">License Information</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">License Number</dt>
                  <dd className="text-sm text-gray-900">{driver.driverProfile.licenseNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">License State</dt>
                  <dd className="text-sm text-gray-900">{driver.driverProfile.licenseState}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">License Expiry</dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(driver.driverProfile.licenseExpiry)}
                    {new Date(driver.driverProfile.licenseExpiry) < new Date() && (
                      <span className="ml-2 text-red-600 font-medium">(Expired)</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Trips</dt>
                  <dd className="text-sm text-gray-900">{driver.driverProfile.totalTrips}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rating</dt>
                  <dd className="text-sm text-gray-900">
                    {driver.driverProfile.rating ? (
                      <span className="flex items-center">
                        {driver.driverProfile.rating.toFixed(1)}
                        <span className="ml-1 text-yellow-400">⭐</span>
                      </span>
                    ) : (
                      'No ratings yet'
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Assigned Vehicles ({driver.driverProfile.vehicles.length})
              </h4>
              {driver.driverProfile.vehicles.length === 0 ? (
                <p className="text-gray-500 text-sm">No vehicles assigned</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {driver.driverProfile.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h5>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === VehicleStatus.AVAILABLE
                              ? 'bg-green-100 text-green-800'
                              : vehicle.status === VehicleStatus.IN_USE
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {getVehicleStatusLabel(vehicle.status as VehicleStatus)}
                        </span>
                      </div>
                      <dl className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">License Plate:</dt>
                          <dd className="text-gray-900 font-medium">{vehicle.licensePlate}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Type:</dt>
                          <dd className="text-gray-900">{getVehicleTypeLabel(vehicle.type as VehicleType)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Capacity:</dt>
                          <dd className="text-gray-900">{vehicle.capacity} passengers</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Features:</dt>
                          <dd className="text-gray-900">
                            {vehicle.hasWheelchairAccess && '♿ '}
                            {vehicle.hasOxygenSupport && '💨 '}
                            {!vehicle.hasWheelchairAccess && !vehicle.hasOxygenSupport && 'None'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Information */}
            {(driver.driverProfile.vehicleInfo || driver.driverProfile.insuranceInfo) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {driver.driverProfile.vehicleInfo && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Vehicle Info</h5>
                      <p className="text-sm text-gray-900">{driver.driverProfile.vehicleInfo}</p>
                    </div>
                  )}
                  {driver.driverProfile.insuranceInfo && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Insurance Info</h5>
                      <p className="text-sm text-gray-900">{driver.driverProfile.insuranceInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsModal;