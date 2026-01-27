'use client';

import React from 'react';
import { DriverStats } from '@/types/driver';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Car,
  Star,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface DriverStatsCardsProps {
  stats: DriverStats;
}

const DriverStatsCards: React.FC<DriverStatsCardsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      change: '+12%',
      trend: 'up',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: <Users className="w-6 h-6" />,
      description: 'All registered drivers',
      gradient: 'from-blue-50 to-blue-100/50',
    },
    {
      title: 'Active Drivers',
      value: stats.activeDrivers,
      change: '+8%',
      trend: 'up',
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: <CheckCircle className="w-6 h-6" />,
      description: 'Currently working',
      gradient: 'from-green-50 to-emerald-100/50',
    },
    {
      title: 'Available Now',
      value: stats.availableDrivers,
      change: '-3%',
      trend: 'down',
      color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      icon: <AlertCircle className="w-6 h-6" />,
      description: 'Ready for assignments',
      gradient: 'from-emerald-50 to-teal-100/50',
    },
    {
      title: 'On Trip',
      value: stats.onTripDrivers,
      change: '+15%',
      trend: 'up',
      color: 'bg-gradient-to-r from-purple-500 to-violet-600',
      icon: <Car className="w-6 h-6" />,
      description: 'Currently on duty',
      gradient: 'from-purple-50 to-violet-100/50',
    },
    {
      title: 'Avg Rating',
      value: stats.averageRating.toFixed(1),
      change: '+0.2',
      trend: 'up',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: <Star className="w-6 h-6" />,
      description: 'Average driver rating',
      gradient: 'from-yellow-50 to-orange-100/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.gradient} rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
              {stat.icon}
            </div>
            <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
              stat.trend === 'up' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {stat.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {stat.change}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm font-semibold text-gray-700">{stat.title}</p>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </div>
          
          {/* Progress bar for visual indication */}
          <div className="mt-4">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${stat.color.split(' ')[0].replace('from-', 'bg-')} rounded-full`}
                style={{ width: `${Math.min(100, (Number(stat.value) / 50) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriverStatsCards;