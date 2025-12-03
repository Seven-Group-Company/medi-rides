import { useState, useEffect, useCallback } from 'react';
import { Customer, Driver, RideRequest, Vehicle } from '@/types/admin.types';

interface AdminStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingRides: number;
  availableDrivers: number;
  availableVehicles: number;
  completedRides: number;
  totalRides: number;
}

export const useAdminBookingManagement = () => {
  const [activeTab, setActiveTab] = useState<'rides' | 'customers'>('rides');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');
  const [rideSearch, setRideSearch] = useState('');
  const [rideStatusFilter, setRideStatusFilter] = useState('all');
  
  // Stats
  const [stats, setStats] = useState<AdminStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    pendingRides: 0,
    availableDrivers: 0,
    availableVehicles: 0,
    completedRides: 0,
    totalRides: 0,
  });

  // Update the fetchData function to include invoice in ride data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel
      const [customersRes, ridesRes, driversRes, vehiclesRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rides?include=invoice`, { headers }), // Added include=invoice query
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/drivers`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers }),
      ]);

      // Handle non-OK responses
      if (!customersRes.ok) {
        const errorText = await customersRes.text();
        throw new Error(`Failed to fetch customers: ${customersRes.status} ${errorText}`);
      }
      if (!ridesRes.ok) {
        const errorText = await ridesRes.text();
        throw new Error(`Failed to fetch rides: ${ridesRes.status} ${errorText}`);
      }
      if (!driversRes.ok) {
        const errorText = await driversRes.text();
        throw new Error(`Failed to fetch drivers: ${driversRes.status} ${errorText}`);
      }
      if (!vehiclesRes.ok) {
        const errorText = await vehiclesRes.text();
        throw new Error(`Failed to fetch vehicles: ${vehiclesRes.status} ${errorText}`);
      }
      if (!statsRes.ok) {
        const errorText = await statsRes.text();
        throw new Error(`Failed to fetch stats: ${statsRes.status} ${errorText}`);
      }

      const [customersData, ridesData, driversData, vehiclesData, statsData] = await Promise.all([
        customersRes.json(),
        ridesRes.json(),
        driversRes.json(),
        vehiclesRes.json(),
        statsRes.json(),
      ]);

      setCustomers(customersData.data || []);
      setRideRequests(ridesData.data || []);
      setDrivers(driversData.data || []);
      setVehicles(vehiclesData.data || []);
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ride Actions - Add completeRide function
  const completeRide = useCallback(async (rideId: number) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rides/${rideId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to complete ride: ${response.status} ${errorText}`);
      }

      await fetchData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error completing ride:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }, [fetchData]);

  const approveRide = useCallback(async (rideId: number, price: number, note?: string) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rides/${rideId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price, note }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve ride: ${response.status} ${errorText}`);
      }

      await fetchData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error approving ride:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }, [fetchData]);

  const declineRide = useCallback(async (rideId: number, reason: string) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rides/${rideId}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to decline ride');

      await fetchData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error declining ride:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }, [fetchData]);

  const assignDriverAndVehicle = useCallback(async (rideId: number, driverId: number, vehicleId: number) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rides/${rideId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId, vehicleId }),
      });

      if (!response.ok) throw new Error('Failed to assign driver');

      await fetchData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error assigning driver:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }, [fetchData]);

  // Customer Actions
  const updateCustomerStatus = useCallback(async (customerId: number, isActive: boolean) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error('Failed to update customer status');

      await fetchData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error updating customer status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }, [fetchData]);

  return {
    // State
    activeTab,
    setActiveTab,
    customers,
    rideRequests,
    drivers,
    vehicles,
    loading,
    
    // Customer filters
    customerSearch,
    setCustomerSearch,
    customerStatusFilter,
    setCustomerStatusFilter,
    
    // Ride filters
    rideSearch,
    setRideSearch,
    rideStatusFilter,
    setRideStatusFilter,
    
    // Actions
    approveRide,
    declineRide,
    assignDriverAndVehicle,
    updateCustomerStatus,
    completeRide, // Added
    
    // Stats
    stats,
    
    // Refresh function
    refreshData: fetchData,
  };
};