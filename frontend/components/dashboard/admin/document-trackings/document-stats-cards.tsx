'use client';

import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Shield,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentStats } from '@/types/document-tracking.types';

interface DocumentStatsCardsProps {
  stats: DocumentStats;
  urgentCount: number;
}

export default function DocumentStatsCards({ stats, urgentCount }: DocumentStatsCardsProps) {
  const cards = [
    {
      title: 'Total Documents',
      value: stats.total,
      icon: FileText,
      color: 'bg-blue-500',
      trend: '+12%',
      description: 'All tracked documents',
    },
    {
      title: 'Valid',
      value: stats.valid,
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+5%',
      description: 'Currently active',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: urgentCount > 0 ? '⚠️ Urgent' : 'Stable',
      description: `Within 30 days (${stats.expiringThisWeek} this week)`,
    },
    {
      title: 'Expired',
      value: stats.expired,
      icon: AlertCircle,
      color: 'bg-red-500',
      trend: stats.expired > 0 ? 'Needs Action' : 'All Clear',
      description: 'Requires renewal',
    },
    {
      title: 'Renewal in Progress',
      value: stats.renewalInProgress,
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: `${stats.recentRenewals} renewed`,
      description: 'Being processed',
    },
    {
      title: 'Upcoming Renewals',
      value: stats.upcomingRenewals,
      icon: Calendar,
      color: 'bg-indigo-500',
      trend: `${stats.expiringThisMonth} this month`,
      description: 'Next 30 days',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    card.title.includes('Expired') && card.value > 0
                      ? 'bg-red-100 text-red-800'
                      : card.title.includes('Expiring') && card.value > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {card.trend}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{card.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Progress bar for expiring/expired documents */}
            {(card.title === 'Expiring Soon' || card.title === 'Expired') && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Status</span>
                  <span>{Math.round((card.value / stats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      card.title === 'Expired' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min((card.value / stats.total) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}