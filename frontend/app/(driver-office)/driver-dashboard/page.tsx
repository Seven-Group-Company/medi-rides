'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  DollarSign, 
  Calendar, 
  Star, 
  Clock,
  TrendingUp,
  MapPin,
  AlertCircle,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { driverService } from '@/services/driver-service';

interface DriverStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  rating: number;
  totalEarnings: number;
  isAvailable: boolean;
}

interface RecentRide {
  id: number;
  passengerName: string;
  passengerPhone?: string;
  scheduledAt: string;
  actualPickupAt?: string;
  actualDropoffAt?: string;
  status: string;
  totalAmount?: number;
}

interface EarningsSummary {
  total: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
}

interface DriverProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isAvailable: boolean;
  driverProfile?: {
    rating: number;
    totalTrips: number;
    licenseNumber?: string;
    licenseState?: string;
  };
}

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [recentRides, setRecentRides] = useState<RecentRide[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all driver data in parallel
        const [profileData, statsData, ridesData, earningsData] = await Promise.all([
          driverService.getProfile(),
          driverService.getStats(),
          driverService.getRideHistory(),
          driverService.getEarnings(),
        ]);

        setProfile(profileData.data);
        setStats(statsData.data);
        setRecentRides(ridesData.data.slice(0, 3)); // Only show 3 most recent rides
        setEarnings(earningsData.data);
      } catch (error: any) {
        console.error('Error fetching driver data:', error);
        setError(error.message || 'Failed to load driver data');
        
        // Set fallback data for demo purposes
        setStats({
          totalRides: 156,
          completedRides: 142,
          cancelledRides: 8,
          activeRides: 2,
          rating: 4.8,
          totalEarnings: 3420.50,
          isAvailable: true
        });
        
        setEarnings({
          total: 3420.50,
          thisMonth: 1250.80,
          thisWeek: 350.25,
          today: 156.80
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  const quickActions = [
    { 
      icon: Car, 
      label: stats?.isAvailable ? 'Go Offline' : 'Go Online', 
      description: stats?.isAvailable ? 'Stop accepting rides' : 'Start accepting rides',
      color: stats?.isAvailable ? 'bg-red-500' : 'bg-green-500',
      onClick: () => handleToggleAvailability(),
    },
    { 
      icon: MapPin, 
      label: 'Set Location', 
      description: 'Update your location',
      color: 'bg-blue-500',
      href: '/driver/profile'
    },
    { 
      icon: Calendar, 
      label: 'Schedule', 
      description: 'Manage availability',
      color: 'bg-purple-500',
      href: '/driver/schedule'
    },
    { 
      icon: DollarSign, 
      label: 'Earnings', 
      description: 'View payments',
      color: 'bg-yellow-500',
      href: '/driver/earnings'
    },
  ];

  const handleToggleAvailability = async () => {
    try {
      const newStatus = !stats?.isAvailable;
      await driverService.updateStatus({ 
        isAvailable: newStatus,
        reason: newStatus ? 'Going online' : 'Taking a break'
      });
      
      // Update local state
      setStats(prev => prev ? { ...prev, isAvailable: newStatus } : null);
      
      // Update profile
      setProfile(prev => prev ? { ...prev, isAvailable: newStatus } : null);
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      'ASSIGNED': { color: 'bg-yellow-100 text-yellow-800', label: 'Assigned' },
      'CONFIRMED': { color: 'bg-indigo-100 text-indigo-800', label: 'Confirmed' },
      'DRIVER_EN_ROUTE': { color: 'bg-purple-100 text-purple-800', label: 'En Route' },
      'PICKUP_ARRIVED': { color: 'bg-pink-100 text-pink-800', label: 'Arrived' },
      'NO_SHOW': { color: 'bg-gray-100 text-gray-800', label: 'No Show' },
    };

    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.name || user?.name || 'Driver'}!
            </h1>
            <p className="text-gray-600">
              {stats?.isAvailable ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Currently online and accepting rides
                </span>
              ) : (
                <span className="flex items-center text-gray-500">
                  <XCircle className="w-4 h-4 mr-2" />
                  Currently offline
                </span>
              )}
            </p>
          </div>
          
          {profile?.driverProfile && (
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Driver Rating</p>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="text-xl font-bold text-gray-900">
                    {profile.driverProfile.rating?.toFixed(1) || '5.0'}
                  </span>
                </div>
              </div>
              {profile.driverProfile.licenseNumber && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">License</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.driverProfile.licenseState} • {profile.driverProfile.licenseNumber}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { 
            label: 'Total Rides', 
            value: stats?.totalRides || 0, 
            icon: Car,
            color: 'bg-blue-500',
            description: 'All time rides'
          },
          { 
            label: 'Completed', 
            value: stats?.completedRides || 0, 
            icon: CheckCircle,
            color: 'bg-green-500',
            description: 'Successful rides'
          },
          { 
            label: 'Active Rides', 
            value: stats?.activeRides || 0, 
            icon: Clock,
            color: 'bg-yellow-500',
            description: 'Currently in progress'
          },
          { 
            label: 'Cancelled', 
            value: stats?.cancelledRides || 0, 
            icon: XCircle,
            color: 'bg-red-500',
            description: 'Cancelled rides'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Rides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Rides</h2>
          <a href="/driver-dashboard/rides" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View All
          </a>
        </div>
        
        {recentRides.length > 0 ? (
          <div className="space-y-4">
            {recentRides.map((ride, index) => {
              const badge = getStatusBadge(ride.status);
              return (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {ride.passengerName ? (
                        <span className="font-medium text-blue-600">
                          {ride.passengerName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <Users className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ride.passengerName || 'Guest Ride'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(ride.scheduledAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                    {ride.totalAmount && (
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrency(ride.totalAmount)}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No recent rides found</p>
            <p className="text-sm text-gray-500 mt-1">Start accepting rides to see them here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}