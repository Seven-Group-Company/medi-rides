'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Upload, 
  Calendar as CalendarIcon,
  AlertCircle,
  Plus,
  Tag,
  User,
  Car,
  Building,
  FileText
} from 'lucide-react';
import { DocumentCategory } from '@/types/document-tracking.types';

interface AddDocumentFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  categories: DocumentCategory[];
  loading: boolean;
}

export default function AddDocumentForm({ 
  onSubmit, 
  onCancel, 
  categories, 
  loading 
}: AddDocumentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    documentNumber: '',
    documentType: '',
    categoryId: '',
    issueDate: '',
    expiryDate: '',
    renewalDate: '',
    entityType: 'VEHICLE',
    entityId: '',
    entityName: '',
    tags: [] as string[],
    notes: '',
    reminderDays: '30',
    priority: 'MEDIUM',
  });

  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors(prev => ({ ...prev, file: 'Please upload a PDF, image, or document file' }));
        return;
      }
      
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.documentNumber.trim()) newErrors.documentNumber = 'Document number is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!file) newErrors.file = 'Document file is required';
    
    // Date validation
    if (formData.issueDate && formData.expiryDate) {
      const issueDate = new Date(formData.issueDate);
      const expiryDate = new Date(formData.expiryDate);
      
      if (expiryDate <= issueDate) {
        newErrors.expiryDate = 'Expiry date must be after issue date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !file) {
      return;
    }

    const submitData = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      entityId: formData.entityId ? parseInt(formData.entityId) : undefined,
      reminderDays: parseInt(formData.reminderDays),
      file: file,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to create document' }));
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Document</h2>
            <p className="text-gray-600 mt-1">
              Track and manage important documents with expiry notifications
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Document Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Vehicle Insurance Certificate"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.documentNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., INS-2024-001"
                />
                {errors.documentNumber && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.documentNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <input
                  type="text"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Insurance, License, Permit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.categoryId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.categoryId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    max={today}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.issueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                {errors.issueDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.issueDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={formData.issueDate || today}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                {errors.expiryDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.expiryDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Associated Entity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Entity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type
                </label>
                <div className="flex space-x-4">
                  {[
                    { value: 'VEHICLE', label: 'Vehicle', icon: Car },
                    { value: 'DRIVER', label: 'Driver', icon: User },
                    { value: 'COMPANY', label: 'Company', icon: Building },
                    { value: 'OTHER', label: 'Other', icon: FileText },
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex-1 cursor-pointer p-3 border rounded-xl text-center transition-all ${
                          formData.entityType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="entityType"
                          value={type.value}
                          checked={formData.entityType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity ID (Optional)
                </label>
                <input
                  type="number"
                  name="entityId"
                  value={formData.entityId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Name (Optional)
                </label>
                <input
                  type="text"
                  name="entityName"
                  value={formData.entityName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Toyota Camry or John Doe"
                />
              </div>
            </div>
          </div>

          {/* Document File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document File <span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
            }`}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium">
                  {file ? file.name : 'Click to upload document'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  PDF, images, Word, Excel (Max 10MB)
                </p>
              </label>
              {file && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ File selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
            {errors.file && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> {errors.file}
              </p>
            )}
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Days
              </label>
              <select
                name="reminderDays"
                value={formData.reminderDays}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="7">7 days before expiry</option>
                <option value="14">14 days before expiry</option>
                <option value="30">30 days before expiry</option>
                <option value="60">60 days before expiry</option>
                <option value="90">90 days before expiry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Add tags..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" /> {errors.submit}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}