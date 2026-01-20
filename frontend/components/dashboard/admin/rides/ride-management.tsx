"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Clock, User, Car, DollarSign, 
  CheckCircle, XCircle, CheckCheck, Loader2,
  ChevronLeft, ChevronRight, Eye, ArrowUpDown, Calendar,
} from 'lucide-react';
import { RideRequest, Driver, Vehicle } from '@/types/admin.types';
import RideDetailsModal from './ride-details-modal';

interface RideManagementProps {
  rideRequests: RideRequest[];
  drivers: Driver[];
  vehicles: Vehicle[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onApproveRide: (rideId: number, price: number, note?: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineRide: (rideId: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  onAssignDriverAndVehicle: (rideId: number, driverId: number, vehicleId: number) => Promise<{ success: boolean; error?: string }>;
  onCompleteRide?: (rideId: number) => Promise<{ success: boolean; error?: string }>;
}

type SortField = 'id' | 'scheduledAt' | 'finalPrice' | 'status';
type SortDirection = 'asc' | 'desc';

export default function RideManagement({
  rideRequests,
  drivers,
  vehicles,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onApproveRide,
  onDeclineRide,
  onAssignDriverAndVehicle,
  onCompleteRide,
}: RideManagementProps) {
  const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'decline' | 'assign' | 'complete' | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('scheduledAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter rides
  const filteredRides = rideRequests.filter(ride => {
    const matchesSearch = 
      ride.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
      ride.dropoffAddress.toLowerCase().includes(search.toLowerCase()) ||
      (ride.customer?.name?.toLowerCase().includes(search.toLowerCase()) || 
       ride.passengerName?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort rides
  const sortedRides = [...filteredRides].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'scheduledAt':
        aValue = new Date(a.scheduledAt).getTime();
        bValue = new Date(b.scheduledAt).getTime();
        break;
      case 'finalPrice':
        aValue = a.finalPrice || 0;
        bValue = b.finalPrice || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedRides.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRides = sortedRides.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ASSIGNED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DRIVER_EN_ROUTE': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PICKUP_ARRIVED': return 'bg-green-50 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      case 'NO_SHOW': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'ASSIGNED': return <Car className="w-4 h-4" />;
      case 'DRIVER_EN_ROUTE': return <Clock className="w-4 h-4" />;
      case 'PICKUP_ARRIVED': return <CheckCircle className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'COMPLETED': return <CheckCheck className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'NO_SHOW': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredRides.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredRides.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredRides.filter(r => 
                  r.status === 'IN_PROGRESS' || 
                  r.status === 'DRIVER_EN_ROUTE' || 
                  r.status === 'PICKUP_ARRIVED'
                ).length}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Loader2 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredRides.filter(r => r.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rides by address, customer, or ID..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="DRIVER_EN_ROUTE">Driver En Route</option>
                <option value="PICKUP_ARRIVED">Pickup Arrived</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
            <div className="col-span-2">
              <button 
                onClick={() => handleSort('id')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Ride ID
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-3">
              <button 
                onClick={() => handleSort('scheduledAt')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-3">Route</div>
            <div className="col-span-1">
              <button 
                onClick={() => handleSort('finalPrice')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                <DollarSign className="w-4 h-4" />
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-1">
              <button 
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Status
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        {paginatedRides.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No rides found</h3>
            <p className="mt-2 text-gray-500">
              {rideRequests.length === 0 ? 'No ride requests yet.' : 'No rides match your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginatedRides.map((ride) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Ride ID */}
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <p>#{ride.id}</p>
                      <p className='font-medium bg-gray-100 rounded px-2 py-1'>{ride.paymentType}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ride.customer?.name || ride.passengerName || 'Guest'}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="col-span-3">
                    <div className="text-sm text-gray-900">
                      {new Date(ride.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(ride.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Route */}
                  <div className="col-span-3">
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="font-medium text-gray-900 text-sm truncate max-w-[150px]">{ride.pickupAddress}</div>
                        <div className="font-medium text-gray-900 text-sm truncate max-w-[150px]">{ride.dropoffAddress}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">${ride.finalPrice}</span>
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="col-span-1">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(ride.status)}`}>
                      {getStatusIcon(ride.status)}
                      <span className="hidden sm:inline">
                        {ride.status === 'DRIVER_EN_ROUTE' ? 'En Route' : 
                         ride.status === 'PICKUP_ARRIVED' ? 'Arrived' :
                         ride.status === 'IN_PROGRESS' ? 'In Progress' :
                         ride.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {ride.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedRide(ride);
                            setShowApproveModal(true);
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>

                      )}

                      {ride.status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            setSelectedRide(ride);
                            setShowAssignModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Assign
                        </button>
                      )}

                      {(ride.status === 'ASSIGNED' || ride.status === 'IN_PROGRESS' || 
                        ride.status === 'DRIVER_EN_ROUTE' || ride.status === 'PICKUP_ARRIVED') && 
                        onCompleteRide && (
                        <button
                          onClick={() => {
                            setSelectedRide(ride);
                            setShowCompleteModal(true);
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredRides.length)}</span> of{' '}
                <span className="font-medium">{filteredRides.length}</span> rides
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ride Details Modal */}
      <RideDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        ride={selectedRide}
        rejectRide={setShowDeclineModal}
      />

      {/* Approve Modal */}
      {showApproveModal && selectedRide && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Approve Ride #{selectedRide.id}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a note for the customer..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedRide || !price) return;
                  setLoading(true);
                  setActionType('approve');
                  const result = await onApproveRide(selectedRide.id, parseFloat(price), note);
                  setLoading(false);
                  setActionType(null);
                  if (result.success) {
                    setShowApproveModal(false);
                    setPrice('');
                    setNote('');
                    setSelectedRide(null);
                  }
                }}
                disabled={!price || loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading && actionType === 'approve' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Approving...
                  </>
                ) : (
                  'Approve Ride'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedRide && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Decline Ride #{selectedRide.id}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Decline
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain why this ride is being declined..."
                required
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedRide || !note) return;
                  setLoading(true);
                  setActionType('decline');
                  const result = await onDeclineRide(selectedRide.id, note);
                  setLoading(false);
                  setActionType(null);
                  if (result.success) {
                    setShowDeclineModal(false);
                    setNote('');
                    setSelectedRide(null);
                  }
                }}
                disabled={!note || loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading && actionType === 'decline' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Declining...
                  </>
                ) : (
                  'Decline Ride'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedRide && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Driver to Ride #{selectedRide.id}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Driver
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a driver</option>
                  {drivers.filter(driver => 
                    driver.driverProfile?.isAvailable && driver.isActive
                  ).map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.driverProfile?.licenseNumber}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vehicle
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a vehicle</option>
                  {vehicles.filter(vehicle => 
                    vehicle.status === 'AVAILABLE'
                  ).map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedRide || !selectedDriver || !selectedVehicle) return;
                  setLoading(true);
                  setActionType('assign');
                  const result = await onAssignDriverAndVehicle(
                    selectedRide.id,
                    parseInt(selectedDriver),
                    parseInt(selectedVehicle)
                  );
                  setLoading(false);
                  setActionType(null);
                  if (result.success) {
                    setShowAssignModal(false);
                    setSelectedDriver('');
                    setSelectedVehicle('');
                    setSelectedRide(null);
                  }
                }}
                disabled={!selectedDriver || !selectedVehicle || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading && actionType === 'assign' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  'Assign Driver'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}