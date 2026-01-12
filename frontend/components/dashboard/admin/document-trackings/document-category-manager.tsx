'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  AlertCircle,
  Tag,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { DocumentCategory } from '@/types/document-tracking.types';

interface DocumentCategoryManagerProps {
  categories: DocumentCategory[];
  onCreate: (data: any) => Promise<void>;
  onUpdate: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}

export default function DocumentCategoryManager({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  loading
}: DocumentCategoryManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'Tag',
    requiresRenewal: true,
    renewalPeriodDays: '365'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' },
  ];

  const iconOptions = [
    'Tag', 'FileText', 'Shield', 'Car', 'User', 'Building', 'Briefcase', 'CreditCard',
    'DollarSign', 'Home', 'MapPin', 'Phone', 'Mail', 'Globe', 'Lock', 'Unlock'
  ];

  const handleCreateSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.color) newErrors.color = 'Color is required';
    if (formData.requiresRenewal && !formData.renewalPeriodDays) {
      newErrors.renewalPeriodDays = 'Renewal period is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onCreate({
        ...formData,
        renewalPeriodDays: parseInt(formData.renewalPeriodDays)
      });
      setIsCreating(false);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'Tag',
        requiresRenewal: true,
        renewalPeriodDays: '365'
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateSubmit = async (id: number) => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onUpdate(id, {
        ...formData,
        renewalPeriodDays: parseInt(formData.renewalPeriodDays)
      });
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'Tag',
        requiresRenewal: true,
        renewalPeriodDays: '365'
      });
      setErrors({});
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? This will affect all documents in this category.`)) {
      return;
    }

    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const startEditing = (category: DocumentCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
      requiresRenewal: category.requiresRenewal,
      renewalPeriodDays: category.renewalPeriodDays.toString()
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Document Categories</h3>
            <p className="text-gray-600 mt-1">
              Organize documents into categories for better management
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            disabled={isCreating || loading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId !== null) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-6 border-b border-gray-200 bg-gray-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h4>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setFormData({
                  name: '',
                  description: '',
                  color: '#3B82F6',
                  icon: 'Tag',
                  requiresRenewal: true,
                  renewalPeriodDays: '365'
                });
                setErrors({});
              }}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Insurance, License, Permit"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Brief description of this category"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`aspect-square rounded-lg border-2 ${
                      formData.color === color.value ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              {errors.color && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.color}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresRenewal}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresRenewal: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 font-medium text-gray-900">Requires Renewal</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Documents in this category need to be renewed periodically
                  </p>
                </div>
                
                {formData.requiresRenewal && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="number"
                      value={formData.renewalPeriodDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, renewalPeriodDays: e.target.value }))}
                      min="1"
                      max="3650"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="ml-2 text-gray-600">days</span>
                  </div>
                )}
              </div>
              {errors.renewalPeriodDays && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.renewalPeriodDays}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setFormData({
                  name: '',
                  description: '',
                  color: '#3B82F6',
                  icon: 'Tag',
                  requiresRenewal: true,
                  renewalPeriodDays: '365'
                });
                setErrors({});
              }}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => editingId ? handleUpdateSubmit(editingId) : handleCreateSubmit()}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories List */}
      <div className="divide-y divide-gray-200">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h4>
            <p className="text-gray-600 mb-6">Create your first category to organize documents</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create First Category
            </button>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
              {editingId === category.id ? (
                // Edit form is already shown above
                null
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {category.requiresRenewal ? 'Renewable' : 'Non-renewable'}
                        </span>
                        {category.requiresRenewal && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded flex items-center">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Every {category.renewalPeriodDays} days
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(category)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}