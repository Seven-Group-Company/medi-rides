export interface Location {
  address: string;
  lat: number;
  lng: number;
}
export interface BookingFormData {
  pickup: any | null;
  dropoff: any | null;
  serviceType: string;
  serviceCategoryId: number | null;
  serviceName: string;
  serviceIcon: string;
  date: string;
  time: string;
  notes: string;
  chargeOption: string; // 'private', 'ALI', 'APDD', 'IDD', 'ISW'
  distanceKm: number; // Backend expects km
  estimatedTime: number;
}


export interface CreateRideDto {
  pickup: string;
  dropoff: string;
  serviceType: string;
  serviceCategoryId: number;
  date: string;
  time: string;
  notes?: string;
  chargeOption?: string;
  distanceMiles?: number;
  distanceKm?: number; // Keep for backend compatibility
  estimatedTime?: number;
  estimatedPrice?: number;
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