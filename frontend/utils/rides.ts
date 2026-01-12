import { CreateRideDto } from '@/types/booking.types';
import { Ride } from '@/types/ride.types';

class RidesApi {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const { access_token } = await refreshResponse.json();
          localStorage.setItem('access_token', access_token);
          
          // Retry original request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access_token}`,
              ...options.headers,
            },
          });
          return retryResponse;
        } else {
          throw new Error('Session expired. Please log in again.');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'Request failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      } catch (e) {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  async createRide(rideData: CreateRideDto): Promise<{ data: Ride }> {
    const response = await this.fetchWithAuth(`${this.baseURL}/rides`, {
      method: 'POST',
      body: JSON.stringify(rideData),
    });

    return this.handleResponse(response);
  }

  async getUserRides(): Promise<{ data: Ride[] }> {
    const response = await this.fetchWithAuth(`${this.baseURL}/rides`);
    return this.handleResponse(response);
  }

  async getRideDetails(rideId: number): Promise<{ data: Ride }> {
    const response = await this.fetchWithAuth(`${this.baseURL}/rides/${rideId}`);
    return this.handleResponse(response);
  }
}

export const ridesApi = new RidesApi();