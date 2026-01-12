'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Car as CarIcon, 
  Plus, 
  CheckCircle, 
  XCircle,
  Wrench,
  AlertCircle,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import { Vehicle } from '@/types/vehicle.types';
import VehiclesList from '@/components/dashboard/admin/vehicles/vehicles-list';
import AddVehicleForm from '@/components/dashboard/admin/vehicles/add-vehicle-form';
import VehicleDetailsModal from '@/components/dashboard/admin/vehicles/vehicle-details-modal';
import VehicleStats from '@/components/dashboard/admin/vehicles/vehicle-stats';
import EditVehicleForm from '@/components/dashboard/admin/vehicles/edit-vehicle-form';

export default function VehicleManagementPage() {
  const {
    vehicles,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    refetch,
    refetchStats,
  } = useVehicles();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateVehicle = async (vehicleData: any, images: File[]) => {
    setActionLoading(true);
    try {
      await createVehicle(vehicleData, images);
      setShowAddForm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditVehicle = async (vehicleData: any, images: File[]) => {
    if (!editingVehicle) return;
    
    setActionLoading(true);
    try {
      await updateVehicle(editingVehicle.id, vehicleData, images);
      setEditingVehicle(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteVehicle(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE') => {
    setActionLoading(true);
    try {
      await updateVehicleStatus(id, status);
    } finally {
      setActionLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Vehicles',
      value: stats?.total || 0,
      icon: CarIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Available',
      value: stats?.available || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'In Use',
      value: stats?.inUse || 0,
      icon: XCircle,
      color: 'bg-orange-500',
    },
    {
      title: 'Maintenance',
      value: stats?.maintenance || 0,
      icon: Wrench,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your fleet of vehicles and assign them to drivers
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            className="mt-4 lg:mt-0 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Vehicle
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Vehicle Statistics Chart */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <VehicleStats stats={stats} />
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <AddVehicleForm
              onSubmit={handleCreateVehicle}
              onCancel={() => setShowAddForm(false)}
              loading={actionLoading}
            />
          ) : editingVehicle ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <EditVehicleForm
              vehicle={editingVehicle}
              onSubmit={handleEditVehicle}
              onCancel={() => setEditingVehicle(null)}
              loading={actionLoading}
            />
          </motion.div>
        ) : (
            <motion.div
              key="vehicles-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VehiclesList
                vehicles={vehicles}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={(status) => setStatusFilter(status as 'all' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE')}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                onEdit={setEditingVehicle}
                onDelete={handleDeleteVehicle}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={setSelectedVehicle}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vehicle Details Modal */}
        <AnimatePresence>
          {selectedVehicle && (
            <VehicleDetailsModal
              vehicle={selectedVehicle}
              isOpen={!!selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
              onEdit={() => {
                setEditingVehicle(selectedVehicle);
                setSelectedVehicle(null);
              }}
              onUpdateStatus={(status) => {
                handleUpdateStatus(selectedVehicle.id, status);
                setSelectedVehicle(null);
              }}
              onDelete={() => {
                handleDeleteVehicle(selectedVehicle.id);
                setSelectedVehicle(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
      <InsuranceAlertBanner vehicles={vehicles} />
    </div>
  );
}


function InsuranceAlertBanner({ vehicles }: { vehicles: Vehicle[] }) {
  const expiringVehicles = vehicles.filter(vehicle => {
    const insuranceExpiry = new Date(vehicle.insuranceExpiry);
    const today = new Date();
    const diffTime = insuranceExpiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays > 0;
  });

  const expiredVehicles = vehicles.filter(vehicle => {
    const insuranceExpiry = new Date(vehicle.insuranceExpiry);
    const today = new Date();
    return insuranceExpiry <= today;
  });

  if (expiringVehicles.length === 0 && expiredVehicles.length === 0) return null;

  return (
    <div className={`mb-6 rounded-xl p-4 ${
      expiredVehicles.length > 0 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
    } border`}>
      <div className="flex items-center">
        <AlertTriangle className={`w-5 h-5 mr-2 ${
          expiredVehicles.length > 0 ? 'text-red-600' : 'text-orange-600'
        }`} />
        <div className="flex-1">
          <p className={`font-medium ${
            expiredVehicles.length > 0 ? 'text-red-800' : 'text-orange-800'
          }`}>
            Insurance Alert
          </p>
          <p className={`text-sm ${
            expiredVehicles.length > 0 ? 'text-red-700' : 'text-orange-700'
          }`}>
            {expiredVehicles.length > 0 
              ? `${expiredVehicles.length} vehicle(s) have expired insurance!`
              : `${expiringVehicles.length} vehicle(s) have insurance expiring within 60 days.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}