import { Vehicle, CreateVehicleData, UpdateVehicleData, VehicleStats } from '@/types/vehicle.types';

export class VehiclesService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles`;

// In vehicles.service.ts (frontend), update the createVehicle method:

static async createVehicle(vehicleData: CreateVehicleData, images: File[] = []) {
  const formData = new FormData();
  
  // Ensure we're sending the correct field names
  const dataForBackend: any = {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    color: vehicleData.color,
    licensePlate: vehicleData.licensePlate,
    vin: vehicleData.vin || '',
    type: vehicleData.type, // Make sure this is included
    capacity: vehicleData.capacity,
    hasWheelchairAccess: vehicleData.hasWheelchairAccess,
    hasOxygenSupport: vehicleData.hasOxygenSupport,
    insuranceExpiry: vehicleData.insuranceExpiry,
    registrationExpiry: vehicleData.registrationExpiry,
    liabilityInsuranceExpiry: vehicleData.liabilityInsuranceExpiry || vehicleData.insuranceExpiry, // Fallback
  };
  
  console.log('📤 Data for backend:', dataForBackend);
  
  formData.append('vehicleData', JSON.stringify(dataForBackend));
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  // Append images
  images.forEach((image) => {
    formData.append('images', image);
  });

  try {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Server error response:', errorData);
      
      if (errorData?.message && Array.isArray(errorData.message)) {
        // Handle validation errors array
        const errorMessages = errorData.message
          .map((err: any) => {
            if (err.constraints) {
              return Object.values(err.constraints).join(', ');
            }
            return err.property || 'Validation error';
          })
          .join('; ');
        throw new Error(`Validation failed: ${errorMessages}`);
      } else if (errorData?.message) {
        // Handle single error message
        throw new Error(errorData.message);
      } else {
        throw new Error(`Failed to create vehicle: ${response.status} ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}


  static async getAllVehicles(): Promise<Vehicle[]> {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }

    const result = await response.json();
    return result.data;
  }

  static async getVehicleStats(): Promise<VehicleStats> {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle stats');
    }

    const result = await response.json();
    return result.data;
  }

  static async getVehicleById(id: number): Promise<Vehicle> {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle');
    }

    const result = await response.json();
    return result.data;
  }

  static async updateVehicle(id: number, vehicleData: UpdateVehicleData, images: File[] = []) {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(vehicleData));
    
    images.forEach((image, index) => {
      formData.append('images', image);
    });

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update vehicle: ${response.status}`);
    }

    return response.json();
  }

  static async deleteVehicle(id: number) {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to delete vehicle: ${response.status}`);
    }

    return response.json();
  }

  static async updateVehicleStatus(id: number, status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE') {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update vehicle status: ${response.status}`);
    }

    return response.json();
  }
}