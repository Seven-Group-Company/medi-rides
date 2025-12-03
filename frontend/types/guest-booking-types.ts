import { ServiceCategory } from "@/services/guest-booking.service";

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface FormData {
  passengerName: string;
  passengerPhone: string;
  pickup: Location | null;
  dropoff: Location | null;
  serviceType: string;
  serviceCategoryId: number;
  date: string;
  time: string;
  notes: string;
  distanceKm?: number;
  estimatedTime?: number;
  estimatedPrice?: number;
}

export interface BookingStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onPrev?: () => void;
  categories: ServiceCategory[];
  setEstimatedPrice?: (price: number | null) => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  onReview?: () => void; // Added for review step
}

export interface BookingSummary {
  id: string;
  pickup: string;
  dropoff: string;
  serviceType: string;
  date: string;
  time: string;
  passengerName: string;
  categories: ServiceCategory[];
  passengerPhone: string;
  distanceKm?: number;
  estimatedTime?: number;
  estimatedPrice?: number;
}