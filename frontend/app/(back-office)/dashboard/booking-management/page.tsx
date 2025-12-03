'use client';

import { motion } from 'framer-motion';
import { Users, Car, CheckCircle, UserCheck, Car as CarIcon } from 'lucide-react';
import { useAdminBookingManagement } from '@/hooks/useAdminBookingManagement';
import CustomerManagement from '@/components/dashboard/admin/rides/customer-management';
import RideManagement from '@/components/dashboard/admin/rides/ride-management';

export default function AdminBookingManagementPage() {
  const {
    // State
    activeTab,
    setActiveTab,
    customers,
    rideRequests,
    drivers,
    vehicles,
    loading,
    
    // Customer filters
    customerSearch,
    setCustomerSearch,
    customerStatusFilter,
    setCustomerStatusFilter,
    
    // Ride filters
    rideSearch,
    setRideSearch,
    rideStatusFilter,
    setRideStatusFilter,
    
    // Actions
    approveRide,
    declineRide,
    assignDriverAndVehicle,
    updateCustomerStatus,
    
    // Stats
    stats,

    completeRide,

  } = useAdminBookingManagement();

  const tabs = [
    { id: 'rides' as const, name: 'Ride Management', icon: Car, count: stats.totalRides },
    { id: 'customers' as const, name: 'Customer Management', icon: Users, count: stats.totalCustomers },
  ];

  const statsCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      change: '+8%',
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Rides',
      value: stats.pendingRides,
      change: '+5',
      icon: CarIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Available Drivers',
      value: stats.availableDrivers,
      change: '3 available',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Available Vehicles',
      value: stats.availableVehicles,
      change: '4 available',
      icon: Car,
      color: 'bg-indigo-500',
    },
    {
      title: 'Completed Rides',
      value: stats.completedRides,
      change: '+23%',
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">
            Manage ride requests, customer profiles, and driver assignments
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
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
                    <p className="text-xs text-green-600 font-medium mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                    <span className="bg-gray-100 text-gray-900 text-xs font-medium px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'customers' && (
              <CustomerManagement
                customers={customers}
                search={customerSearch}
                onSearchChange={setCustomerSearch}
                statusFilter={customerStatusFilter}
                onStatusFilterChange={setCustomerStatusFilter}
                onUpdateCustomerStatus={updateCustomerStatus}
              />
            )}

            {activeTab === 'rides' && (
              <RideManagement
                rideRequests={rideRequests}
                drivers={drivers}
                vehicles={vehicles}
                search={rideSearch}
                onSearchChange={setRideSearch}
                statusFilter={rideStatusFilter}
                onStatusFilterChange={setRideStatusFilter}
                onApproveRide={approveRide}
                onDeclineRide={declineRide}
                onAssignDriverAndVehicle={assignDriverAndVehicle}
                onCompleteRide={completeRide}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}