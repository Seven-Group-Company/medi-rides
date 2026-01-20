export type DriverWithProfile = {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  createdAt: Date;
  lastLoginAt?: Date;
  driverProfile: {
    id: number;
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: Date;
    vehicleInfo?: string;
    insuranceInfo?: string;
    isAvailable: boolean;
    rating?: number;
    totalTrips: number;
    vehicles: Array<{
      id: number;
      make: string;
      model: string;
      year: number;
      licensePlate: string;
      type: string;
      status: string;
    }>;
  } | null;
};

export type DriverStats = {
  totalDrivers: number;
  activeDrivers: number;
  availableDrivers: number;
  onTripDrivers: number;
  averageRating: number;
};

export type DriverListResponse = {
  success: boolean;
  data: DriverWithProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type DriverResponse = {
  success: boolean;
  message: string;
  data: DriverWithProfile;
};