// Stats Cards Component
import { motion } from 'framer-motion';
import { Users, Car, Clock, DollarSign, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalRides: number;
  upcomingRides: number;
  completedRides: number;
  totalSpent: number;
}

export const StatsCards = ({ 
  totalRides, 
  upcomingRides, 
  completedRides, 
  totalSpent 
}: StatsCardsProps) => {
  const stats = [
    {
      label: 'Total Rides',
      value: totalRides,
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      suffix: 'rides'
    },
    {
      label: 'Upcoming Rides',
      value: upcomingRides,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      change: 'Scheduled',
      suffix: 'upcoming'
    },
    {
      label: 'Completed',
      value: completedRides,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8%',
      suffix: 'completed'
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      change: '+5%',
      suffix: 'total'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </motion.div>
        );
      })}
    </div>
  );
};