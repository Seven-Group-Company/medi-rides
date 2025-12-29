'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Stethoscope, Car, ShoppingCart, Plane, Type } from 'lucide-react';
import { ServiceCategoriesService, ServiceCategory } from '@/services/service-categories.service';

interface ServiceCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: ServiceCategory | null;
}

const iconOptions = [
  { value: 'Stethoscope', label: 'Medical', icon: Stethoscope },
  { value: 'Car', label: 'Vehicle', icon: Car },
  { value: 'ShoppingCart', label: 'Shopping', icon: ShoppingCart },
  { value: 'Plane', label: 'Travel', icon: Plane },
  { value: 'Type', label: 'Other', icon: Type },
];

export default function ServiceCategoryModal({ isOpen, onClose, onSuccess, category }: ServiceCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: '',
    icon: 'Type',
    isActive: true,
    basePrice: 15.00,
    pricePerMile: 1.50,
    serviceType: 'GENERAL' as 'MEDICAL' | 'GENERAL',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        value: category.value,
        description: category.description || '',
        icon: category.icon || 'Type',
        isActive: category.isActive,
        basePrice: category.basePrice,
        pricePerMile: category.pricePerMile,
        serviceType: category.serviceType,
      });
    } else {
      setFormData({
        name: '',
        value: '',
        description: '',
        icon: 'Type',
        isActive: true,
        basePrice: 15.00,
        pricePerMile: 1.50,
        serviceType: 'GENERAL',
      });
    }
    setError(null);
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category) {
        await ServiceCategoriesService.update(category.id, formData);
      } else {
        await ServiceCategoriesService.create(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'Failed to save service category');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Service Category' : 'Add Service Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Medical Appointment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Value *
            </label>
            <input
              type="text"
              required
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="medical-appointment"
            />
            <p className="text-xs text-gray-500 mt-1">Used for internal reference (lowercase, hyphens)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Doctor visits, hospital appointments..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('icon', option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mx-auto" />
                    <span className="text-xs mt-1 block">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Base Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => handleChange('basePrice', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Price per Mile ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.pricePerMile}
                onChange={(e) => handleChange('pricePerMile', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="hidden grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Service Type
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => handleChange('serviceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="GENERAL">General</option>
                <option value="MEDICAL">Medical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.isActive.toString()}
                onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}