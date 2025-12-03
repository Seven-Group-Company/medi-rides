export interface ServiceCategory {
  id: number;
  name: string;
  value: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  basePrice: number;
  pricePerMile: number;
  serviceType: 'MEDICAL' | 'GENERAL';
}

export interface CreateGuestRideDto {
  passengerName: string;
  passengerPhone: string;
  pickup: string;
  dropoff: string;
  serviceType: string; // Simple string
  serviceCategoryId: number;
  date: string;
  time: string;
  notes?: string;
  distanceKm?: number;
  estimatedTime?: number;
}

export interface GuestRideResponse {
  id: number;
  pickup: string;
  dropoff: string;
  serviceType: string;
  date: string;
  time: string;
  notes?: string;
  distanceKm?: number;
  estimatedTime?: number;
  status: string;
  passengerName: string;
  passengerPhone: string;
  basePrice: number;
  scheduledAt: string;
  createdAt: string;
  isGuest: boolean;
}

export class GuestBookingService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

  static async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/public/service-categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch service categories: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  }

  static async createGuestRide(rideData: CreateGuestRideDto): Promise<GuestRideResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/public/rides/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Failed to create ride: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating guest ride:', error);
      throw error;
    }
  }

  static async calculateEstimatedPrice(
    serviceCategoryId: number,
    distanceKm: number,
    date: string,
    time: string
  ): Promise<number> {
    try {
      // Convert distance to miles
      const distanceMiles = distanceKm * 0.621371;
      
      // Get scheduled time
      const scheduledDateTime = new Date(`${date}T${time}`);
      const hour = scheduledDateTime.getHours();
      
      // Get service category to determine service type
      const categories = await this.getServiceCategories();
      const serviceCategory = categories.find(cat => cat.id === serviceCategoryId);
      
      if (!serviceCategory) {
        throw new Error('Service category not found');
      }

      // Determine time period
      const isDayTime = hour >= 6 && hour < 18;
      const isEvening = hour >= 18 && hour <= 23;
      const isLateNight = hour >= 0 && hour < 6;
      
      const isWheelchair = serviceCategory.name.toLowerCase().includes('wheelchair');

      let price: number;

      if (isDayTime) {
        if (distanceMiles <= 5) {
          price = isWheelchair ? 30 : 20;
        } else if (distanceMiles <= 10) {
          price = isWheelchair ? 40 : 30;
        } else if (distanceMiles <= 20) {
          price = isWheelchair ? 50 : 40;
        } else if (distanceMiles <= 50) {
          price = isWheelchair ? 85 : 75;
        } else {
          const baseRate = isWheelchair ? 85 : 75;
          const additionalMiles = distanceMiles - 50;
          const perMileRate = isWheelchair ? 2.5 : 2.0;
          price = baseRate + (additionalMiles * perMileRate);
        }
      } else if (isEvening) {
        if (distanceMiles <= 5) {
          price = isWheelchair ? 40 : 30;
        } else if (distanceMiles <= 10) {
          price = isWheelchair ? 50 : 40;
        } else if (distanceMiles <= 20) {
          price = isWheelchair ? 60 : 50;
        } else if (distanceMiles <= 50) {
          price = isWheelchair ? 105 : 85;
        } else {
          const baseRate = isWheelchair ? 105 : 85;
          const additionalMiles = distanceMiles - 50;
          const perMileRate = isWheelchair ? 3.0 : 2.5;
          price = baseRate + (additionalMiles * perMileRate);
        }
      } else {
        if (distanceMiles <= 5) {
          price = isWheelchair ? 40 : 30;
        } else if (distanceMiles <= 10) {
          price = isWheelchair ? 50 : 40;
        } else if (distanceMiles <= 20) {
          price = isWheelchair ? 60 : 50;
        } else if (distanceMiles <= 50) {
          price = isWheelchair ? 105 : 85;
        } else {
          const baseRate = isWheelchair ? 105 : 85;
          const additionalMiles = distanceMiles - 50;
          const perMileRate = isWheelchair ? 3.0 : 2.5;
          price = baseRate + (additionalMiles * perMileRate);
        }
      }

      return parseFloat(price.toFixed(2));
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  }
}