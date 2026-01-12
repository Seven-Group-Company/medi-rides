export interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  role: 'CUSTOMER';
  createdAt: string;
  lastLoginAt?: string;
  totalRides: number;
  completedRides: number;
}

export interface RideRequest {
  id: number;
  customerId?: number;
  customer?: Customer;
  driverId?: number;
  driver?: Driver;
  paymentType: 'private' | 'waiver';
  
  // Ride details
  pickupAddress: string;
  dropoffAddress: string;
  serviceType: 'MEDICAL' | 'GENERAL';
  status: 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'DRIVER_EN_ROUTE' | 'PICKUP_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  
  // Scheduling
  scheduledAt: string;
  actualPickupAt?: string;
  actualDropoffAt?: string;
  
  // Passenger information
  passengerName: string;
  passengerPhone: string;
  specialNeeds?: string;
  additionalNotes?: string;

  // Pricing
  basePrice: number;
  distance?: number;
  duration?: number;
  finalPrice?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Admin
  adminNotes?: string;

  invoice?: {
    id: number;
    pdfUrl: string;
  };

  isGuest?: boolean;
}

export interface Driver {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  totalRides: number;
  completedRides: number;
  rating?: number;
  vehicle?: Vehicle;
  isVerified: boolean;
  isActive: boolean;
  role: 'DRIVER';
  createdAt: string;
  lastLoginAt?: string;
  driverProfile: {
    id: number;
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: string;
    isAvailable: boolean;
    rating?: number;
    totalTrips: number;
    vehicles: Vehicle[];
  };
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: 'SEDAN' | 'SUV' | 'VAN' | 'WHEELCHAIR_VAN' | 'STRETCHER_VAN';
  capacity: number;
  hasWheelchairAccess: boolean;
  hasOxygenSupport: boolean;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  images: string[];
  driver?: Driver;
}

export interface AdminRideRequest extends RideRequest {
  customer?: Customer;
  driver?: Driver;
}