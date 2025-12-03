export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface BookingFormData {
  pickup: Location | null;
  dropoff: Location | null;
  serviceType: string;
  serviceCategoryId: number | null;
  date: string;
  time: string;
  notes: string;
  distanceKm?: number;
  estimatedTime?: number;
}

export interface CreateRideDto {
  pickup: string;
  dropoff: string;
  serviceType: string;
  serviceCategoryId: number;
  date: string;
  time: string;
  notes?: string;
  distanceKm?: number;
  estimatedTime?: number;
}

export interface BookingStepProps {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
  serviceCategories?: any[];
  isLoadingCategories?: boolean;
  onNext?: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}