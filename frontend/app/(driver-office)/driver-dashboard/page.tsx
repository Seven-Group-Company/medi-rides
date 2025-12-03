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
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DriverStats {
  totalRides: number;
  completedRides: number;
  activeRides: number;
  rating: number;
  totalEarnings: number;
  isAvailable: boolean;
}

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchDriverStats = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStats({
            totalRides: 156,
            completedRides: 142,
            activeRides: 2,
            rating: 4.8,
            totalEarnings: 3420.50,
            isAvailable: true
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching driver stats:', error);
        setLoading(false);
      }
    };

    fetchDriverStats();
  }, []);

  const quickActions = [
    { 
      icon: Car, 
      label: 'Go Online', 
      description: 'Start accepting rides',
      color: 'bg-green-500',
      href: '/driver/schedule'
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

  const recentRides = [
    { id: 1, passenger: 'Sarah Johnson', time: '2:30 PM', status: 'completed', amount: 28.50 },
    { id: 2, passenger: 'Mike Chen', time: '4:15 PM', status: 'in-progress', amount: 18.75 },
    { id: 3, passenger: 'Emily Davis', time: '10:20 AM', status: 'completed', amount: 32.25 },
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <div className="">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Driver'}!
          </h1>
          <p className="text-gray-600">
            Here's your activity overview for today
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { 
            label: 'Total Rides', 
            value: stats?.totalRides || 0, 
            icon: Car,
            color: 'bg-blue-500'
          },
          { 
            label: 'Completed', 
            value: stats?.completedRides || 0, 
            icon: Calendar,
            color: 'bg-green-500'
          },
          { 
            label: 'Active Rides', 
            value: stats?.activeRides || 0, 
            icon: Clock,
            color: 'bg-yellow-500'
          },
          { 
            label: 'Rating', 
            value: stats?.rating || 0, 
            icon: Star,
            color: 'bg-purple-500'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <div className={`p-3 rounded-lg ${action.color} mb-2`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
                <span className="text-xs text-gray-500 mt-1">{action.description}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold text-gray-900">$156.80</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">$842.50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">${stats?.totalEarnings.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-lg font-bold text-blue-600">${stats?.totalEarnings.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
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
          <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentRides.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ride.passenger}</p>
                  <p className="text-xs text-gray-500">{ride.time}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ride.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {ride.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
                <p className="mt-1 text-sm font-semibold text-gray-900">${ride.amount}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}