'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'CSV' | 'PDF' | 'EXCEL') => void;
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'PDF' | 'EXCEL'>('CSV');
  const [includeOptions, setIncludeOptions] = useState({
    includeExpired: true,
    includeExpiringSoon: true,
    includeValid: true,
    includeAllColumns: true,
    includeAttachments: false,
  });
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });

  const formats = [
    {
      id: 'CSV',
      label: 'CSV Format',
      description: 'Comma-separated values, best for data analysis',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'PDF',
      label: 'PDF Format',
      description: 'Portable Document Format, best for printing',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'EXCEL',
      label: 'Excel Format',
      description: 'Microsoft Excel format with formatting',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const columnOptions = [
    { id: 'basic', label: 'Basic Information', defaultChecked: true },
    { id: 'dates', label: 'Date Information', defaultChecked: true },
    { id: 'status', label: 'Status & Priority', defaultChecked: true },
    { id: 'entity', label: 'Entity Information', defaultChecked: true },
    { id: 'category', label: 'Category Details', defaultChecked: true },
    { id: 'notes', label: 'Notes & Tags', defaultChecked: false },
  ];

  const handleExport = () => {
    onExport(selectedFormat);
  };

  const handleIncludeOptionChange = (key: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Export Documents</h3>
              <p className="text-gray-600 mt-1">
                Export selected documents in your preferred format
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Format Selection */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Select Export Format
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formats.map(format => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as any)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${format.bgColor} inline-flex mb-3`}>
                      <Icon className={`w-6 h-6 ${format.color}`} />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">{format.label}</h5>
                    <p className="text-sm text-gray-600">{format.description}</p>
                    {isSelected && (
                      <div className="mt-3 text-sm text-blue-600 font-medium">
                        ✓ Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Options */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range (Optional)
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      min={dateRange.from}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include Documents
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'includeValid', label: 'Valid Documents' },
                    { key: 'includeExpiringSoon', label: 'Expiring Soon' },
                    { key: 'includeExpired', label: 'Expired Documents' },
                  ].map(option => (
                    <label key={option.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeOptions[option.key as keyof typeof includeOptions]}
                        onChange={() => handleIncludeOptionChange(option.key as keyof typeof includeOptions)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Include Columns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {columnOptions.map(column => (
                <label key={column.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={column.defaultChecked}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeOptions.includeAttachments}
                onChange={() => handleIncludeOptionChange('includeAttachments')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">Include Attachments</span>
                <p className="text-xs text-gray-600 mt-1">
                  This will create a ZIP file containing all document files (may take longer)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Export may take a few moments depending on data size
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Documents
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}