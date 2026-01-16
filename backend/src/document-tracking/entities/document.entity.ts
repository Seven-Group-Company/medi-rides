import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DocumentStatus,
  Priority,
  EntityType,
  DocumentCategory as PrismaCategory,
  DocumentTracking as PrismaDocument,
  DocumentRenewal as PrismaRenewal,
  DocumentReminder as PrismaReminder,
} from '@prisma/client';

export class DocumentCategory implements Partial<PrismaCategory> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  requiresRenewal: boolean;

  @ApiProperty()
  renewalPeriodDays: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => [DocumentTracking] })
  documents?: DocumentTracking[];
}

export class DocumentTracking {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  documentNumber: string;

  @ApiPropertyOptional()
  documentType?: string;

  @ApiProperty()
  categoryId: number;

  @ApiProperty({ type: () => DocumentCategory })
  category?: DocumentCategory;

  @ApiProperty()
  issueDate: Date;

  @ApiProperty()
  expiryDate: Date;

  @ApiPropertyOptional()
  renewalDate?: Date;

  @ApiPropertyOptional()
  lastReminderSent?: Date;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty({ enum: Priority })
  priority: Priority;

  @ApiProperty({ enum: EntityType })
  entityType: EntityType;

  @ApiPropertyOptional()
  entityId?: number;

  @ApiPropertyOptional()
  entityName?: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  fileType: string;

  @ApiProperty({ type: [String] })
  tags: string | string[];

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  reminderDays: number;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  updatedById?: number;

  @ApiPropertyOptional({ type: () => [DocumentRenewal] })
  renewals?: DocumentRenewal[];

  @ApiPropertyOptional({ type: () => [DocumentReminder] })
  reminders?: DocumentReminder[];
}

export class DocumentRenewal implements Partial<PrismaRenewal> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  documentId: number;

  @ApiPropertyOptional({ type: () => DocumentTracking })
  document?: DocumentTracking;

  @ApiProperty()
  renewalDate: Date;

  @ApiProperty()
  expiryDate: Date;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  fileName: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  createdAt: Date;
}

export class DocumentReminder implements Partial<PrismaReminder> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  documentId: number;

  @ApiPropertyOptional({ type: () => DocumentTracking })
  document?: DocumentTracking;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'IN_APP'] })
  reminderType: 'EMAIL' | 'SMS' | 'IN_APP';

  @ApiProperty()
  sentAt: Date;

  @ApiPropertyOptional()
  recipientEmail?: string;

  @ApiPropertyOptional()
  recipientPhone?: string;

  @ApiProperty({ enum: ['PENDING', 'SENT', 'FAILED'] })
  status: 'PENDING' | 'SENT' | 'FAILED';

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  createdAt: Date;
}

export class DocumentStats {
  @ApiProperty()
  total: number;

  @ApiProperty()
  valid: number;

  @ApiProperty()
  expiringSoon: number;

  @ApiProperty()
  expired: number;

  @ApiProperty()
  renewalInProgress: number;

  @ApiProperty({ type: Object, additionalProperties: { type: 'number' } })
  byCategory: Record<string, number>;

  @ApiProperty({ type: Object, additionalProperties: { type: 'number' } })
  byEntityType: Record<string, number>;

  @ApiProperty({ type: Object, additionalProperties: { type: 'number' } })
  byPriority: Record<string, number>;

  @ApiProperty()
  expiringThisWeek: number;

  @ApiProperty()
  expiringThisMonth: number;

  @ApiProperty()
  recentRenewals: number;

  @ApiProperty()
  upcomingRenewals: number;
}

export class PaginatedDocuments {
  @ApiProperty({ type: [DocumentTracking] })
  data: DocumentTracking[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}