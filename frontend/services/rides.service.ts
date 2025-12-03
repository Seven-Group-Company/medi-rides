import { CreateRideDto } from '@/types/booking.types';

export class RidesService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`; // Remove /rides from base URL

  static async getServiceCategories() {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Only add authorization if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${this.baseUrl}/service-categories/active`;
      console.log('🔄 Fetching service categories from:', url);
      
      const response = await fetch(url, {
        headers,
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        // If we get 401 with a token, the token might be invalid
        if (response.status === 401 && token) {
          console.log('🔄 Token might be invalid, trying without token...');
          // Retry without token
          const retryResponse = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (retryResponse.ok) {
            const result = await retryResponse.json();
            return result.data;
          }
        }
        
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`Failed to fetch service categories: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Service categories fetched successfully:', result.data?.length || 0, 'categories');
      return result.data;
    } catch (error) {
      console.error('❌ Error fetching service categories:', error);
      throw error;
    }
  }

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