'use client';

import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Bell,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentTracking, DocumentCategory } from '@/types/document-tracking.types';
import { format } from 'date-fns';

interface DocumentListProps {
  documents: DocumentTracking[];
  categories: DocumentCategory[];
  selectedDocuments: number[];
  onSelectDocument: (id: number) => void;
  onSelectAll: () => void;
  onViewDetails: (document: DocumentTracking) => void;
  onEdit: (document: DocumentTracking) => void;
  onDelete: (id: number) => void;
  onRenew: (document: DocumentTracking) => void;
  onSendReminder: (id: number) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  loading: boolean;
}

export default function DocumentList({
  documents,
  categories,
  selectedDocuments,
  onSelectDocument,
  onSelectAll,
  onViewDetails,
  onEdit,
  onDelete,
  onRenew,
  onSendReminder,
  pagination,
  onPageChange,
  loading
}: DocumentListProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'VALID':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Valid' };
      case 'EXPIRING_SOON':
        return { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Expiring Soon' };
      case 'EXPIRED':
        return { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Expired' };
      case 'RENEWAL_IN_PROGRESS':
        return { icon: RefreshCw, color: 'bg-blue-100 text-blue-800', label: 'Renewal in Progress' };
      default:
        return { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
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

  const getCategory = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDownload = (doc: DocumentTracking) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-600 mb-6">Get started by adding your first document.</p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
          Add First Document
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedDocuments.length === documents.length && documents.length > 0}
              onChange={onSelectAll}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              {selectedDocuments.length > 0 
                ? `${selectedDocuments.length} selected` 
                : `${documents.length} documents`
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((document) => {
              const StatusIcon = getStatusConfig(document.status).icon;
              const statusColor = getStatusConfig(document.status).color;
              const priorityConfig = getPriorityConfig(document.priority);
              const category = getCategory(document.categoryId);
              const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
              const isExpanded = expandedRow === document.id;

              return (
                <motion.tr
                  key={document.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => onSelectDocument(document.id)}
                        className="h-5 w-5 mt-1 text-blue-600 rounded focus:ring-blue-500"
                      />
                      
                      <div className="ml-4">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{document.title}</h4>
                            <p className="text-sm text-gray-500">{document.documentNumber}</p>
                          </div>
                        </div>
                        
                        {document.entityName && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {document.entityType}: {document.entityName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {category && (
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-900">{category.name}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {format(new Date(document.expiryDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {daysUntilExpiry > 0 
                        ? `${daysUntilExpiry} days remaining`
                        : `${Math.abs(daysUntilExpiry)} days overdue`
                      }
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {getStatusConfig(document.status).label}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${priorityConfig.color} mr-2`} />
                      <span className="text-sm text-gray-900">{priorityConfig.label}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDetails(document)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDownload(document)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEdit(document)}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onRenew(document)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Renew"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(document.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(1)}
                disabled={pagination.page === 1}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}