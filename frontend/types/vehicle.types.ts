export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin?: string;
  type: string; // Change from type to type (but it was already type in your Vehicle interface)
  capacity: number;
  hasWheelchairAccess: boolean;
  hasOxygenSupport: boolean;
  insuranceExpiry: string;
  registrationExpiry: string;
  liabilityInsuranceExpiry: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleData {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin?: string;
  type: string; // Change from vehicleType to type
  capacity: number;
  hasWheelchairAccess: boolean;
  hasOxygenSupport: boolean;
  insuranceExpiry: string;
  registrationExpiry: string;
  liabilityInsuranceExpiry: string;
  driverId?: number;
  images?: string[];
}

export interface UpdateVehicleData {
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  type?: string; // For CreateVehicleDto
  vehicleType?: string; // For UpdateVehicleDto - match backend DTO
  capacity?: number;
  hasWheelchairAccess?: boolean;
  hasOxygenSupport?: boolean;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  liabilityInsuranceExpiry?: string;
  driverId?: number;
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  images?: string[];
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  licenseState?: string;
}

export interface VehicleStats {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  byType: Record<string, number>;
}