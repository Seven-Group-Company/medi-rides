export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  requiresRenewal: boolean;
  renewalPeriodDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTracking {
  id: number;
  title: string;
  description?: string;
  documentNumber: string;
  documentType: string;
  categoryId: number;
  category?: DocumentCategory;
  
  // Dates
  issueDate: string;
  expiryDate: string;
  renewalDate?: string;
  lastReminderSent?: string;
  
  // Status
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWAL_IN_PROGRESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Associated entity (vehicle, driver, etc.)
  entityType: 'VEHICLE' | 'DRIVER' | 'COMPANY' | 'OTHER';
  entityId?: number;
  entityName?: string;
  
  // Files
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  
  // Metadata
  tags: string[];
  notes?: string;
  reminderDays: number; // Days before expiry to send reminders
  
  // Tracking
  createdById: number;
  createdAt: string;
  updatedAt: string;
  updatedById?: number;
  
  // History
  renewalHistory?: DocumentRenewal[];
}

export interface DocumentRenewal {
  id: number;
  documentId: number;
  renewalDate: string;
  expiryDate: string;
  fileUrl: string;
  fileName: string;
  notes?: string;
  createdById: number;
  createdAt: string;
}

export interface CreateDocumentTrackingData {
  title: string;
  description?: string;
  documentNumber: string;
  documentType: string;
  categoryId: number;
  
  issueDate: string;
  expiryDate: string;
  renewalDate?: string;
  
  entityType: 'VEHICLE' | 'DRIVER' | 'COMPANY' | 'OTHER';
  entityId?: number;
  entityName?: string;
  
  file: File;
  
  tags?: string[];
  notes?: string;
  reminderDays?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UpdateDocumentTrackingData {
  title?: string;
  description?: string;
  documentNumber?: string;
  documentType?: string;
  categoryId?: number;
  
  issueDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  
  entityType?: 'VEHICLE' | 'DRIVER' | 'COMPANY' | 'OTHER';
  entityId?: number;
  entityName?: string;
  
  file?: File;
  
  tags?: string[];
  notes?: string;
  reminderDays?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWAL_IN_PROGRESS';
}

export interface DocumentStats {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  renewalInProgress: number;
  
  byCategory: Record<string, number>;
  byEntityType: Record<string, number>;
  byPriority: Record<string, number>;
  
  expiringThisWeek: number;
  expiringThisMonth: number;
  
  recentRenewals: number;
  upcomingRenewals: number;
}

export interface DocumentReminder {
  id: number;
  documentId: number;
  document?: DocumentTracking;
  reminderType: 'EMAIL' | 'SMS' | 'IN_APP';
  sentAt: string;
  recipientEmail?: string;
  recipientPhone?: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  message: string;
  createdAt: string;
}

export interface CreateDocumentCategoryData {
  name: string;
  description?: string;
  color: string;
  icon: string;
  requiresRenewal: boolean;
  renewalPeriodDays: number;
}

export interface UpdateDocumentCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  requiresRenewal?: boolean;
  renewalPeriodDays?: number;
}