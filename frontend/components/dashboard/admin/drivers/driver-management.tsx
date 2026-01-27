'use client';

import React, { useState, useEffect } from 'react';
import { 
  Driver, 
  DriverStats, 
  CreateDriverData, 
  UpdateDriverData 
} from '@/types/driver';
import { driverService } from '@/services/driver-service';
import DriverTable from './driver-table';
import DriverStatsCards from './driver-stats-cards';
import CreateDriverModal from './create-driver-modal';
import EditDriverModal from './edit-driver-modal';
import DriverDetailsModal from './driver-details-modal';
import AssignVehiclesModal from './assign-vehicles-modal';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  Users,
} from 'lucide-react';

const DriverManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    loadDrivers();
    loadStats();
  }, [pagination.page, pagination.limit, searchQuery]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await driverService.getDrivers(
        pagination.page, 
        pagination.limit, 
        searchQuery
      );
      
      if (response.success) {
        setDrivers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        }));
      }
    } catch (error) {
      toast.error('Failed to load drivers');
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await driverService.getDriverStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateDriver = async (data: CreateDriverData) => {
    try {
      const response = await driverService.createDriver(data);
      if (response.success) {
        toast.success('Driver created successfully');
        setShowCreateModal(false);
        loadDrivers();
        loadStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create driver');
    }
  };

  const handleUpdateDriver = async (id: number, data: UpdateDriverData) => {
    try {
      const response = await driverService.updateDriver(id, data);
      if (response.success) {
        toast.success('Driver updated successfully');
        setShowEditModal(false);
        setSelectedDriver(null);
        loadDrivers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update driver');
    }
  };

  const handleDeleteDriver = async (id: number) => {
    if (!confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      const response = await driverService.deleteDriver(id);
      if (response.success) {
        toast.success('Driver deleted successfully');
        loadDrivers();
        loadStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete driver');
    }
  };

  const handleAssignVehicles = async (driverId: number, vehicleIds: number[]) => {
    try {
      const response = await driverService.assignVehicles(driverId, vehicleIds);
      if (response.success) {
        toast.success('Vehicles assigned successfully');
        setShowAssignModal(false);
        setSelectedDriver(null);
        loadDrivers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign vehicles');
    }
  };

  const handleStatusChange = async (driverId: number, isAvailable: boolean, reason?: string) => {
    try {
      const response = await driverService.updateDriverStatus(driverId, isAvailable, reason);
      if (response.success) {
        toast.success(`Driver ${isAvailable ? 'activated' : 'deactivated'} successfully`);
        loadDrivers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update driver status');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = () => {
    toast.success('Exporting driver data...');
    // Implement export functionality
  };

  const handleImport = () => {
    toast.success('Import functionality coming soon');
    // Implement import functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
            </div>
            <p className="text-gray-600">Manage your fleet drivers, assignments, and monitor performance</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Driver
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && <DriverStatsCards stats={stats} />}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers by name, email, phone, or license..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <select className="px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="available">Available Now</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <DriverTable
        drivers={drivers}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={(driver) => {
          setSelectedDriver(driver);
          setShowEditModal(true);
        }}
        onView={(driver) => {
          setSelectedDriver(driver);
          setShowDetailsModal(true);
        }}
        onDelete={handleDeleteDriver}
        onAssignVehicles={(driver) => {
          setSelectedDriver(driver);
          setShowAssignModal(true);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateDriverModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDriver}
        />
      )}

      {showEditModal && selectedDriver && (
        <EditDriverModal
          driver={selectedDriver}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDriver(null);
          }}
          onSubmit={(data) => handleUpdateDriver(selectedDriver.id, data)}
        />
      )}

      {showDetailsModal && selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDriver(null);
          }}
        />
      )}

      {showAssignModal && selectedDriver && (
        <AssignVehiclesModal
          driver={selectedDriver}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedDriver(null);
          }}
          onSubmit={(vehicleIds) => handleAssignVehicles(selectedDriver.id, vehicleIds)}
        />
      )}
    </div>
  );
};

export default DriverManagement;