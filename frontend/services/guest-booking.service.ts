export interface CreateGuestRideDto {
  passengerName: string;
  passengerPhone: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  notes?: string;
  distanceKm?: number;
  estimatedTime?: number;
  paymentType: 'private' | 'waiver';
}

export interface GuestRideResponse {
  id: number;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  notes?: string;
  distanceKm?: number;
  estimatedTime?: number;
  status: string;
  passengerName: string;
  passengerPhone: string;
  scheduledAt: string;
  createdAt: string;
  isGuest: boolean;
}

export class GuestBookingService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

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

static async getExistingBookings(phone: string): Promise<Array<{
  date: string;
  time: string;
  status: string;
}>> {
  try {
    const response = await fetch(`${this.baseUrl}/public/rides/existing-bookings?phone=${encodeURIComponent(phone)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch existing bookings: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching existing bookings:', error);
    throw error;
  }
}

static async checkDateAvailability(phone: string, date: string, time: string): Promise<{ available: boolean; reason?: string }> {
  try {
    const response = await fetch(
      `${this.baseUrl}/public/rides/check-availability?phone=${encodeURIComponent(phone)}&date=${date}&time=${time}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check availability: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}}