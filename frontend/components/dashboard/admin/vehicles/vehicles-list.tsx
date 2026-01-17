'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Car, 
  User, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  Users,
  Heart,
  FerrisWheelIcon
} from 'lucide-react';
import { Vehicle } from '@/types/vehicle.types';

interface VehiclesListProps {
  vehicles: Vehicle[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE') => void;
  onViewDetails: (vehicle: Vehicle) => void;
  loading?: boolean;
}

const vehicleTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'VAN', label: 'Van' },
  { value: 'WHEELCHAIR_VAN', label: 'Wheelchair Van' },
  { value: 'STRETCHER_VAN', label: 'Stretcher Van' },
];

const getInsuranceStatus = (vehicle: Vehicle) => {
  const today = new Date();
  const insuranceExpiry = new Date(vehicle.insuranceExpiry);
  const diffTime = insuranceExpiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return { status: 'expired', days: diffDays };
  if (diffDays <= 30) return { status: 'critical', days: diffDays };
  if (diffDays <= 60) return { status: 'warning', days: diffDays };
  return { status: 'safe', days: diffDays };
};

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

export default function VehiclesList({
  vehicles,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onEdit,
  onDelete,
  onUpdateStatus,
  onViewDetails,
  loading
}: VehiclesListProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="w-4 h-4" />;
      case 'IN_USE':
        return <User className="w-4 h-4" />;
      case 'MAINTENANCE':
        return <Ban className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Vehicles</h2>
          <p className="text-gray-600">View and manage all vehicles in the fleet</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-600">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vehicles by make, model, plate, or driver..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 inline mr-1" />
              Type Filter
            </label>
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                {/* Left Section - Vehicle Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {parseImages(vehicle.images).length > 0 ? (
                        <img
                          src={parseImages(vehicle.images)[0]}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)} flex items-center`}>
                          {getStatusIcon(vehicle.status)}
                          <span className="ml-1">{vehicle.status.replace('_', ' ')}</span>
                        </span>
                        
                        {/* Insurance Warning Badge */}
                        {getInsuranceStatus(vehicle).status !== 'safe' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getInsuranceStatus(vehicle).status === 'expired' ? 'bg-red-100 text-red-800' :
                            getInsuranceStatus(vehicle).status === 'critical' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {getInsuranceStatus(vehicle).status === 'expired' ? 'Insurance Expired' :
                            getInsuranceStatus(vehicle).status === 'critical' ? 'Insurance Expiring' :
                            'Insurance Expiring Soon'}
                          </span>
                        )}
                      </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onViewDetails(vehicle)}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </motion.button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === vehicle.id ? null : vehicle.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {activeDropdown === vehicle.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onEdit(vehicle);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Vehicle
                              </button>
                              {vehicle.status !== 'AVAILABLE' && (
                                <button
                                  onClick={() => {
                                    onUpdateStatus(vehicle.id, 'AVAILABLE');
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Available
                                </button>
                              )}
                              {vehicle.status !== 'IN_USE' && (
                                <button
                                  onClick={() => {
                                    onUpdateStatus(vehicle.id, 'IN_USE');
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                >
                                  <User className="w-4 h-4 mr-2" />
                                  Mark In Use
                                </button>
                              )}
                              {vehicle.status !== 'MAINTENANCE' && (
                                <button
                                  onClick={() => {
                                    onUpdateStatus(vehicle.id, 'MAINTENANCE');
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Mark Maintenance
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onDelete(vehicle.id);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Vehicle
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Car className="w-4 h-4" />
                      <span>{vehicle.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{vehicle.capacity} passengers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Color:</span>
                      <span>{vehicle.color}</span>
                    </div>
                    {vehicle.vin && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">VIN:</span> {vehicle.vin}
                      </div>
                    )}
                  </div>

                  {/* Special Features */}
                  {(vehicle.hasWheelchairAccess || vehicle.hasOxygenSupport) && (
                    <div className="flex items-center space-x-4 mb-4">
                      {vehicle.hasWheelchairAccess && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <FerrisWheelIcon className="w-3 h-3 mr-1" />
                          Wheelchair Accessible
                        </span>
                      )}
                      {vehicle.hasOxygenSupport && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                          <Heart className="w-3 h-3 mr-1" />
                          Oxygen Support
                        </span>
                      )}
                    </div>
                  )}
                  </div>

                  {/* Additional Images */}
                  {parseImages(vehicle.images).length > 1 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Additional Images:</p>
                      <div className="flex space-x-2 overflow-x-auto">
                        {parseImages(vehicle.images).slice(1).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${vehicle.make} ${vehicle.model} ${index + 2}`}
                            className="w-16 h-12 object-cover rounded border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}