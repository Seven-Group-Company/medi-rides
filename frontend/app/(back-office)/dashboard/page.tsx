'use client';

import { useState, useEffect } from 'react';
import DashboardHome from "@/components/dashboard/dashboard-home";

interface UserData {
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
  name: string;
  email: string;
}

interface DashboardData {
  stats: {
    totalRides: number;
    upcomingRides: number;
    completedRides: number;
    todayRides: number;
    totalRevenue: number;
    ridesThisWeek: number;
  };
  recentRides: Array<{
    id: number;
    pickup: string;
    dropoff: string;
    scheduledAt: string;
    status: string;
    passengerName: string;
    driverName?: string;
    vehicle?: string;
    finalPrice?: number;
  }>;
}

// Get user data from localStorage or API
const getUserData = (): UserData => {
  // Try to get from localStorage first
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          role: user.role || 'CUSTOMER',
          name: user.name || 'User',
          email: user.email || 'user@example.com'
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  
  // Default fallback
  return {
    role: 'CUSTOMER',
    name: 'John Doe',
    email: 'john@example.com'
  };
};

// Mock data - replace with actual API calls
const getMockDashboardData = (userRole: string): DashboardData => {
  const baseStats = {
    totalRides: 24,
    upcomingRides: 2,
    completedRides: 22,
    todayRides: 3,
    totalRevenue: 1250,
    ridesThisWeek: 15,
  };

  const recentRides = [
    {
      id: 1,
      pickup: '123 Main St',
      dropoff: 'Medical Center',
      scheduledAt: new Date().toISOString(),
      status: 'COMPLETED',
      serviceType: 'MEDICAL',
      passengerName: 'John Smith',
      driverName: 'Michael Johnson',
      vehicle: 'Toyota Camry',
      finalPrice: 45.50,
    },
    {
      id: 2,
      pickup: '456 Park Ave',
      dropoff: 'JFK Airport',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'ASSIGNED',
      serviceType: 'GENERAL',
      passengerName: 'Sarah Wilson',
      driverName: 'Robert Brown',
      vehicle: 'Honda Accord',
      estimatedPrice: 65.75,
    },
    {
      id: 3,
      pickup: '789 Broadway',
      dropoff: 'Physical Therapy Clinic',
      scheduledAt: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      status: 'CONFIRMED',
      serviceType: 'MEDICAL',
      passengerName: 'David Lee',
      estimatedPrice: 85.00,
    },
  ];

  return {
    stats: baseStats,
    recentRides,
  };
};

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get user data
        const user = getUserData();
        setUserData(user);

        // Get dashboard data - first try API, fallback to mock
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const apiData = await response.json();
              if (apiData.data) {
                setDashboardData({
                  stats: {
                    totalRides: apiData.data.stats.totalRides || 0,
                    upcomingRides: apiData.data.stats.upcomingRides || 0,
                    completedRides: apiData.data.stats.completedRides || 0,
                    todayRides: apiData.data.stats.todayRides || 0,
                    totalRevenue: apiData.data.stats.totalRevenue || 0,
                    ridesThisWeek: apiData.data.stats.ridesThisWeek || 0,
                  },
                  recentRides: apiData.data.recentRides || [],
                });
                setLoading(false);
                return;
              }
            }
          } catch (apiError) {
            console.error('API fetch failed, using mock data:', apiError);
          }
        }

        // Fallback to mock data
        setDashboardData(getMockDashboardData(user.role));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Even on error, set some default data
        setDashboardData(getMockDashboardData('CUSTOMER'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading || !userData || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardHome
      userRole={userData.role}
      stats={dashboardData.stats}
    />
  );
}