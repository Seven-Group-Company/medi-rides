import { useState, useEffect, useCallback } from 'react';
import { 
  DocumentTracking, 
  CreateDocumentTrackingData, 
  UpdateDocumentTrackingData,
  DocumentStats,
  DocumentCategory,
  CreateDocumentCategoryData,
  UpdateDocumentCategoryData
} from '@/types/document-tracking.types';
import { DocumentTrackingService } from '@/services/document-tracking.service';

interface UseDocumentTrackingsProps {
  initialFilters?: {
    status?: string;
    categoryId?: number;
    entityType?: string;
    entityId?: number;
    search?: string;
  };
  pageSize?: number;
}

export const useDocumentTrackings = (props?: UseDocumentTrackingsProps) => {
  const { initialFilters = {}, pageSize = 20 } = props || {};
  
  const [documents, setDocuments] = useState<DocumentTracking[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState({
    documents: true,
    categories: true,
    stats: true,
    action: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    categoryId: 0,
    entityType: 'all',
    priority: 'all',
    sortBy: 'expiryDate',
    sortOrder: 'asc' as 'asc' | 'desc',
    ...initialFilters
  });

  // Selected documents for bulk actions
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, documents: true, categories: true, stats: true }));
      setError(null);

      await Promise.all([
        fetchDocuments(),
        fetchCategories(),
        fetchStats()
      ]);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(prev => ({ ...prev, documents: false, categories: false, stats: false }));
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch documents with filters
  const fetchDocuments = useCallback(async () => {
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      if (filters.search) params.search = filters.search;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.categoryId > 0) params.categoryId = filters.categoryId;
      if (filters.entityType !== 'all') params.entityType = filters.entityType;
      if (filters.priority !== 'all') params.priority = filters.priority;

      const result = await DocumentTrackingService.getAllDocuments(params);
      setDocuments(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit)
      }));
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      throw err;
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await DocumentTrackingService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      throw err;
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await DocumentTrackingService.getDocumentStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      throw err;
    }
  }, []);

  // Document actions
  const createDocument = useCallback(async (documentData: CreateDocumentTrackingData) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const result = await DocumentTrackingService.createDocument(documentData);
      await fetchAllData();
      return result;
    } catch (err: any) {
      console.error('Error creating document:', err);
      setError(err.message || 'Failed to create document');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  const updateDocument = useCallback(async (id: number, documentData: UpdateDocumentTrackingData) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const result = await DocumentTrackingService.updateDocument(id, documentData);
      await fetchAllData();
      return result;
    } catch (err: any) {
      console.error('Error updating document:', err);
      setError(err.message || 'Failed to update document');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  const deleteDocument = useCallback(async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      await DocumentTrackingService.deleteDocument(id);
      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  const renewDocument = useCallback(async (id: number, renewalData: any) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const result = await DocumentTrackingService.renewDocument(id, renewalData);
      await fetchAllData();
      return result;
    } catch (err: any) {
      console.error('Error renewing document:', err);
      setError(err.message || 'Failed to renew document');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  const sendReminder = useCallback(async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      await DocumentTrackingService.sendReminder(id);
    } catch (err: any) {
      console.error('Error sending reminder:', err);
      setError(err.message || 'Failed to send reminder');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, []);

  // Category actions
  const createCategory = useCallback(async (categoryData: CreateDocumentCategoryData) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const result = await DocumentTrackingService.createCategory(categoryData);
      await fetchAllData();
      return result;
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  const updateCategory = useCallback(async (id: number, categoryData: UpdateDocumentCategoryData) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const result = await DocumentTrackingService.updateCategory(id, categoryData);
      await fetchAllData();
      return result;
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      await DocumentTrackingService.deleteCategory(id);
      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  // Bulk actions
  const bulkUpdateStatus = useCallback(async (ids: number[], status: string) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      await DocumentTrackingService.bulkUpdateStatus(ids, status);
      await fetchAllData();
    } catch (err: any) {
      console.error('Error bulk updating status:', err);
      setError(err.message || 'Failed to update status');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [fetchAllData]);

  const exportDocuments = useCallback(async (format: 'CSV' | 'PDF' | 'EXCEL') => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const blob = await DocumentTrackingService.exportDocuments(format, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents_export_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error exporting documents:', err);
      setError(err.message || 'Failed to export documents');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [filters]);

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handleSelectDocument = useCallback((id: number) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
    }
  }, [documents, selectedDocuments.length]);

  // Calculate document status based on expiry date
  const calculateDocumentStatus = useCallback((expiryDate: string, reminderDays: number = 30) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= reminderDays) return 'EXPIRING_SOON';
    return 'VALID';
  }, []);

  // Get documents by status
  const getDocumentsByStatus = useCallback((status: string) => {
    return documents.filter(doc => doc.status === status);
  }, [documents]);

  // Get expiring documents (within X days)
  const getExpiringDocuments = useCallback((days: number = 30) => {
    const today = new Date();
    return documents.filter(doc => {
      const expiry = new Date(doc.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= days && diffDays >= 0;
    });
  }, [documents]);

  // Initialize
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    // State
    documents,
    categories,
    stats,
    loading,
    error,
    filters,
    pagination,
    selectedDocuments,
    
    // Actions
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
    
    // Filter handlers
    handleFilterChange,
    handlePageChange,
    handleSelectDocument,
    handleSelectAll,
    
    // Utilities
    calculateDocumentStatus,
    getDocumentsByStatus,
    getExpiringDocuments,
    
    // Refetch
    refetch: fetchAllData,
    refetchDocuments: fetchDocuments,
    refetchCategories: fetchCategories,
    refetchStats: fetchStats,
  };
};