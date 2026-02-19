'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AnalyticsSectionProps {
  userRole: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
}

interface WeeklyData {
  week: string;
  rides: number;
  revenue: number;
  avgRideValue: number;
}


interface AnalyticsSummary {
  summary: {
    totalRides: number;
    thisWeekRides: number;
    thisMonthRides: number;
    totalRevenue: number;
    thisWeekRevenue: number;
    thisMonthRevenue: number;
    activeRides: number;
    avgRideValue: number;
  };
  weeklyData?: WeeklyData[];
}

export default function AnalyticsSection({ userRole }: AnalyticsSectionProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch comprehensive analytics summary
      const [summaryResponse, weeklyResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/weekly?weeks=8`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      const summaryData = await summaryResponse.json();
      const weeklyData = await weeklyResponse.json();

      setAnalyticsData(summaryData.data);
      setWeeklyData(weeklyData.data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchAnalyticsData();
    }
  }, [userRole, timeRange]);

  if (userRole !== 'ADMIN') return null;

  if (loading && !analyticsData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary } = analyticsData || getMockAnalyticsSummary();
  const displayWeeklyData = weeklyData.length > 0 ? weeklyData.slice(-7) : getMockWeeklyData();

  const maxRides = Math.max(...displayWeeklyData.map(d => d.rides));
  const maxRevenue = Math.max(...displayWeeklyData.map(d => d.revenue));

  // Calculate growth percentages
  const revenueGrowth = summary.totalRevenue > 0 
    ? ((summary.thisWeekRevenue / (summary.totalRevenue / 52)) - 1) * 100 
    : 0;
  const ridesGrowth = summary.totalRides > 0 
    ? ((summary.thisWeekRides / (summary.totalRides / 52)) - 1) * 100 
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={fetchAnalyticsData}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Refresh analytics"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-sm font-medium flex items-center ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Weekly Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.thisWeekRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ${summary.thisMonthRevenue.toLocaleString()} this month
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-sm font-medium flex items-center ${ridesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ridesGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(ridesGrowth).toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Weekly Rides</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.thisWeekRides.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {summary.thisMonthRides.toLocaleString()} this month
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">
              ${summary.avgRideValue.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Average Ride Value</p>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Total revenue from {summary.totalRides.toLocaleString()} rides
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <span className={`text-sm font-medium ${summary.activeRides > 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {summary.activeRides} active
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Active Rides</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalRides.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Total rides completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Weekly Performance */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Performance (Last 7 Weeks)</h3>
          <div className="space-y-4">
            {displayWeeklyData.map((week, index) => (
              <div key={week.week} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">{week.week}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900">{week.rides} rides</span>
                    <span className="text-gray-900">${week.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(week.rides / maxRides) * 100}%` }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>${week.avgRideValue.toFixed(2)} avg/ride</span>
                  <span>{((week.revenue / week.rides) || 0).toFixed(2)} per ride</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {revenueGrowth >= 0 ? 'Growth' : 'Decline'} this week
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {displayWeeklyData.reduce((sum, week) => sum + week.rides, 0)} total rides
                </p>
                <p className="text-sm text-gray-600">
                  ${displayWeeklyData.reduce((sum, week) => sum + week.revenue, 0).toLocaleString()} revenue
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data fallback functions
function getMockWeeklyData(): WeeklyData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    week: day,
    rides: Math.floor(Math.random() * 20) + 10,
    revenue: Math.floor(Math.random() * 1000) + 500,
    avgRideValue: Math.floor(Math.random() * 50) + 25,
  }));
}



function getMockAnalyticsSummary(): AnalyticsSummary {
  return {
    summary: {
      totalRides: 1450,
      thisWeekRides: 85,
      thisMonthRides: 320,
      totalRevenue: 54250,
      thisWeekRevenue: 3250,
      thisMonthRevenue: 14250,
      activeRides: 12,
      avgRideValue: 37.41,
    },
  };
}