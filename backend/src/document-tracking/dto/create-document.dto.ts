import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EntityType,
  Priority,
  DocumentStatus,
} from '@prisma/client';

export enum DocumentSortBy {
  id = 'id',
  title = 'title',
  documentNumber = 'documentNumber',
  issueDate = 'issueDate',
  expiryDate = 'expiryDate',
  status = 'status',
  priority = 'priority',
  entityType = 'entityType',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Document number (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiPropertyOptional({ description: 'Document type' })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ description: 'Issue date (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ description: 'Expiry date (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({ description: 'Renewal date (ISO string)' })
  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @ApiProperty({ enum: EntityType, default: EntityType.OTHER })
  @IsEnum(EntityType)
  @IsOptional()
  entityType: EntityType = EntityType.OTHER;

  @ApiPropertyOptional({ description: 'Associated entity ID' })
  @IsOptional()
  @IsNumber()
  entityId?: number;

  @ApiPropertyOptional({ description: 'Associated entity name' })
  @IsOptional()
  @IsString()
  entityName?: string;

  @ApiPropertyOptional({ 
    description: 'Tags for categorization',
    type: [String],
    example: ['insurance', 'vehicle']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Days before expiry to send reminders', default: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  reminderDays: number = 30;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM })
  @IsEnum(Priority)
  @IsOptional()
  priority: Priority = Priority.MEDIUM;

  @ApiProperty({ enum: DocumentStatus, default: DocumentStatus.VALID })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status: DocumentStatus = DocumentStatus.VALID;
}

export class CreateDocumentFormDto {
  @ApiProperty({ description: 'Document data as JSON string' })
  @IsString()
  @IsNotEmpty()
  documentData: string;
}

export class UpdateDocumentDto extends CreateDocumentDto {
  @ApiPropertyOptional({ description: 'Document file URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'File name' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'File type' })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiPropertyOptional({ 
    description: 'Existing images array',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateDocumentFormDto {
  @ApiProperty({ description: 'Document data as JSON string' })
  @IsString()
  @IsNotEmpty()
  documentData: string;
}

export class RenewDocumentDto {
  @ApiProperty({ description: 'Renewal date (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
  renewalDate: string;

  @ApiProperty({ description: 'New expiry date (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({ description: 'Renewal notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RenewDocumentFormDto {
  @ApiProperty({ description: 'Renewal data as JSON string' })
  @IsString()
  @IsNotEmpty()
  renewalData: string;
}

export class UpdateDocumentStatusDto {
  @ApiProperty({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  @IsNotEmpty()
  status: DocumentStatus;
}

export class BulkUpdateStatusDto {
  @ApiProperty({ type: [Number], description: 'Array of document IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  @IsNotEmpty()
  status: DocumentStatus;
}

export class SendReminderDto {
  @ApiPropertyOptional({ description: 'Recipient email' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Recipient phone number' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  recipientPhone?: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'IN_APP'], default: 'IN_APP' })
  @IsEnum(['EMAIL', 'SMS', 'IN_APP'])
  @IsOptional()
  reminderType: 'EMAIL' | 'SMS' | 'IN_APP' = 'IN_APP';
}

export class DocumentFilterDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ enum: EntityType })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  entityId?: number;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Expiry date from (ISO string)' })
  @IsOptional()
  @IsDateString()
  expiryFrom?: string;

  @ApiPropertyOptional({ description: 'Expiry date to (ISO string)' })
  @IsOptional()
  @IsDateString()
  expiryTo?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: DocumentSortBy.expiryDate, enum: DocumentSortBy })
  @IsOptional()
  @IsEnum(DocumentSortBy)
  sortBy?: DocumentSortBy = DocumentSortBy.expiryDate;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}

export class ExportDocumentsDto extends DocumentFilterDto {
  @ApiProperty({ enum: ['CSV', 'PDF', 'EXCEL'], default: 'CSV' })
  @IsEnum(['CSV', 'PDF', 'EXCEL'])
  @IsNotEmpty()
  format: 'CSV' | 'PDF' | 'EXCEL';
}