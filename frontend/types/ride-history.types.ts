export interface RideHistory {
  id: number;
  pickup: string;
  dropoff: string;
  serviceType: string;
  scheduledAt: string;
  status: RideStatus;
  driver: {
    name: string;
    phone: string;
    vehicle: string;
  } | null;
  payment: {
    status: string;
    amount: number;
  } | null;
  distance: number | null;
  duration: number | null;
  finalPrice: number | null;
  passengerName?: string;
  customer?: string;
  basePrice?: number;
  name?: string;

  customerId?: number;

    invoice?: {
    id: number;
    pdfUrl?: string;
    invoiceNumber?: string;
  };
}

export type RideStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'CONFIRMED'
  | 'DRIVER_EN_ROUTE'
  | 'PICKUP_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface RideHistoryFilters {
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  serviceType: string;
}