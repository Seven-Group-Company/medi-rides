import axios from 'axios';
import { CreateDriverData, UpdateDriverData } from '@/types/driver';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const driverService = {
  // Get all drivers with pagination
  async getDrivers(page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    const response = await api.get(`/admin/drivers?${params}`);
    return response.data;
  },

  // Get driver by ID
  async getDriverById(id: number) {
    const response = await api.get(`/admin/drivers/${id}`);
    return response.data;
  },

// In your driver-service.ts, update the createDriver method:
async createDriver(data: CreateDriverData) {
  console.log('Sending create driver request with data:', data);
  
  try {
    const response = await api.post('/admin/drivers', data);
    console.log('Create driver response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating driver:', error);
    throw error;
  }
},

  // Update driver
  async updateDriver(id: number, data: UpdateDriverData) {
    const response = await api.put(`/admin/drivers/${id}`, data);
    return response.data;
  },

  // Delete driver
  async deleteDriver(id: number) {
    const response = await api.delete(`/admin/drivers/${id}`);
    return response.data;
  },

  // Get driver statistics
  async getDriverStats() {
    const response = await api.get('/admin/drivers/stats');
    return response.data;
  },

  // Get available drivers
  async getAvailableDrivers() {
    const response = await api.get('/admin/drivers/available');
    return response.data;
  },

  // Assign vehicles to driver
  async assignVehicles(driverId: number, vehicleIds: number[]) {
    const response = await api.post(`/admin/drivers/${driverId}/vehicles`, { vehicleIds });
    return response.data;
  },

  // Unassign vehicle from driver
  async unassignVehicle(driverId: number, vehicleId: number) {
    const response = await api.delete(`/admin/drivers/${driverId}/vehicles/${vehicleId}`);
    return response.data;
  },

  // Update driver status
  async updateDriverStatus(driverId: number, isAvailable: boolean, reason?: string) {
    const response = await api.put(`/admin/drivers/${driverId}/status`, { 
      isAvailable, 
      reason 
    });
    return response.data;
  },

  async getProfile(): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/driver/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch driver profile');
    }

    return response.json();
  },

  async getStats(): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/driver/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch driver stats');
    }

    return response.json();
  },

  async getRideHistory(): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/driver/rides/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ride history');
    }

    return response.json();
  },

   async getEarnings(): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/driver/earnings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch earnings');
    }

    return response.json();
  },

   async updateStatus(statusDto: { isAvailable: boolean; reason?: string }): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/driver/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusDto),
    });

    if (!response.ok) {
      throw new Error('Failed to update driver status');
    }

    return response.json();
  }
};