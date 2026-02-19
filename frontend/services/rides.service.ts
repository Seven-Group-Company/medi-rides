import { CreateRideDto } from '@/types/booking.types';

export class RidesService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`; // Remove /rides from base URL

  static async createRide(rideData: CreateRideDto) {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${this.baseUrl}/rides`, { // Now this will be correct
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rideData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Failed to create ride: ${response.status}`;
      
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async getUserRides() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${this.baseUrl}/rides`, { // Fixed URL
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rides');
    }

    return response.json();
  }

  static async getRideDetails(rideId: string) {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${this.baseUrl}/rides/${rideId}`, { // Fixed URL
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ride details');
    }

    return response.json();
  }
}