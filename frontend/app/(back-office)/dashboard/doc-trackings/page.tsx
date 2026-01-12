'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Users,
  Car,
  Building,
  Tag,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bell,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTrackings } from '@/hooks/useDocumentTrackings';
import DocumentStatsCards from '@/components/dashboard/admin/document-trackings/document-stats-cards';
import DocumentList from '@/components/dashboard/admin/document-trackings/document-list';
import AddDocumentForm from '@/components/dashboard/admin/document-trackings/add-document-form';
import DocumentFilters from '@/components/dashboard/admin/document-trackings/document-filters';
import DocumentCategoryManager from '@/components/dashboard/admin/document-trackings/document-category-manager';
import BulkActions from '@/components/dashboard/admin/document-trackings/bulk-actions';
import ExportModal from '@/components/dashboard/admin/document-trackings/export-modal';
import RenewDocumentModal from '@/components/dashboard/admin/document-trackings/renew-document-modal';
import DocumentDetailsModal from '@/components/dashboard/admin/document-trackings/document-details-modal';
import EditDocumentForm from '@/components/dashboard/admin/document-trackings/edit-document-form';
import { 
  DocumentTracking, 
} from '@/types/document-tracking.types';

export default function DocTrackingsDashboardPage() {
  const [activeView, setActiveView] = useState<'list' | 'categories' | 'analytics'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentTracking | null>(null);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentTracking | null>(null);
  const [documentToRenew, setDocumentToRenew] = useState<DocumentTracking | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const {
    documents,
    categories,
    stats,
    loading,
    error,
    filters,
    pagination,
    selectedDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    renewDocument,
    sendReminder,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkUpdateStatus,
    exportDocuments,
    handleFilterChange,
    handlePageChange,
    handleSelectDocument,
    handleSelectAll,
    refetch,
    getExpiringDocuments
  } = useDocumentTrackings();

  // Calculate urgent documents
  const urgentDocuments = useMemo(() => {
    return getExpiringDocuments(7); // Documents expiring in 7 days
  }, [documents, getExpiringDocuments]);

  // Handle document creation
  const handleCreateDocument = async (documentData: any) => {
    try {
      await createDocument(documentData);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  // Handle document update
  const handleUpdateDocument = async (id: number, documentData: any) => {
    try {
      await updateDocument(id, documentData);
      setDocumentToEdit(null);
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDocument(id);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  // Handle document renewal
  const handleRenewDocument = async (renewalData: any) => {
    if (!documentToRenew) return;

    try {
      await renewDocument(documentToRenew.id, renewalData);
      setDocumentToRenew(null);
    } catch (error) {
      console.error('Failed to renew document:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedDocuments.length === 0) return;

    try {
      await bulkUpdateStatus(selectedDocuments, status);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to update document status:', error);
    }
  };

  // Handle export
  const handleExport = async (format: 'CSV' | 'PDF' | 'EXCEL') => {
    try {
      await exportDocuments(format);
      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export documents:', error);
    }
  };

  // Handle send reminder
  const handleSendReminder = async () => {
    if (!selectedDocument) return;

    try {
      await sendReminder(selectedDocument.id);
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  // Views configuration
  const views = [
    { id: 'list', label: 'Documents', icon: FileText, color: 'text-blue-600' },
    { id: 'categories', label: 'Categories', icon: Tag, color: 'text-purple-600' },
  ];

  // Entity type options
  const entityTypes = [
    { id: 'all', label: 'All Entities', icon: null },
    { id: 'VEHICLE', label: 'Vehicles', icon: Car },
    { id: 'DRIVER', label: 'Drivers', icon: Users },
    { id: 'COMPANY', label: 'Company', icon: Building },
    { id: 'OTHER', label: 'Other', icon: FileText },
  ];

  // Priority options
  const priorityOptions = [
    { id: 'all', label: 'All Priorities', color: 'bg-gray-200' },
    { id: 'CRITICAL', label: 'Critical', color: 'bg-red-500' },
    { id: 'HIGH', label: 'High', color: 'bg-orange-500' },
    { id: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
    { id: 'LOW', label: 'Low', color: 'bg-green-500' },
  ];

  // Status options
  const statusOptions = [
    { id: 'all', label: 'All Status', color: 'bg-gray-200' },
    { id: 'VALID', label: 'Valid', color: 'bg-green-500' },
    { id: 'EXPIRING_SOON', label: 'Expiring Soon', color: 'bg-yellow-500' },
    { id: 'EXPIRED', label: 'Expired', color: 'bg-red-500' },
    { id: 'RENEWAL_IN_PROGRESS', label: 'Renewal in Progress', color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Tracking</h1>
              <p className="text-gray-600 mt-2">
                Manage and track all your important documents with expiry notifications
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedDocuments.length > 0 && (
                <BulkActions
                  selectedCount={selectedDocuments.length}
                  onStatusUpdate={handleBulkStatusUpdate}
                  onExport={() => setShowExportModal(true)}
                  onClose={() => setShowBulkActions(false)}
                  isOpen={showBulkActions}
                />
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Document
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && activeView === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <DocumentStatsCards stats={stats} urgentCount={urgentDocuments.length} />
          </motion.div>
        )}

        {/* View Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white rounded-xl border border-gray-200 p-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-2 ${view.color}`} />
                  <span className="font-medium">{view.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Urgent Alerts */}
        {urgentDocuments.length > 0 && activeView === 'list' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <ShieldAlert className="w-5 h-5 text-red-600 mr-2" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Urgent Attention Required!</p>
                <p className="text-sm text-red-700">
                  {urgentDocuments.length} document(s) are expiring within 7 days. Please review and renew.
                </p>
              </div>
              <button
                onClick={() => handleFilterChange({ status: 'EXPIRING_SOON' })}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                View Urgent
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {activeView === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <DocumentFilters
              filters={filters}
              categories={categories}
              entityTypes={entityTypes}
              statusOptions={statusOptions}
              priorityOptions={priorityOptions}
              onFilterChange={handleFilterChange}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {loading.documents ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            </motion.div>
          ) : showAddForm ? (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AddDocumentForm
                onSubmit={handleCreateDocument}
                onCancel={() => setShowAddForm(false)}
                categories={categories}
                loading={loading.action}
              />
            </motion.div>
          ) : documentToEdit ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <EditDocumentForm
                document={documentToEdit}
                onSubmit={(data) => handleUpdateDocument(documentToEdit.id, data)}
                onCancel={() => setDocumentToEdit(null)}
                categories={categories}
                loading={loading.action}
              />
            </motion.div>
          ) : activeView === 'categories' ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <DocumentCategoryManager
                categories={categories}
                onCreate={async (data) => { await createCategory(data); }}
                onUpdate={async (id, data) => { await updateCategory(id, data); }}
                onDelete={async (id) => { await deleteCategory(id); }}
                loading={loading.action}
              />
            </motion.div>
          ) : activeView === 'analytics' ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Analytics</h3>
                <p className="text-gray-600">Analytics view will be implemented here with charts and graphs.</p>
                {/* Placeholder for analytics charts */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Expiry Timeline Chart</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Category Distribution</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="document-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <DocumentList
                documents={documents}
                categories={categories}
                selectedDocuments={selectedDocuments}
                onSelectDocument={handleSelectDocument}
                onSelectAll={handleSelectAll}
                onViewDetails={setSelectedDocument}
                onEdit={setDocumentToEdit}
                onDelete={handleDeleteDocument}
                onRenew={setDocumentToRenew}
                onSendReminder={handleSendReminder}
                pagination={pagination}
                onPageChange={handlePageChange}
                loading={loading.action}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedDocument && (
          <DocumentDetailsModal
            document={selectedDocument}
            isOpen={!!selectedDocument}
            onClose={() => setSelectedDocument(null)}
            onEdit={() => {
              setDocumentToEdit(selectedDocument);
              setSelectedDocument(null);
            }}
            onRenew={() => {
              setDocumentToRenew(selectedDocument);
              setSelectedDocument(null);
            }}
            onDelete={() => handleDeleteDocument(selectedDocument.id)}
            onSendReminder={handleSendReminder}
          />
        )}

        {documentToRenew && (
          <RenewDocumentModal
            document={documentToRenew}
            isOpen={!!documentToRenew}
            onClose={() => setDocumentToRenew(null)}
            onSubmit={handleRenewDocument}
            loading={loading.action}
          />
        )}

        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
          />
        )}
      </AnimatePresence>
    </div>
  );
}