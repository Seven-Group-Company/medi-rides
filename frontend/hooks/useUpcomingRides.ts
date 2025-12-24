import { useState, useEffect, useCallback } from 'react';
import { RideHistory } from '@/types/ride-history.types';
import { RidesService } from '@/services/user-rides.service';

export const useUpcomingRides = (limit: number = 3) => {
  const [upcomingRides, setUpcomingRides] = useState<RideHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingRides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await RidesService.getUserRides();
      
      const now = new Date();
      const upcoming = response.data
        .filter((ride: RideHistory) => 
          new Date(ride.scheduledAt) > now && 
          ['PENDING', 'ASSIGNED', 'CONFIRMED', 'DRIVER_EN_ROUTE'].includes(ride.status)
        )
        .sort((a: RideHistory, b: RideHistory) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, limit);
      
      setUpcomingRides(upcoming);
    } catch (err: any) {
      console.error('Error fetching upcoming rides:', err);
      setError(err.message || 'Failed to load upcoming rides');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUpcomingRides();
  }, [fetchUpcomingRides]);

  return {
    upcomingRides,
    loading,
    error,
    refetch: fetchUpcomingRides,
  };
};
