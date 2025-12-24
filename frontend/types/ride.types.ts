export interface Ride {
  id: number;
  customerId: number;
  driverId: number;
  pickupAddress: string;
  dropoffAddress: string;
  serviceType: 'MEDICAL' | 'GENERAL';
  status: 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'DRIVER_EN_ROUTE' | 'PICKUP_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  actualPickupAt?: string;
  actualDropoffAt?: string;
  passengerName: string;
  passengerPhone: string;
  specialNeeds?: string;
  additionalNotes?: string;
  basePrice: number;
  finalPrice?: number;
  isGuest: boolean;
  distance?: number;
  duration?: number;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
  payment?: {
    status: string;
    amount: number;
    method: string;
  };
}

export interface RideStatusUpdate {
  rideId: number;
  status: Ride['status'];
  estimatedArrivalMinutes?: number;
}