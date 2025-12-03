import { Ride } from '@/types/ride.types';

export class DriverRidesService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/driver/rides`;

  private static async handleResponse(response: Response) {
    if (response.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  private static async authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      window.location.href = '/login';
      throw new Error('No authentication token found. Please log in again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return this.handleResponse(response);
  }

  static async getAssignedRides(): Promise<Ride[]> {
    const data = await this.authFetch(`${this.baseUrl}/assigned`);
    return data.data || [];
  }

  static async getActiveRides(): Promise<Ride[]> {
    const data = await this.authFetch(`${this.baseUrl}/active`);
    return data.data || [];
  }

  static async getRideHistory(): Promise<Ride[]> {
    const data = await this.authFetch(`${this.baseUrl}/history`);
    return data.data || [];
  }

  static async getRideDetails(rideId: number): Promise<Ride> {
    const data = await this.authFetch(`${this.baseUrl}/${rideId}`);
    return data.data;
  }

  static async updateRideStatus(rideId: number, status: Ride['status'], estimatedArrivalMinutes?: number): Promise<Ride> {
    const data = await this.authFetch(`${this.baseUrl}/${rideId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        ...(estimatedArrivalMinutes && { estimatedArrivalMinutes }),
      }),
    });
    return data.data;
  }

  static async acceptRide(rideId: number, estimatedArrivalMinutes: number): Promise<Ride> {
    const data = await this.authFetch(`${this.baseUrl}/${rideId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ estimatedArrivalMinutes }),
    });
    return data.data;
  }

  static async completeRide(rideId: number, actualDistance?: number, actualDuration?: number): Promise<Ride> {
    const data = await this.authFetch(`${this.baseUrl}/${rideId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ actualDistance, actualDuration }),
    });
    return data.data;
  }
}