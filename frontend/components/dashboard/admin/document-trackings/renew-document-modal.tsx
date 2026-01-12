'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Upload, 
  Calendar as CalendarIcon,
  AlertCircle,
  RefreshCw,
  FileText,
  Check
} from 'lucide-react';
import { DocumentTracking } from '@/types/document-tracking.types';
import { format } from 'date-fns';

interface RenewDocumentModalProps {
  document: DocumentTracking;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export default function RenewDocumentModal({
  document,
  isOpen,
  onClose,
  onSubmit,
  loading
}: RenewDocumentModalProps) {
  const [formData, setFormData] = useState({
    renewalDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate suggested expiry date (current expiry date + 1 year)
  const calculateSuggestedExpiry = () => {
    const currentExpiry = new Date(document.expiryDate);
    const newExpiry = new Date(currentExpiry);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    return newExpiry.toISOString().split('T')[0];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors(prev => ({ ...prev, file: 'Please upload a PDF, image, or Word document' }));
        return;
      }
      
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSetSuggestedExpiry = () => {
    const suggestedExpiry = calculateSuggestedExpiry();
    setFormData(prev => ({ ...prev, expiryDate: suggestedExpiry }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.renewalDate) newErrors.renewalDate = 'Renewal date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'New expiry date is required';
    if (!file) newErrors.file = 'Renewed document file is required';
    
    // Date validation
    if (formData.renewalDate && formData.expiryDate) {
      const renewalDate = new Date(formData.renewalDate);
      const expiryDate = new Date(formData.expiryDate);
      
      if (expiryDate <= renewalDate) {
        newErrors.expiryDate = 'New expiry date must be after renewal date';
      }
      
      const today = new Date();
      if (renewalDate < today) {
        newErrors.renewalDate = 'Renewal date cannot be in the past';
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

    try {
      await onSubmit({
        renewalDate: formData.renewalDate,
        expiryDate: formData.expiryDate,
        file: file,
        notes: formData.notes,
      });
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to renew document' }));
    }
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const currentExpiry = new Date(document.expiryDate);

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Renew Document</h3>
              <p className="text-gray-600 mt-1">
                Renew {document.title} ({document.documentNumber})
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Current Document Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Current Document Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700">Current Expiry:</span>
                <span className="ml-2 font-medium">{format(currentExpiry, 'MMM dd, yyyy')}</span>
              </div>
              <div>
                <span className="text-blue-700">Days Remaining:</span>
                <span className="ml-2 font-medium">
                  {Math.ceil((currentExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-blue-700">Category:</span>
                <span className="ml-2 font-medium">{document.category?.name}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Renewal Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renewal Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="renewalDate"
                  value={formData.renewalDate}
                  onChange={handleInputChange}
                  max={today}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.renewalDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
              {errors.renewalDate && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.renewalDate}
                </p>
              )}
            </div>

            {/* New Expiry Date */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Expiry Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSetSuggestedExpiry}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Set to +1 year
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={formData.renewalDate || today}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Select new expiry date"
                />
                <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
              {errors.expiryDate && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.expiryDate}
                </p>
              )}
            </div>

            {/* Renewed Document File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renewed Document File <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
              }`}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                  className="hidden"
                  id="renewal-file-upload"
                />
                <label htmlFor="renewal-file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium">
                    {file ? file.name : 'Upload renewed document'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Upload the renewed/updated document file
                  </p>
                </label>
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      File selected: {file.name}
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renewal Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Add any notes about this renewal..."
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
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Complete Renewal
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}