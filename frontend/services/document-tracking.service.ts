import { 
  DocumentTracking, 
  CreateDocumentTrackingData, 
  UpdateDocumentTrackingData,
  DocumentStats,
  DocumentCategory,
  CreateDocumentCategoryData,
  UpdateDocumentCategoryData,
  DocumentRenewal
} from '@/types/document-tracking.types';

export class DocumentTrackingService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/document-trackings`;
  private static categoriesUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/document-trackings/categories`;

  private static getToken(): string {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

static async createDocument(documentData: CreateDocumentTrackingData): Promise<DocumentTracking> {
  const token = this.getToken();
  const formData = new FormData();

  // Append document data (explicitly exclude file property)
  const { file, ...data } = documentData;
  
  // Ensure all required fields are present and clean up undefined values
  const cleanData: any = {
    title: data.title,
    description: data.description || undefined,
    documentNumber: data.documentNumber,
    documentType: data.documentType || undefined,
    categoryId: data.categoryId,
    issueDate: data.issueDate,
    expiryDate: data.expiryDate,
    ...(data.renewalDate && data.renewalDate.trim() !== '' && { renewalDate: data.renewalDate }),
    entityType: data.entityType,
    ...(data.entityId && { entityId: data.entityId }),
    entityName: data.entityName || undefined,
    tags: data.tags || [],
    notes: data.notes || undefined,
    reminderDays: data.reminderDays || 30,
    priority: data.priority || 'MEDIUM'
  };

  // Append document data as JSON string
  formData.append('documentData', JSON.stringify(cleanData));
  
  // IMPORTANT: Append the file with the correct field name
  if (file) {
    formData.append('file', file, file.name); // Add filename as third parameter
  } else {
    throw new Error('Document file is required');
  }

  console.log('FormData entries:'); // Debug log
  for (let [key, value] of (formData as any).entries()) {
    console.log(key, value);
  }

  const response = await fetch(this.baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set Content-Type header for FormData, browser will set it automatically
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to create document: ${response.status}`);
  }

  return response.json();
}

  static async getAllDocuments(params?: {
    status?: string;
    categoryId?: number;
    entityType?: string;
    entityId?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: DocumentTracking[]; total: number; page: number; limit: number }> {
    const token = this.getToken();
    
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString() 
      ? `${this.baseUrl}?${queryParams.toString()}`
      : this.baseUrl;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    // Backend wraps the paginated data in { success, data }
    const result = await response.json();
    return result.data;
  }

  static async getDocumentStats(): Promise<DocumentStats> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document stats');
    }

    const result = await response.json();
    return result.data;
  }

  static async getDocumentById(id: number): Promise<DocumentTracking> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    const result = await response.json();
    return result.data;
  }

// In document-tracking.service.ts, fix the updateDocument method:
static async updateDocument(id: number, documentData: UpdateDocumentTrackingData): Promise<DocumentTracking> {
  const token = this.getToken();
  const formData = new FormData();

  // Create a clean data object without the file property
  const { file, ...dataWithoutFile } = documentData;

  // Clean up the data object to ensure no file-related properties are in the JSON
  const cleanData: any = {
    title: dataWithoutFile.title,
    description: dataWithoutFile.description || undefined,
    documentNumber: dataWithoutFile.documentNumber,
    documentType: dataWithoutFile.documentType || undefined,
    categoryId: dataWithoutFile.categoryId,
    issueDate: dataWithoutFile.issueDate,
    expiryDate: dataWithoutFile.expiryDate,
    ...(dataWithoutFile.renewalDate && dataWithoutFile.renewalDate.trim() !== '' && { renewalDate: dataWithoutFile.renewalDate }),
    entityType: dataWithoutFile.entityType,
    ...(dataWithoutFile.entityId && { entityId: dataWithoutFile.entityId }),
    entityName: dataWithoutFile.entityName || undefined,
    tags: dataWithoutFile.tags || [],
    notes: dataWithoutFile.notes || undefined,
    reminderDays: dataWithoutFile.reminderDays || 30,
    priority: dataWithoutFile.priority || 'MEDIUM'
  };

  // Remove any file-related properties that might have been included
  delete cleanData.file;
  delete cleanData.fileUrl;
  delete cleanData.fileName;
  delete cleanData.fileSize;
  delete cleanData.fileType;

  formData.append('documentData', JSON.stringify(cleanData));
  
  // Only append file if it exists and is an actual File object
  if (file instanceof File) {
    formData.append('file', file, file.name);
  }

  console.log('Update FormData entries:'); // Debug log
  for (let [key, value] of (formData as any).entries()) {
    console.log(key, value instanceof File ? `${value.name} (File)` : value);
  }

  const response = await fetch(`${this.baseUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to update document: ${response.status}`);
  }

  return response.json();
}

  static async deleteDocument(id: number): Promise<void> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to delete document: ${response.status}`);
    }
  }

  static async renewDocument(id: number, renewalData: {
    renewalDate: string;
    expiryDate: string;
    file: File;
    notes?: string;
  }): Promise<DocumentRenewal> {
    const token = this.getToken();
    const formData = new FormData();

    formData.append('renewalData', JSON.stringify({
      renewalDate: renewalData.renewalDate,
      expiryDate: renewalData.expiryDate,
      notes: renewalData.notes
    }));
    formData.append('file', renewalData.file);

    const response = await fetch(`${this.baseUrl}/${id}/renew`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to renew document: ${response.status}`);
    }

    return response.json();
  }

  static async getDocumentRenewals(id: number): Promise<DocumentRenewal[]> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/${id}/renewals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document renewals');
    }

    const result = await response.json();
    return result.data;
  }

  static async updateDocumentStatus(id: number, status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWAL_IN_PROGRESS'): Promise<void> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update document status: ${response.status}`);
    }
  }

  static async sendReminder(id: number): Promise<void> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/${id}/send-reminder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to send reminder: ${response.status}`);
    }
  }

  // Category Management Methods
  static async getAllCategories(): Promise<DocumentCategory[]> {
    const token = this.getToken();
    
    const response = await fetch(this.categoriesUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result = await response.json();
    return result.data;
  }

  static async createCategory(categoryData: CreateDocumentCategoryData): Promise<DocumentCategory> {
    const token = this.getToken();
    
    const response = await fetch(this.categoriesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create category: ${response.status}`);
    }

    return response.json();
  }

  static async updateCategory(id: number, categoryData: UpdateDocumentCategoryData): Promise<DocumentCategory> {
    const token = this.getToken();
    
    const response = await fetch(`${this.categoriesUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update category: ${response.status}`);
    }

    return response.json();
  }

  static async deleteCategory(id: number): Promise<void> {
    const token = this.getToken();
    
    const response = await fetch(`${this.categoriesUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to delete category: ${response.status}`);
    }
  }

  // Bulk Operations
  static async bulkUpdateStatus(ids: number[], status: string): Promise<void> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/bulk/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ids, status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to bulk update status: ${response.status}`);
    }
  }

  static async exportDocuments(format: 'CSV' | 'PDF' | 'EXCEL', filters?: any): Promise<Blob> {
    const token = this.getToken();
    
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/export?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export documents');
    }

    return response.blob();
  }

  // Dashboard Analytics
  static async getExpiryTimeline(days: number = 90): Promise<any> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/analytics/expiry-timeline?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expiry timeline');
    }

    return response.json();
  }

  static async getCategoryAnalytics(): Promise<any> {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseUrl}/analytics/by-category`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category analytics');
    }

    return response.json();
  }
}