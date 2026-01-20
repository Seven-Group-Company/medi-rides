import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  RenewDocumentDto,
  UpdateDocumentStatusDto,
  DocumentFilterDto,
  ExportDocumentsDto,
  SendReminderDto,
} from './dto/create-document.dto';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import {
  DocumentTracking,
  DocumentCategory,
  DocumentRenewal,
  DocumentStats,
  PaginatedDocuments,
} from './entities/document.entity';
import {
  DocumentStatus,
} from '@prisma/client';
import { subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class DocumentTrackingService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // Document Methods
  async createDocument(
    createDocumentDto: CreateDocumentDto,
    file: import('multer').File,
    userId: number,
  ): Promise<DocumentTracking> {
    try {
      // Check if document number already exists
      const existingDocument = await this.prisma.documentTracking.findFirst({
        where: { documentNumber: createDocumentDto.documentNumber },
      });

      if (existingDocument) {
        throw new ConflictException('Document with this number already exists');
      }

      // Upload file to cloud storage
      let fileUrl: string;
      let fileSize: number;
      let fileType: string;

      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        fileUrl = uploadResult.url;
        fileSize = file.size;
        fileType = file.mimetype;
      } else {
        throw new BadRequestException('Document file is required');
      }

      // Calculate status based on expiry date
      const status = this.calculateDocumentStatus(
        new Date(createDocumentDto.expiryDate),
        createDocumentDto.reminderDays,
      );

      // Create document
      const document = await this.prisma.documentTracking.create({
        data: {
          ...createDocumentDto,
          issueDate: new Date(createDocumentDto.issueDate),
          expiryDate: new Date(createDocumentDto.expiryDate),
          renewalDate: createDocumentDto.renewalDate 
            ? new Date(createDocumentDto.renewalDate)
            : null,
          fileUrl,
          fileName: file.originalname,
          fileSize,
          fileType,
          tags: createDocumentDto.tags || [],
          status,
          createdById: userId,
        },
        include: {
          category: true,
        },
      });

      return this.normalizeDocument(document);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating document:', error);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async getAllDocuments(
    filters: DocumentFilterDto,
  ): Promise<PaginatedDocuments> {
    try {
      const {
        search,
        status,
        categoryId,
        entityType,
        entityId,
        priority,
        expiryFrom,
        expiryTo,
        page = 1,
        limit = 20,
        sortBy = 'expiryDate',
        sortOrder = 'asc',
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { documentNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { entityName: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (entityType) {
        where.entityType = entityType;
      }

      if (entityId) {
        where.entityId = entityId;
      }

      if (priority) {
        where.priority = priority;
      }

      if (expiryFrom || expiryTo) {
        where.expiryDate = {};
        if (expiryFrom) {
          where.expiryDate.gte = new Date(expiryFrom);
        }
        if (expiryTo) {
          where.expiryDate.lte = new Date(expiryTo);
        }
      }

      // Get total count
      const total = await this.prisma.documentTracking.count({ where });

      // Get documents with pagination
      const documents = await this.prisma.documentTracking.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          category: true,
          renewals: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      return {
        data: documents.map(doc => this.normalizeDocument(doc)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  async getDocumentById(id: number): Promise<DocumentTracking> {
    try {
      const document = await this.prisma.documentTracking.findUnique({
        where: { id },
        include: {
          category: true,
          renewals: {
            orderBy: { createdAt: 'desc' },
          },
          reminders: {
            orderBy: { sentAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      return this.normalizeDocument(document);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching document:', error);
      throw new InternalServerErrorException('Failed to fetch document');
    }
  }

async updateDocument(
  id: number,
  updateDocumentDto: UpdateDocumentDto,
  file: import('multer').File | undefined,
  userId: number,
): Promise<DocumentTracking> {
  try {
    // Check if document exists
    const existingDocument = await this.prisma.documentTracking.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      throw new NotFoundException('Document not found');
    }

    // Check if document number is being changed and conflicts
    if (
      updateDocumentDto.documentNumber &&
      updateDocumentDto.documentNumber !== existingDocument.documentNumber
    ) {
      const duplicate = await this.prisma.documentTracking.findFirst({
        where: {
          documentNumber: updateDocumentDto.documentNumber,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException('Document number already exists');
      }
    }

    let fileUrl = existingDocument.fileUrl;
    let fileName = existingDocument.fileName;
    let fileSize = existingDocument.fileSize;
    let fileType = existingDocument.fileType;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      fileUrl = uploadResult.url;
      fileName = file.originalname;
      fileSize = file.size;
      fileType = file.mimetype;
    }

    // Calculate status based on new expiry date
    const status = updateDocumentDto.expiryDate
      ? this.calculateDocumentStatus(
          new Date(updateDocumentDto.expiryDate),
          updateDocumentDto.reminderDays || existingDocument.reminderDays,
        )
      : existingDocument.status;

      // Update document
    const updatedDocument = await this.prisma.documentTracking.update({
      where: { id },
      data: {
        ...updateDocumentDto,
        issueDate: updateDocumentDto.issueDate
          ? new Date(updateDocumentDto.issueDate)
          : existingDocument.issueDate,
        expiryDate: updateDocumentDto.expiryDate
          ? new Date(updateDocumentDto.expiryDate)
          : existingDocument.expiryDate,
        renewalDate: updateDocumentDto.renewalDate
          ? new Date(updateDocumentDto.renewalDate)
          : existingDocument.renewalDate,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        tags: Array.isArray(updateDocumentDto.tags)
          ? updateDocumentDto.tags
          : existingDocument.tags,
        status,
        updatedById: userId,
      },
      include: {
        category: true,
      },
    });

    return this.normalizeDocument(updatedDocument);
  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }
    console.error('Error updating document:', error);
    throw new InternalServerErrorException('Failed to update document');
  }
}

  async deleteDocument(id: number): Promise<void> {
    try {
      // Check if document exists
      const document = await this.prisma.documentTracking.findUnique({
        where: { id },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Delete associated renewals
      await this.prisma.documentRenewal.deleteMany({
        where: { documentId: id },
      });

      // Delete associated reminders
      await this.prisma.documentReminder.deleteMany({
        where: { documentId: id },
      });

      // Delete document
      await this.prisma.documentTracking.delete({
        where: { id },
      });

      // Optionally delete file from cloud storage
      // await this.cloudinaryService.deleteFile(document.fileUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting document:', error);
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async renewDocument(
    id: number,
    renewDocumentDto: RenewDocumentDto,
    file: import('multer').File,
    userId: number,
  ): Promise<DocumentRenewal> {
    try {
      // Check if document exists
      const document = await this.prisma.documentTracking.findUnique({
        where: { id },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Upload renewed document file
      const uploadResult = await this.cloudinaryService.uploadFile(file);

      // Create renewal record
      const renewal = await this.prisma.documentRenewal.create({
        data: {
          documentId: id,
          renewalDate: new Date(renewDocumentDto.renewalDate),
          expiryDate: new Date(renewDocumentDto.expiryDate),
          fileUrl: uploadResult.url,
          fileName: file.originalname,
          notes: renewDocumentDto.notes || undefined,
          createdById: userId,
        },
      });

      // Update document with new expiry date and status
      const status = this.calculateDocumentStatus(
        new Date(renewDocumentDto.expiryDate),
        document.reminderDays,
      );

      await this.prisma.documentTracking.update({
        where: { id },
        data: {
          renewalDate: new Date(renewDocumentDto.renewalDate),
          expiryDate: new Date(renewDocumentDto.expiryDate),
          status,
          updatedById: userId,
        },
      });

      return { ...renewal, notes: renewal.notes ?? undefined };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error renewing document:', error);
      throw new InternalServerErrorException('Failed to renew document');
    }
  }

  async updateDocumentStatus(
    id: number,
    updateStatusDto: UpdateDocumentStatusDto,
  ): Promise<DocumentTracking> {
    try {
      // Check if document exists
      const document = await this.prisma.documentTracking.findUnique({
        where: { id },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Update status
      const updatedDocument = await this.prisma.documentTracking.update({
        where: { id },
        data: {
          status: updateStatusDto.status,
        },
      });

      return this.normalizeDocument(updatedDocument);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating document status:', error);
      throw new InternalServerErrorException('Failed to update document status');
    }
  }

  async bulkUpdateStatus(
    bulkUpdateDto: { ids: number[]; status: DocumentStatus },
  ): Promise<void> {
    try {
      await this.prisma.documentTracking.updateMany({
        where: {
          id: { in: bulkUpdateDto.ids },
        },
        data: {
          status: bulkUpdateDto.status,
        },
      });
    } catch (error) {
      console.error('Error bulk updating document status:', error);
      throw new InternalServerErrorException('Failed to bulk update document status');
    }
  }

  async sendReminder(
    id: number,
    sendReminderDto: SendReminderDto,
  ): Promise<void> {
    try {
      // Check if document exists
      const document = await this.prisma.documentTracking.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Create reminder record
      await this.prisma.documentReminder.create({
        data: {
          documentId: id,
          reminderType: sendReminderDto.reminderType,
          recipientEmail: sendReminderDto.recipientEmail,
          recipientPhone: sendReminderDto.recipientPhone,
          status: 'SENT',
          message: `Reminder: ${document.title} expires on ${document.expiryDate.toLocaleDateString()}`,
        },
      });

      // Update last reminder sent date
      await this.prisma.documentTracking.update({
        where: { id },
        data: {
          lastReminderSent: new Date(),
        },
      });

      // TODO: Implement actual email/SMS sending
      // await this.emailService.sendReminderEmail(document, sendReminderDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error sending reminder:', error);
      throw new InternalServerErrorException('Failed to send reminder');
    }
  }

  // Category Methods
  async getAllCategories(): Promise<DocumentCategory[]> {
    try {
      const categories = await this.prisma.documentCategory.findMany({
        orderBy: { name: 'asc' },
      });

      return categories.map(category => ({
        ...category,
        description: category.description ?? undefined,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<DocumentCategory> {
    try {
      // Check if category name already exists
      const existingCategory = await this.prisma.documentCategory.findFirst({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }

      // Create category
      const category = await this.prisma.documentCategory.create({
        data: createCategoryDto,
      });

      return {
        ...category,
        description: category.description ?? undefined,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating category:', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<DocumentCategory> {
    try {
      // Check if category exists
      const existingCategory = await this.prisma.documentCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      // Check if new name conflicts
      if (
        updateCategoryDto.name &&
        updateCategoryDto.name !== existingCategory.name
      ) {
        const duplicate = await this.prisma.documentCategory.findFirst({
          where: {
            name: updateCategoryDto.name,
            NOT: { id },
          },
        });

        if (duplicate) {
          throw new ConflictException('Category name already exists');
        }
      }

      // Update category
      const updatedCategory = await this.prisma.documentCategory.update({
        where: { id },
        data: updateCategoryDto,
      });

      return {
        ...updatedCategory,
        description: updatedCategory.description ?? undefined,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error updating category:', error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      // Check if category exists
      const category = await this.prisma.documentCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Check if category has documents
      const documentCount = await this.prisma.documentTracking.count({
        where: { categoryId: id },
      });

      if (documentCount > 0) {
        throw new BadRequestException(
          'Cannot delete category that has documents. Please reassign documents first.',
        );
      }

      // Delete category
      await this.prisma.documentCategory.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error deleting category:', error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  // Statistics Methods
  async getDocumentStats(): Promise<DocumentStats> {
    try {
      const now = new Date();
      const startOfThisWeek = startOfWeek(now);
      const endOfThisWeek = endOfWeek(now);
      const startOfThisMonth = startOfMonth(now);
      const endOfThisMonth = endOfMonth(now);
      const thirtyDaysFromNow = addDays(now, 30);

      // Get total counts
      const total = await this.prisma.documentTracking.count();
      const valid = await this.prisma.documentTracking.count({
        where: { status: 'VALID' },
      });
      const expiringSoon = await this.prisma.documentTracking.count({
        where: { status: 'EXPIRING_SOON' },
      });
      const expired = await this.prisma.documentTracking.count({
        where: { status: 'EXPIRED' },
      });
      const renewalInProgress = await this.prisma.documentTracking.count({
        where: { status: 'RENEWAL_IN_PROGRESS' },
      });

      // Get counts by category
      const categories = await this.prisma.documentCategory.findMany({
        include: {
          _count: {
            select: { documents: true },
          },
        },
      });
      const byCategory = categories.reduce((acc, category) => {
        acc[category.name] = category._count.documents;
        return acc;
      }, {});

      // Get counts by entity type
      const entityTypes = await this.prisma.documentTracking.groupBy({
        by: ['entityType'],
        _count: { id: true },
      });
      const byEntityType = entityTypes.reduce((acc, type) => {
        acc[type.entityType] = type._count.id;
        return acc;
      }, {});

      // Get counts by priority
      const priorities = await this.prisma.documentTracking.groupBy({
        by: ['priority'],
        _count: { id: true },
      });
      const byPriority = priorities.reduce((acc, priority) => {
        acc[priority.priority] = priority._count.id;
        return acc;
      }, {});

      // Get expiring this week
      const expiringThisWeek = await this.prisma.documentTracking.count({
        where: {
          expiryDate: {
            gte: startOfThisWeek,
            lte: endOfThisWeek,
          },
          status: { not: 'EXPIRED' },
        },
      });

      // Get expiring this month
      const expiringThisMonth = await this.prisma.documentTracking.count({
        where: {
          expiryDate: {
            gte: startOfThisMonth,
            lte: endOfThisMonth,
          },
          status: { not: 'EXPIRED' },
        },
      });

      // Get recent renewals (last 30 days)
      const recentRenewals = await this.prisma.documentRenewal.count({
        where: {
          renewalDate: {
            gte: subDays(now, 30),
          },
        },
      });

      // Get upcoming renewals (next 30 days)
      const upcomingRenewals = await this.prisma.documentTracking.count({
        where: {
          expiryDate: {
            lte: thirtyDaysFromNow,
            gt: now,
          },
        },
      });

      return {
        total,
        valid,
        expiringSoon,
        expired,
        renewalInProgress,
        byCategory,
        byEntityType,
        byPriority,
        expiringThisWeek,
        expiringThisMonth,
        recentRenewals,
        upcomingRenewals,
      };
    } catch (error) {
      console.error('Error fetching document stats:', error);
      throw new InternalServerErrorException('Failed to fetch document statistics');
    }
  }

  // Export Methods
  async exportDocuments(
    filters: ExportDocumentsDto,
  ): Promise<Buffer> {
    try {
      const { format, ...documentFilters } = filters;

      // Get documents based on filters
      const { data: documents } = await this.getAllDocuments(documentFilters);

      switch (format) {
        case 'CSV':
          return await this.exportToCSV(documents);
        case 'PDF':
          return await this.exportToPDF(documents);
        case 'EXCEL':
          return await this.exportToExcel(documents);
        default:
          throw new BadRequestException('Invalid export format');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error exporting documents:', error);
      throw new InternalServerErrorException('Failed to export documents');
    }
  }

  private async exportToCSV(documents: DocumentTracking[]): Promise<Buffer> {
    const csvWriter = createObjectCsvWriter({
      path: 'temp.csv',
      header: [
        { id: 'title', title: 'Title' },
        { id: 'documentNumber', title: 'Document Number' },
        { id: 'category', title: 'Category' },
        { id: 'expiryDate', title: 'Expiry Date' },
        { id: 'status', title: 'Status' },
        { id: 'priority', title: 'Priority' },
        { id: 'entityType', title: 'Entity Type' },
        { id: 'entityName', title: 'Entity Name' },
        { id: 'reminderDays', title: 'Reminder Days' },
      ],
    });

    const records = documents.map(doc => ({
      title: doc.title,
      documentNumber: doc.documentNumber,
      category: doc.category?.name || '',
      expiryDate: doc.expiryDate.toISOString().split('T')[0],
      status: doc.status,
      priority: doc.priority,
      entityType: doc.entityType,
      entityName: doc.entityName || '',
      reminderDays: doc.reminderDays,
    }));

    await csvWriter.writeRecords(records);
    
    // Read file and return as buffer
    const fs = require('fs');
    const buffer = fs.readFileSync('temp.csv');
    fs.unlinkSync('temp.csv');
    
    return buffer;
  }

  private async exportToExcel(documents: DocumentTracking[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Documents');

    // Add headers
    worksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Document Number', key: 'documentNumber', width: 20 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Issue Date', key: 'issueDate', width: 15 },
      { header: 'Expiry Date', key: 'expiryDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Entity Type', key: 'entityType', width: 15 },
      { header: 'Entity Name', key: 'entityName', width: 20 },
      { header: 'Reminder Days', key: 'reminderDays', width: 15 },
    ];

    // Add data
    documents.forEach(doc => {
      worksheet.addRow({
        title: doc.title,
        documentNumber: doc.documentNumber,
        category: doc.category?.name || '',
        issueDate: doc.issueDate.toISOString().split('T')[0],
        expiryDate: doc.expiryDate.toISOString().split('T')[0],
        status: doc.status,
        priority: doc.priority,
        entityType: doc.entityType,
        entityName: doc.entityName || '',
        reminderDays: doc.reminderDays,
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async exportToPDF(documents: DocumentTracking[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    let y = height - 50;
    
    // Add title
    page.drawText('Document Export Report', {
      x: 50,
      y,
      size: 20,
      font,
    });
    
    y -= 40;
    
    // Add export date
    page.drawText(`Exported on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y,
      size: 10,
      font,
    });
    
    y -= 30;
    
    // Add table headers
    const headers = ['Title', 'Doc Number', 'Category', 'Expiry', 'Status', 'Priority'];
    const colWidths = [150, 100, 80, 80, 80, 70];
    let x = 30;
    
    headers.forEach((header, index) => {
      page.drawText(header, {
        x,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      x += colWidths[index];
    });
    
    y -= 20;
    
    // Draw line
    page.drawLine({
      start: { x: 30, y },
      end: { x: width - 30, y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    y -= 15;
    
    // Add document rows
    documents.forEach((doc, index) => {
      if (y < 100) {
        page = pdfDoc.addPage([600, 800]);
        y = height - 50;
      }
      
      x = 30;
      
      // Truncate text if too long
      const title = doc.title.length > 20 ? doc.title.substring(0, 20) + '...' : doc.title;
      
      const rowData = [
        title,
        doc.documentNumber,
        doc.category?.name || '',
        doc.expiryDate.toISOString().split('T')[0],
        doc.status,
        doc.priority,
      ];
      
      rowData.forEach((text, colIndex) => {
        page.drawText(text.toString(), {
          x,
          y,
          size: 9,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        x += colWidths[colIndex];
      });
      
      y -= 15;
    });
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // Analytics Methods
  async getExpiryTimeline(days: number = 90): Promise<any> {
    try {
      const now = new Date();
      const futureDate = addDays(now, days);
      
      // Group documents by expiry date
      const timeline = await this.prisma.$queryRaw`
        SELECT 
          DATE(expiryDate) as date,
          COUNT(*) as count,
          JSON_OBJECTAGG(status, status_count) as status_counts
        FROM (
          SELECT 
            expiryDate,
            status,
            COUNT(*) as status_count
          FROM DocumentTracking
          WHERE expiryDate BETWEEN ${now} AND ${futureDate}
          GROUP BY DATE(expiryDate), status
        ) as subquery
        GROUP BY DATE(expiryDate)
        ORDER BY date ASC
      `;

      return timeline;
    } catch (error) {
      console.error('Error fetching expiry timeline:', error);
      throw new InternalServerErrorException('Failed to fetch expiry timeline');
    }
  }

  async getCategoryAnalytics(): Promise<any> {
    try {
      const analytics = await this.prisma.documentCategory.findMany({
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          _count: {
            select: {
              documents: true,
            },
          },
          documents: {
            select: {
              status: true,
            },
          },
        },
      });

      // Transform data for charts
      return analytics.map(category => ({
        ...category,
        statusBreakdown: {
          VALID: category.documents.filter(d => d.status === 'VALID').length,
          EXPIRING_SOON: category.documents.filter(d => d.status === 'EXPIRING_SOON').length,
          EXPIRED: category.documents.filter(d => d.status === 'EXPIRED').length,
          RENEWAL_IN_PROGRESS: category.documents.filter(d => d.status === 'RENEWAL_IN_PROGRESS').length,
        },
      }));
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      throw new InternalServerErrorException('Failed to fetch category analytics');
    }
  }

  // Utility Methods
  private normalizeDocument(document: any): DocumentTracking {
    if (document?.category?.description === null) {
      document.category.description = undefined;
    }
    return document;
  }

  private calculateDocumentStatus(
    expiryDate: Date,
    reminderDays: number,
  ): DocumentStatus {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return DocumentStatus.EXPIRED;
    } else if (diffDays <= reminderDays) {
      return DocumentStatus.EXPIRING_SOON;
    } else {
      return DocumentStatus.VALID;
    }
  }

  // Cron Job for updating statuses and sending reminders
  async updateExpiredDocuments(): Promise<void> {
    try {
      const now = new Date();
      
      // Update expired documents
      await this.prisma.documentTracking.updateMany({
        where: {
          expiryDate: { lt: now },
          status: { not: DocumentStatus.EXPIRED },
        },
        data: {
          status: DocumentStatus.EXPIRED,
        },
      });

      // Update expiring soon documents
      const reminderThreshold = addDays(now, 30);
      
      await this.prisma.documentTracking.updateMany({
        where: {
          expiryDate: {
            gte: now,
            lte: reminderThreshold,
          },
          status: DocumentStatus.VALID,
        },
        data: {
          status: DocumentStatus.EXPIRING_SOON,
        },
      });
    } catch (error) {
      console.error('Error updating expired documents:', error);
    }
  }

  async sendScheduledReminders(): Promise<void> {
    try {
      const now = new Date();
      
      // Find documents that need reminders
      const documents = await this.prisma.documentTracking.findMany({
        where: {
          status: { not: DocumentStatus.EXPIRED },
          expiryDate: {
            lte: addDays(now, 30),
            gt: now,
          },
          OR: [
            { lastReminderSent: null },
            { lastReminderSent: { lt: subDays(now, 7) } },
          ],
        },
        include: {
          category: true,
        },
      });

      // Send reminders for each document
      for (const document of documents) {
        try {
          await this.sendReminder(document.id, {
            reminderType: 'EMAIL',
            recipientEmail: 'admin@example.com', // Get from user settings
          });

          console.log(`Sent reminder for document: ${document.title}`);
        } catch (error) {
          console.error(`Failed to send reminder for document ${document.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending scheduled reminders:', error);
    }
  }
}