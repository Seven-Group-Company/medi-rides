'use client';

import { motion } from 'framer-motion';
import { 
  X, User, Car, MapPin, Clock, Calendar, DollarSign, 
  FileText, Phone, Shield, Ruler, Users,
  CheckCircle, XCircle, AlertCircle, Navigation, Package,
  Stethoscope, Ambulance, Heart,
  Mail,
  FerrisWheel
} from 'lucide-react';
import { RideRequest } from '@/types/admin.types';

interface RideDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideRequest | null;
  rejectRide?: (value: boolean) => void;
}

const RideDetailsModal = ({ isOpen, onClose, ride, rejectRide }: RideDetailsModalProps) => {
  if (!isOpen || !ride) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'ASSIGNED': return <Car className="w-4 h-4 text-purple-600" />;
      case 'DRIVER_EN_ROUTE': return <Navigation className="w-4 h-4 text-orange-600" />;
      case 'PICKUP_ARRIVED': return <MapPin className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS': return <Package className="w-4 h-4 text-indigo-600" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'NO_SHOW': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'MEDICAL': return <Stethoscope className="w-4 h-4 text-red-500" />;
      case 'GENERAL': return <Car className="w-4 h-4 text-blue-500" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getVehicleTypeIcon = (type?: string) => {
    if (!type) return <Car className="w-4 h-4" />;
    switch (type) {
      case 'SEDAN': return <Car className="w-4 h-4" />;
      case 'SUV': return <Car className="w-4 h-4" />;
      case 'VAN': return <Users className="w-4 h-4" />;
      case 'WHEELCHAIR_VAN': return <FerrisWheel className="w-4 h-4 text-green-600" />;
      case 'STRETCHER_VAN': return <Ambulance className="w-4 h-4 text-red-600" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'private': return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'waiver': return <Shield className="w-4 h-4 text-green-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
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
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ride Details</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-semibold text-gray-700">#{ride.id}</span>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(ride.status)}`}>
                {getStatusIcon(ride.status)}
                <span className="text-sm font-medium">{ride.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getServiceTypeIcon(ride.serviceType)}
                <span>{ride.serviceType}</span>
              </div>
              {ride.isGuest && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  Guest Ride
                </span>
              )}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              {getPaymentTypeIcon(ride.paymentType)}
              <span className="font-medium text-gray-900 capitalize">{ride.paymentType}</span>
            </div>
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
          {/* Customer & Driver Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              
              {ride.customer ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {ride.customer.avatar ? (
                      <img
                        src={ride.customer.avatar}
                        alt={ride.customer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{ride.customer.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {ride.customer.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {ride.customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${ride.customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {ride.customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {ride.customer.isVerified && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Total Rides</p>
                      <p className="font-semibold">{ride.customer.totalRides}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed Rides</p>
                      <p className="font-semibold">{ride.customer.completedRides}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-semibold">{new Date(ride.customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{ride.passengerName}</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4" />
                        {ride.passengerPhone}
                      </div>
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Guest Passenger
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {ride.specialNeeds && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Special Needs</p>
                      <p className="text-sm text-gray-600">{ride.specialNeeds}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Driver & Vehicle Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5" />
                Driver & Vehicle
              </h3>
              
              {ride.driver ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {ride.driver.avatar ? (
                      <img
                        src={ride.driver.avatar}
                        alt={ride.driver.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{ride.driver.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Phone className="w-4 h-4" />
                            {ride.driver.phone}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          License: {ride.driver.driverProfile.licenseNumber}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${ride.driver.driverProfile.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {ride.driver.driverProfile.isAvailable ? 'Available' : 'Busy'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {ride.driver.driverProfile.totalTrips} trips
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle Information */}
                  {ride.driver.driverProfile.vehicles[0] && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          {getVehicleTypeIcon(ride.driver.driverProfile.vehicles[0].type)}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {ride.driver.driverProfile.vehicles[0].make} {ride.driver.driverProfile.vehicles[0].model} ({ride.driver.driverProfile.vehicles[0].year})
                          </h5>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>{ride.driver.driverProfile.vehicles[0].licensePlate}</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {ride.driver.driverProfile.vehicles[0].capacity} seats
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {ride.driver.driverProfile.vehicles[0].hasWheelchairAccess && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                                <FerrisWheel className="w-3 h-3" />
                                Wheelchair
                              </span>
                            )}
                            {ride.driver.driverProfile.vehicles[0].hasOxygenSupport && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                Oxygen
                              </span>
                            )}
{ride.driver?.driverProfile?.vehicles?.[0]?.status && (
  <span className={`px-2 py-1 text-xs rounded-full ${
    ride.driver.driverProfile.vehicles[0].status === 'AVAILABLE' 
      ? 'bg-green-100 text-green-800'
      : ride.driver.driverProfile.vehicles[0].status === 'IN_USE'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800'
  }`}>
    {ride.driver.driverProfile.vehicles[0].status.replace('_', ' ')}
  </span>
)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No driver assigned yet</p>
                  <p className="text-sm text-gray-500 mt-1">This ride is waiting for driver assignment</p>
                </div>
              )}
            </div>
          </div>

          {/* Ride Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Route Information */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Route Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pickup Address</p>
                      <p className="text-gray-700">{ride.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dropoff Address</p>
                      <p className="text-gray-700">{ride.dropoffAddress}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="font-semibold">{ride.distance ? `${ride.distance} miles` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{ride.duration ? `${ride.duration} mins` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timing Information */}
            <div className="bg-yellow-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timing Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Scheduled Time</p>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(ride.scheduledAt)}
                    </div>
                  </div>
                  
                  {ride.actualPickupAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Actual Pickup Time</p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(ride.actualPickupAt)}
                      </div>
                    </div>
                  )}
                  
                  {ride.actualDropoffAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Actual Dropoff Time</p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(ride.actualDropoffAt)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-yellow-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-semibold text-sm">{formatDateTime(ride.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold text-sm">{formatDateTime(ride.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="text-xl font-bold text-gray-900">${ride.basePrice.toFixed(2)}</p>
                  </div>
                  
                  {ride.finalPrice && ride.finalPrice !== ride.basePrice && (
                    <div>
                      <p className="text-sm text-gray-600">Final Price</p>
                      <p className="text-2xl font-bold text-green-700">${ride.finalPrice.toFixed(2)}</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-green-200">
                  {ride.invoice ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Invoice Status</span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Generated
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (ride.invoice?.pdfUrl) {
                            const fullUrl = ride.invoice.pdfUrl.startsWith('http')
                              ? ride.invoice.pdfUrl
                              : `${process.env.NEXT_PUBLIC_API_URL}${ride.invoice.pdfUrl}`;
                            window.open(fullUrl, '_blank');
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View Invoice
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600">No invoice generated yet</p>
                      <p className="text-xs text-gray-500 mt-1">Invoice will be created upon completion</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Additional Information */}
          {(ride.additionalNotes || ride.specialNeeds || ride.adminNotes) && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ride.additionalNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Passenger Notes
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700">{ride.additionalNotes}</p>
                    </div>
                  </div>
                )}
                
                {ride.specialNeeds && !ride.customer && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Special Needs
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700">{ride.specialNeeds}</p>
                    </div>
                  </div>
                )}
                
                {ride.adminNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin Notes
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 bg-yellow-50">
                      <p className="text-sm text-gray-700">{ride.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getServiceTypeIcon(ride.serviceType)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="font-semibold">{ride.serviceType}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Ruler className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-semibold">{ride.distance ? `${ride.distance} mi` : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{ride.duration ? `${ride.duration} min` : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-semibold">${ride.finalPrice ? ride.finalPrice.toFixed(2) : ride.basePrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
            <button 
              onClick={() => rejectRide && rejectRide(true)}
              className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition-colors duration-200"
            >
                Reject Ride
            </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
          >
            Close
          </button>
          {ride.invoice?.pdfUrl && (
            <a
              href={ride.invoice.pdfUrl.startsWith('http')
                ? ride.invoice.pdfUrl
                : `${process.env.NEXT_PUBLIC_API_URL}${ride.invoice.pdfUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Invoice
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function for status colors (you might want to move this to a utils file)
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

export default RideDetailsModal;