export interface Driver {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
  driverProfile: DriverProfile | null;
}

export interface DriverProfile {
  id: number;
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  vehicleInfo?: string;
  insuranceInfo?: string;
  isAvailable: boolean;
  rating?: number;
  totalTrips: number;
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: string; // Changed from VehicleType enum to string to match backend
  status: string; // Changed from VehicleStatus enum to string to match backend
  capacity: number;
  hasWheelchairAccess: boolean;
  hasOxygenSupport: boolean;
  images: string[];
  // Add any additional fields that come from the backend
  color?: string;
  vin?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverStats {
  totalDrivers: number;
  activeDrivers: number;
  availableDrivers: number;
  onTripDrivers: number;
  averageRating: number;
}

export interface CreateDriverData {
  email: string;
  name: string;
  phone: string;
  password: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  vehicleInfo?: string;
  insuranceInfo?: string;
  vehicleIds?: number[];
  isAvailable?: boolean;
  avatar?: string;
}

export interface UpdateDriverData {
  name?: string;
  phone?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: string;
  vehicleInfo?: string;
  insuranceInfo?: string;
  vehicleIds?: number[];
  isAvailable?: boolean;
  avatar?: string;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER'
}

export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  VAN = 'VAN',
  WHEELCHAIR_VAN = 'WHEELCHAIR_VAN',
  STRETCHER_VAN = 'STRETCHER_VAN'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE'
}
