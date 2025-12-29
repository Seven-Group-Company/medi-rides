import { useState, useEffect, useCallback } from 'react';
import { transformVehicleDataForBackend } from '@/utils/vehicleDataTransformer';
import { Vehicle, CreateVehicleData, UpdateVehicleData, Driver, VehicleStats } from '@/types/vehicle.types';
import { VehiclesService } from '@/services/vehicles.service';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VehiclesService.getAllVehicles();
      setVehicles(data);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await VehiclesService.getVehicleStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching vehicle stats:', err);
    }
  }, []);


// In useVehicles.ts, update the createVehicle function:
const createVehicle = useCallback(async (vehicleData: CreateVehicleData, images: File[] = []) => {
  try {
    setError(null);
    
    console.log('📤 Original form data:', vehicleData);
    console.log('📤 Has liabilityInsuranceExpiry?', !!vehicleData.liabilityInsuranceExpiry);
    console.log('📤 Has type?', vehicleData.type);
    console.log('📤 Has vehicleType?', (vehicleData as any).vehicleType);
    
    // Don't transform, send as-is
    const result = await VehiclesService.createVehicle(vehicleData, images);
    await fetchVehicles();
    await fetchStats();
    return result;
  } catch (err: any) {
    console.error('Error creating vehicle:', err);
    setError(err.message || 'Failed to create vehicle');
    throw err;
  }
}, [fetchVehicles, fetchStats]);

  const updateVehicle = useCallback(async (id: number, vehicleData: UpdateVehicleData, images: File[] = []) => {
    try {
      setError(null);
      const result = await VehiclesService.updateVehicle(id, vehicleData, images);
      await fetchVehicles(); // Refresh the list
      await fetchStats(); // Refresh stats
      return result;
    } catch (err: any) {
      console.error('Error updating vehicle:', err);
      setError(err.message || 'Failed to update vehicle');
      throw err;
    }
  }, [fetchVehicles, fetchStats]);

  const deleteVehicle = useCallback(async (id: number) => {
    try {
      setError(null);
      await VehiclesService.deleteVehicle(id);
      await fetchVehicles(); // Refresh the list
      await fetchStats(); // Refresh stats
    } catch (err: any) {
      console.error('Error deleting vehicle:', err);
      setError(err.message || 'Failed to delete vehicle');
      throw err;
    }
  }, [fetchVehicles, fetchStats]);

  const updateVehicleStatus = useCallback(async (id: number, status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE') => {
    try {
      setError(null);
      const result = await VehiclesService.updateVehicleStatus(id, status);
      await fetchVehicles(); // Refresh the list
      await fetchStats(); // Refresh stats
      return result;
    } catch (err: any) {
      console.error('Error updating vehicle status:', err);
      setError(err.message || 'Failed to update vehicle status');
      throw err;
    }
  }, [fetchVehicles, fetchStats]);

  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  useEffect(() => {
    fetchVehicles();
    fetchStats();
  }, [fetchVehicles, fetchStats]);

  return {
    // State
    vehicles: filteredVehicles,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    
    // Actions
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    refetch: fetchVehicles,
    refetchStats: fetchStats,
    
    // Stats
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'AVAILABLE').length,
    inUseVehicles: vehicles.filter(v => v.status === 'IN_USE').length,
    maintenanceVehicles: vehicles.filter(v => v.status === 'MAINTENANCE').length,
  };
};