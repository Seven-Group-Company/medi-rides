'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  X,
  Calendar,
  Tag,
  Users,
  Car,
  Building,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentCategory } from '@/types/document-tracking.types';

interface DocumentFiltersProps {
  filters: {
    search: string;
    status: string;
    categoryId: number;
    entityType: string;
    priority: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  categories: DocumentCategory[];
  entityTypes: Array<{ id: string; label: string; icon: any }>;
  statusOptions: Array<{ id: string; label: string; color: string }>;
  priorityOptions: Array<{ id: string; label: string; color: string }>;
  onFilterChange: (filters: any) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export default function DocumentFilters({
  filters,
  categories,
  entityTypes,
  statusOptions,
  priorityOptions,
  onFilterChange,
  showFilters,
  onToggleFilters
}: DocumentFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expiryDateRange, setExpiryDateRange] = useState({
    from: '',
    to: ''
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters(prev => ({ ...prev, search: value }));
    // Debounce search
    clearTimeout((window as any).searchTimeout);
    (window as any).searchTimeout = setTimeout(() => {
      onFilterChange({ ...localFilters, search: value });
    }, 300);
  };

  const handleExpiryDateChange = (type: 'from' | 'to', value: string) => {
    const newRange = { ...expiryDateRange, [type]: value };
    setExpiryDateRange(newRange);
    
    if (newRange.from && newRange.to) {
      onFilterChange({ 
        ...localFilters, 
        expiryFrom: newRange.from,
        expiryTo: newRange.to
      });
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      categoryId: 0,
      entityType: 'all',
      priority: 'all',
      sortBy: 'expiryDate',
      sortOrder: 'asc' as 'asc' | 'desc'
    };
    setLocalFilters(clearedFilters);
    setExpiryDateRange({ from: '', to: '' });
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.status !== 'all') count++;
    if (localFilters.categoryId > 0) count++;
    if (localFilters.entityType !== 'all') count++;
    if (localFilters.priority !== 'all') count++;
    if (expiryDateRange.from || expiryDateRange.to) count++;
    return count;
  };

  const sortOptions = [
    { value: 'expiryDate', label: 'Expiry Date' },
    { value: 'createdAt', label: 'Creation Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
  ];

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localFilters.search}
                onChange={handleSearch}
                placeholder="Search documents by title, number, or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
            )}
            
            <button
              onClick={onToggleFilters}
              className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <span className="font-medium">Filters</span>
              {showFilters ? (
                <ChevronUp className="w-5 h-5 text-gray-600 ml-2" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 ml-2" />
              )}
            </button>
            
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 mr-2" />
                <span className="font-medium">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {statusOptions.map(option => (
                      <label
                        key={option.id}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.id}
                          checked={localFilters.status === option.id}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          localFilters.status === option.id 
                            ? 'border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {localFilters.status === option.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${option.color} mr-2`}></div>
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={localFilters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="0">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entity Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity Type
                  </label>
                  <div className="space-y-2">
                    {entityTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <label
                          key={type.id}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="entityType"
                            value={type.id}
                            checked={localFilters.entityType === type.id}
                            onChange={(e) => handleFilterChange('entityType', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            localFilters.entityType === type.id 
                              ? 'border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {localFilters.entityType === type.id && (
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
                            <span className="text-sm text-gray-700">{type.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={localFilters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Advanced Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Expiry Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date Range
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="date"
                          value={expiryDateRange.from}
                          onChange={(e) => handleExpiryDateChange('from', e.target.value)}
                          max={expiryDateRange.to || undefined}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      </div>
                      <div className="relative">
                        <input
                          type="date"
                          value={expiryDateRange.to}
                          onChange={(e) => handleExpiryDateChange('to', e.target.value)}
                          min={expiryDateRange.from || undefined}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <div className="flex space-x-3">
                      <select
                        value={localFilters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleFilterChange('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        {localFilters.sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Quick Filters</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleFilterChange('status', 'EXPIRING_SOON');
                      setLocalFilters(prev => ({ ...prev, status: 'EXPIRING_SOON' }));
                    }}
                    className="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Expiring Soon
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('status', 'EXPIRED');
                      setLocalFilters(prev => ({ ...prev, status: 'EXPIRED' }));
                    }}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Expired
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('priority', 'CRITICAL');
                      setLocalFilters(prev => ({ ...prev, priority: 'CRITICAL' }));
                    }}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Critical Priority
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      const nextWeekStr = nextWeek.toISOString().split('T')[0];
                      
                      setExpiryDateRange({ from: today, to: nextWeekStr });
                      onFilterChange({ 
                        ...localFilters, 
                        expiryFrom: today,
                        expiryTo: nextWeekStr
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Next 7 Days
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}