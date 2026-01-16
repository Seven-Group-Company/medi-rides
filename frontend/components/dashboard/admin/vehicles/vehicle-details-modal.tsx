'use client';

import { motion } from 'framer-motion';
import { 
  X, Car, User, Calendar, Users, FerrisWheelIcon, Heart,
  Edit, Trash2, CheckCircle, Ban, AlertTriangle, Shield
} from 'lucide-react';
import { Vehicle } from '@/types/vehicle.types';
import InsuranceWarning from './vehicle-insurance-warning'; // Add this import

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onUpdateStatus: (status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE') => void;
  onDelete: () => void;
}

// Helper function to parse images from string or array
const parseImages = (images: string | string[] | null | undefined): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function VehicleDetailsModal({
  vehicle,
  isOpen,
  onClose,
  onEdit,
  onUpdateStatus,
  onDelete
}: VehicleDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isInsuranceExpiring = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  };

  const getInsuranceStatusColor = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'text-red-600';
    if (diffDays <= 30) return 'text-red-600 font-bold';
    if (diffDays <= 60) return 'text-orange-600 font-semibold';
    return 'text-gray-900';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Details</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-semibold text-gray-700">#{vehicle.id.toString().padStart(6, '0')}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                {vehicle.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Top Section - Images & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Image */}
            <div className="lg:col-span-2">
              {parseImages(vehicle.images).length > 0 ? (
                <div className="bg-gray-100 rounded-xl p-4">
                  <img
                    src={parseImages(vehicle.images)[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {parseImages(vehicle.images).length > 1 && (
                    <div className="flex space-x-2 mt-4 overflow-x-auto">
                      {parseImages(vehicle.images).slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${vehicle.make} ${vehicle.model} ${index + 2}`}
                          className="w-20 h-16 object-cover rounded border border-gray-300"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-12 flex flex-col items-center justify-center">
                  <Car className="w-16 h-16 text-blue-400 mb-4" />
                  <p className="text-gray-600">No images available</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vehicle Age</span>
                  <span className="font-semibold">{new Date().getFullYear() - vehicle.year} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-semibold flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {vehicle.capacity} passengers
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold capitalize">{vehicle.type.toLowerCase().replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Color</span>
                  <span className="font-semibold">{vehicle.color}</span>
                </div>
                {vehicle.vin && (
                  <div className="pt-4 border-t border-gray-200">
                    <span className="text-gray-600">VIN</span>
                    <p className="font-mono text-sm mt-1">{vehicle.vin}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Specifications */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Specifications
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Make</p>
                    <p className="font-semibold">{vehicle.make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-semibold">{vehicle.model}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-semibold font-mono">{vehicle.licensePlate}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="font-semibold capitalize">{vehicle.type.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-semibold">{vehicle.color}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Features */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Features</h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg ${vehicle.hasWheelchairAccess ? 'bg-purple-50 border border-purple-200' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <FerrisWheelIcon className={`w-5 h-5 ${vehicle.hasWheelchairAccess ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium">Wheelchair Accessible</p>
                      <p className="text-sm text-gray-500">Ramp/lift for wheelchair access</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${vehicle.hasWheelchairAccess ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
                    {vehicle.hasWheelchairAccess ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-lg ${vehicle.hasOxygenSupport ? 'bg-pink-50 border border-pink-200' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <Heart className={`w-5 h-5 ${vehicle.hasOxygenSupport ? 'text-pink-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium">Oxygen Support</p>
                      <p className="text-sm text-gray-500">Oxygen tank storage & support</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${vehicle.hasOxygenSupport ? 'bg-pink-100 text-pink-800' : 'bg-gray-200 text-gray-600'}`}>
                    {vehicle.hasOxygenSupport ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Document Expiry Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Vehicle Insurance */}
              <div className={`p-4 rounded-lg border ${isInsuranceExpiring(vehicle.insuranceExpiry) ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Vehicle Insurance</span>
                  {isInsuranceExpiring(vehicle.insuranceExpiry) && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className={`text-lg font-semibold ${getInsuranceStatusColor(vehicle.insuranceExpiry)}`}>
                  {formatDate(vehicle.insuranceExpiry)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isInsuranceExpiring(vehicle.insuranceExpiry) ? 'Expiring' : 'Valid'}
                </p>
              </div>

              {/* Liability Insurance */}
                <div className={`p-4 rounded-lg border ${isInsuranceExpiring(vehicle.liabilityInsuranceExpiry) ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Liability Insurance</span>
                    {isInsuranceExpiring(vehicle.liabilityInsuranceExpiry) && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className={`text-lg font-semibold ${getInsuranceStatusColor(vehicle.liabilityInsuranceExpiry)}`}>
                    {formatDate(vehicle.liabilityInsuranceExpiry)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isInsuranceExpiring(vehicle.liabilityInsuranceExpiry) ? 'Expiring' : 'Valid'}
                  </p>
                </div>

              {/* Registration */}
              <div className={`p-4 rounded-lg border ${isInsuranceExpiring(vehicle.registrationExpiry) ? 'border-orange-300 bg-orange-50' : 'border-purple-300 bg-purple-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Registration</span>
                  {isInsuranceExpiring(vehicle.registrationExpiry) && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <p className={`text-lg font-semibold ${getInsuranceStatusColor(vehicle.registrationExpiry)}`}>
                  {formatDate(vehicle.registrationExpiry)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isInsuranceExpiring(vehicle.registrationExpiry) ? 'Expiring' : 'Valid'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onEdit}
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Vehicle
              </button>
              
              <button
                onClick={() => onUpdateStatus('AVAILABLE')}
                disabled={vehicle.status === 'AVAILABLE'}
                className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 rounded-lg transition-colors duration-200 flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Available
              </button>
              
              <button
                onClick={() => onUpdateStatus('IN_USE')}
                disabled={vehicle.status === 'IN_USE'}
                className="px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 rounded-lg transition-colors duration-200 flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Mark In Use
              </button>
              
              <button
                onClick={() => onUpdateStatus('MAINTENANCE')}
                disabled={vehicle.status === 'MAINTENANCE'}
                className="px-6 py-3 bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-300 rounded-lg transition-colors duration-200 flex items-center"
              >
                <Ban className="w-4 h-4 mr-2" />
                Mark Maintenance
              </button>
              
              <button
                onClick={onDelete}
                className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Last Updated:</span> {new Date(vehicle.updatedAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}