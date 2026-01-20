'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUpcomingRides } from '@/hooks/useUpcomingRides';
import { useRideHistory } from '@/hooks/useRideHistory';
import { WelcomeSection } from '@/components/dashboard/customer/welcome-section';
import { StatsCards } from '@/components/dashboard/customer/stats-cards';
import { UpcomingRides } from '@/components/dashboard/customer/upcoming-rides';
import { HealthTips } from '@/components/dashboard/customer/health-tips';
import Link from 'next/link';
import { Calendar, Clock, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { upcomingRides, loading: ridesLoading, error: ridesError } = useUpcomingRides(3);
  const { rides } = useRideHistory();

  // Calculate stats from ride history
  const calculateStats = () => {
    const totalRides = rides.length;
    const upcomingRidesCount = upcomingRides.length;
    const completedRides = rides.filter(ride => 
      ['COMPLETED'].includes(ride.status)
    ).length;
    const totalSpent = rides.reduce((sum, ride) => 
      sum + (ride.finalPrice || 0), 0
    );

    return { totalRides, upcomingRidesCount, completedRides, totalSpent };
  };

  const stats = calculateStats();

  if (!user) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with welcome and quick actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <WelcomeSection user={user} />
        
        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Link
            href="/customer-dashboard/book-ride"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A2342] to-[#1a365d] text-white px-5 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5" />
            Book New Ride
          </Link>
          <Link
            href="/customer-dashboard/schedule"
            className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-5 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Schedule
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards 
        totalRides={stats.totalRides}
        upcomingRides={stats.upcomingRidesCount}
        completedRides={stats.completedRides}
        totalSpent={stats.totalSpent}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Rides */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingRides 
            rides={upcomingRides}
            loading={ridesLoading}
            error={ridesError}
          />
          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Health Tips */}
          <HealthTips />
          
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {rides.slice(0, 3).map((ride, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${
                    ride.status === 'COMPLETED' ? 'bg-green-500' : 
                    ride.status === 'PENDING' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ride.pickup} → {ride.dropoff}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(ride.scheduledAt).toLocaleDateString()} • ${ride.finalPrice || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/customer-dashboard/ride-history"
              className="block text-center mt-6 text-sm font-medium text-[#0A2342] hover:text-[#9BC9FF] transition-colors"
            >
              View All Activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}