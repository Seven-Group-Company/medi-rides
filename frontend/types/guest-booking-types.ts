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
  date: string;
  time: string;
  notes: string;
  distanceKm?: number;
  estimatedTime?: number;
  paymentType: 'private' | 'waiver';
}

export interface BookingStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onPrev?: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  onReview?: () => void;
}

export interface BookingSummary {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengerName: string;
  passengerPhone: string;
  distanceMiles?: number;
  estimatedTime?: number;
  paymentType: string;
  waiverNumber?: string;
}