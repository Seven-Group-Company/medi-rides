'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface RidesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'completed' | 'upcoming';
  onStatusFilterChange: (filter: 'all' | 'active' | 'completed' | 'upcoming') => void;
}

export default function RidesFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: RidesFiltersProps) {
  const filters = [
    { value: 'all' as const, label: 'All Rides' },
    { value: 'active' as const, label: 'Active' },
    { value: 'upcoming' as const, label: 'Upcoming' },
    { value: 'completed' as const, label: 'Completed' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by passenger, pickup, or dropoff..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onStatusFilterChange(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}