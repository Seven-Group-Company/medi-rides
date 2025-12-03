"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Clock, MapPin, User, Car, DollarSign, 
  CheckCircle, XCircle, FileText, CheckCheck, Loader2 
} from 'lucide-react';
import { RideRequest, Driver, Vehicle } from '@/types/admin.types';

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
  onCompleteRide?: (rideId: number) => Promise<{ success: boolean; error?: string }>; // Add this
}

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
  onCompleteRide, // Add this
}: RideManagementProps) {
  const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false); // Add this
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'decline' | 'assign' | 'complete' | null>(null); // Track action type

  const filteredRides = rideRequests.filter(ride => {
    const matchesSearch = 
      ride.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
      ride.dropoffAddress.toLowerCase().includes(search.toLowerCase()) ||
      (ride.customer?.name?.toLowerCase().includes(search.toLowerCase()) || 
       ride.passengerName?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
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
  };

  const handleDecline = async () => {
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
  };

  const handleAssign = async () => {
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
  };

  const handleComplete = async () => {
    if (!selectedRide || !onCompleteRide) return;
    
    setLoading(true);
    setActionType('complete');
    const result = await onCompleteRide(selectedRide.id);
    setLoading(false);
    setActionType(null);
    
    if (result.success) {
      setShowCompleteModal(false);
      setSelectedRide(null);
    }
  };

  const availableDrivers = drivers.filter(driver => 
    driver.driverProfile.isAvailable && driver.isActive
  );
  const availableVehicles = vehicles.filter(vehicle => 
    vehicle.status === 'AVAILABLE'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

const handleDownloadInvoice = async (invoiceId: number, pdfUrl?: string) => {
  try {
    const token = localStorage.getItem('access_token');
    
    // If no pdfUrl, try to regenerate it first
    if (!pdfUrl) {
      const regenerateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/regenerate-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (regenerateResponse.ok) {
        const regenerateData = await regenerateResponse.json();
        pdfUrl = regenerateData.data.pdfUrl;
      }
    }
    
    // If we have pdfUrl now, download it
    if (pdfUrl) {
      const fullUrl = pdfUrl.startsWith('http') 
        ? pdfUrl 
        : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`;
      
      window.open(fullUrl, '_blank');
      return;
    }
    
    throw new Error('Unable to generate or retrieve invoice PDF');
  } catch (error) {
    console.error('Error downloading invoice:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to download invoice';
    
    alert(`Unable to download invoice: ${errorMessage}\n\nPlease contact support if this issue persists.`);
  }
};

const renderInvoiceButton = (ride: RideRequest) => {
  if (ride.status !== 'COMPLETED') return null;
  
  if (ride.invoice && ride.invoice.id) {
    return (
      <button
        onClick={() => handleDownloadInvoice(ride.invoice!.id, ride.invoice!.pdfUrl)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        title={ride.invoice.pdfUrl ? "Download Invoice" : "Generate & Download Invoice"}
      >
        <FileText className="w-4 h-4" />
        {ride.invoice.pdfUrl ? "Download" : "Generate"} Invoice
      </button>
    );
  }
    
return (
   <button
      onClick={async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('access_token');
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/invoices/ride/${ride.id}/generate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            alert('Invoice generated successfully!');
            // Download immediately if PDF is available
            if (data.data.pdfUrl) {
              handleDownloadInvoice(data.data.id, data.data.pdfUrl);
            }
            window.location.reload();
          } else {
            throw new Error('Failed to generate invoice');
          }
        } catch (error) {
          console.error('Error generating invoice:', error);
          alert('Failed to generate invoice. Please try again.');
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      disabled={loading}
    >
      <FileText className="w-4 h-4" />
      Generate Invoice
    </button>
  );
};

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rides by address or customer..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredRides.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No rides found</h3>
            <p className="mt-2 text-gray-500">
              {rideRequests.length === 0 ? 'No ride requests yet.' : 'No rides match your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRides.map((ride) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Ride Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ride #{ride.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ride.status)}`}>
                        {ride.status.replace('_', ' ')}
                      </span>
                      {ride.isGuest && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Guest
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pickup</p>
                          <p className="text-sm text-gray-600">{ride.pickupAddress}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Dropoff</p>
                          <p className="text-sm text-gray-600">{ride.dropoffAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Passenger:</span>
                        <span>{ride.customer?.name || ride.passengerName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{new Date(ride.scheduledAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>${ride.finalPrice || ride.basePrice || 0}</span>
                      </div>
                    </div>

                    {ride.additionalNotes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <p className="font-medium">Notes:</p>
                        <p>{ride.additionalNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {ride.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRide(ride);
                            setShowApproveModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRide(ride);
                            setShowDeclineModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </>
                    )}

                    {ride.status === 'CONFIRMED' && (
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setShowAssignModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Car className="w-4 h-4" />
                        Assign Driver
                      </button>
                    )}

                    {(ride.status === 'ASSIGNED' || ride.status === 'IN_PROGRESS') && onCompleteRide && (
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setShowCompleteModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Complete Ride
                      </button>
                    )}

                    {renderInvoiceButton(ride)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                onClick={handleApprove}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                onClick={handleDecline}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                  {availableDrivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.driverProfile.licenseNumber}
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
                  {availableVehicles.map(vehicle => (
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
                onClick={handleAssign}
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

      {/* Complete Ride Modal */}
      {showCompleteModal && selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Complete Ride #{selectedRide.id}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Completing this ride will:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc pl-5">
                  <li>Mark the ride as COMPLETED</li>
                  <li>Generate an invoice automatically</li>
                  <li>Send notification to the customer</li>
                  <li>Make the vehicle available again</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Notes (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any final notes about the ride completion..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading && actionType === 'complete' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Complete Ride
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}