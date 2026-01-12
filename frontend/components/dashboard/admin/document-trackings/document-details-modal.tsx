'use client';

import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  Calendar, 
  FileText, 
  User, 
  Car, 
  Building,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Bell,
  Edit2,
  Trash2,
  Mail
} from 'lucide-react';
import { DocumentTracking } from '@/types/document-tracking.types';
import { format, formatDistanceToNow } from 'date-fns';

interface DocumentDetailsModalProps {
  document: DocumentTracking;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRenew: () => void;
  onDelete: (id: number) => void;
  onSendReminder: () => void;
}

export default function DocumentDetailsModal({
  document: doc,
  isOpen,
  onClose,
  onEdit,
  onRenew,
  onDelete,
  onSendReminder
}: DocumentDetailsModalProps) {
  if (!isOpen) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'VALID':
        return { 
          icon: CheckCircle, 
          color: 'bg-green-100 text-green-800',
          label: 'Valid',
          description: 'Document is currently active'
        };
      case 'EXPIRING_SOON':
        return { 
          icon: AlertCircle, 
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Expiring Soon',
          description: 'Document is expiring soon'
        };
      case 'EXPIRED':
        return { 
          icon: AlertCircle, 
          color: 'bg-red-100 text-red-800',
          label: 'Expired',
          description: 'Document has expired'
        };
      case 'RENEWAL_IN_PROGRESS':
        return { 
          icon: RefreshCw, 
          color: 'bg-blue-100 text-blue-800',
          label: 'Renewal in Progress',
          description: 'Document renewal is being processed'
        };
      default:
        return { 
          icon: Clock, 
          color: 'bg-gray-100 text-gray-800',
          label: 'Unknown',
          description: 'Unknown status'
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return { color: 'bg-red-500', label: 'Critical' };
      case 'HIGH':
        return { color: 'bg-orange-500', label: 'High' };
      case 'MEDIUM':
        return { color: 'bg-yellow-500', label: 'Medium' };
      case 'LOW':
        return { color: 'bg-green-500', label: 'Low' };
      default:
        return { color: 'bg-gray-500', label: 'Unknown' };
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'VEHICLE': return Car;
      case 'DRIVER': return User;
      case 'COMPANY': return Building;
      default: return FileText;
    }
  };

  const statusConfig = getStatusConfig(doc.status);
  const priorityConfig = getPriorityConfig(doc.priority);
  const EntityIcon = getEntityIcon(doc.entityType);
  const StatusIcon = statusConfig.icon;

  const calculateDaysUntilExpiry = () => {
    const expiryDate = new Date(doc.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFile = () => {
    window.open(doc.fileUrl, '_blank');
  };

  const daysUntilExpiry = calculateDaysUntilExpiry();
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${statusConfig.color}`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{doc.title}</h3>
                <p className="text-gray-600">{doc.documentNumber}</p>
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Document Details */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status & Priority */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        <span className="font-medium">{statusConfig.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{statusConfig.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${priorityConfig.color} mr-2`} />
                        <span className="font-medium text-gray-900">{priorityConfig.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Dates</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Issue Date
                      </div>
                      <p className="font-medium">
                        {format(new Date(doc.issueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Expiry Date
                      </div>
                      <p className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                        {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
                        <span className="ml-2 text-sm font-normal">
                          ({isExpired ? 'Expired ' : ''}{Math.abs(daysUntilExpiry)} days {isExpired ? 'ago' : 'remaining'})
                        </span>
                      </p>
                    </div>
                    {doc.renewalDate && (
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Last Renewal
                        </div>
                        <p className="font-medium">
                          {format(new Date(doc.renewalDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Type */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Category & Type</h4>
                  <div className="space-y-4">
                    {doc.category && (
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Tag className="w-4 h-4 mr-2" />
                          Category
                        </div>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: doc.category.color }}
                          />
                          <span className="font-medium">{doc.category.name}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Document Type</div>
                      <p className="font-medium">{doc.documentType || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Associated Entity */}
                {doc.entityName && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Associated Entity</h4>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="p-3 bg-white rounded-lg border border-gray-200 mr-4">
                          <EntityIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="font-medium text-gray-900">{doc.entityName}</span>
                            <span className="ml-3 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {doc.entityType}
                            </span>
                          </div>
                          {doc.entityId && (
                            <p className="text-sm text-gray-600">ID: {doc.entityId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {doc.notes && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-700">{doc.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - File & Actions */}
            <div>
              {/* Document File */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Document File</h4>
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-center">
                    <p className="font-medium text-gray-900 truncate">{doc.fileName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={handleViewFile}
                      className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={onEdit}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Edit2 className="w-4 h-4 mr-3 text-gray-600" />
                      <span>Edit Document</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={onRenew}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-3" />
                      <span>Renew Document</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={onSendReminder}
                    className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Bell className="w-4 h-4 mr-3" />
                      <span>Send Reminder</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="w-full px-4 py-3 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Trash2 className="w-4 h-4 mr-3" />
                      <span>Delete Document</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Metadata</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">
                      {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-900">
                      {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reminder Days</span>
                    <span className="text-gray-900">{doc.reminderDays} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}