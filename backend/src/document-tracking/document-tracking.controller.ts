import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentTrackingService } from './document-tracking.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  RenewDocumentDto,
  UpdateDocumentStatusDto,
  DocumentFilterDto,
  ExportDocumentsDto,
  SendReminderDto,
  CreateDocumentFormDto,
  UpdateDocumentFormDto,
  RenewDocumentFormDto,
  BulkUpdateStatusDto,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@ApiTags('Admin Document Tracking')
@Controller('admin/document-trackings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DocumentTrackingController {
  constructor(
    private readonly documentTrackingService: DocumentTrackingService,
  ) {}

@Post()
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({ type: CreateDocumentFormDto })
@ApiOperation({ summary: 'Create a new document' })
@ApiResponse({ status: 201, description: 'Document created successfully', type: DocumentTracking })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 409, description: 'Document number already exists' })
async createDocument(
  @Body() body: CreateDocumentFormDto,
  @UploadedFile() file: import('multer').File,
  @CurrentUser() user: User,
): Promise<{ success: boolean; data: DocumentTracking; message: string }> {
  try {
    console.log('Received file:', file); // Debug log
    console.log('Received body:', body); // Debug log
    
    if (!file) {
      console.error('No file received from frontend');
      throw new BadRequestException('Document file is required');
    }

    // Parse document data from JSON string
    const documentData = JSON.parse(body.documentData);
    
    const createDocumentDto = plainToInstance(CreateDocumentDto, documentData);

    // Validate DTO
    const errors = await validate(createDocumentDto);
    if (errors.length > 0) {
      throw new BadRequestException(`Validation failed: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`);
    }

    const document = await this.documentTrackingService.createDocument(
      createDocumentDto,
      file,
      user.id,
    );

    return {
      success: true,
      data: document,
      message: 'Document created successfully',
    };
  } catch (error) {
    console.error('Error in createDocument controller:', error);
    if (error instanceof SyntaxError) {
      throw new BadRequestException('Invalid JSON in documentData');
    }
    throw error;
  }
}

  @Get()
  @ApiOperation({ summary: 'Get all documents with filters' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully', type: PaginatedDocuments })
  async getAllDocuments(
    @Query() filters: DocumentFilterDto,
  ): Promise<{ success: boolean; data: PaginatedDocuments }> {
    console.log('Filters received:', filters);
    const result = await this.documentTrackingService.getAllDocuments(filters);

    return {
      success: true,
      data: result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: DocumentStats })
  async getDocumentStats(): Promise<{ success: boolean; data: DocumentStats }> {
    const stats = await this.documentTrackingService.getDocumentStats();

    return {
      success: true,
      data: stats,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all document categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully', type: [DocumentCategory] })
  async getAllCategories(): Promise<{ success: boolean; data: DocumentCategory[] }> {
    const categories = await this.documentTrackingService.getAllCategories();

    return {
      success: true,
      data: categories,
    };
  }

  @Get('export/stream')
  @ApiOperation({ summary: 'Export documents to stream' })
  @ApiResponse({ status: 200, description: 'Export successful' })
  async exportDocumentsStream(
    @Query() filters: ExportDocumentsDto,
  ): Promise<Buffer> {
    return await this.documentTrackingService.exportDocuments(filters);
  }

  @Get('analytics/expiry-timeline')
  @ApiOperation({ summary: 'Get document expiry timeline' })
  async getExpiryTimeline(
    @Query('days') days: string,
  ): Promise<{ success: boolean; data: any }> {
    const timeline = await this.documentTrackingService.getExpiryTimeline(
      parseInt(days) || 90,
    );

    return {
      success: true,
      data: timeline,
    };
  }

  @Get('analytics/by-category')
  @ApiOperation({ summary: 'Get analytics by category' })
  async getCategoryAnalytics(): Promise<{ success: boolean; data: any }> {
    const analytics = await this.documentTrackingService.getCategoryAnalytics();

    return {
      success: true,
      data: analytics,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully', type: DocumentTracking })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; data: DocumentTracking }> {
    const document = await this.documentTrackingService.getDocumentById(id);

    return {
      success: true,
      data: document,
    };
  }

@Put(':id')
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({ type: UpdateDocumentFormDto })
@ApiOperation({ summary: 'Update document' })
@ApiResponse({ status: 200, description: 'Document updated successfully', type: DocumentTracking })
@ApiResponse({ status: 404, description: 'Document not found' })
@ApiResponse({ status: 409, description: 'Document number already exists' })
async updateDocument(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: UpdateDocumentFormDto,
  @UploadedFile() file: import('multer').File,
  @CurrentUser() user: User,
): Promise<{ success: boolean; data: DocumentTracking; message: string }> {
  try {
    console.log('Update - Received file:', file); // Debug log
    console.log('Update - Received body:', body); // Debug log
    
    // Parse document data from JSON string
    const documentData = JSON.parse(body.documentData);
    
    // Remove any file property from the parsed data to prevent validation errors
    const { file: fileProperty, ...dataWithoutFile } = documentData;
    
    console.log('Update - Parsed data without file:', dataWithoutFile);
    
    const updateDocumentDto = plainToInstance(UpdateDocumentDto, dataWithoutFile);

    // Validate DTO
    const errors = await validate(updateDocumentDto);
    if (errors.length > 0) {
      throw new BadRequestException(`Validation failed: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`);
    }

    const document = await this.documentTrackingService.updateDocument(
      id,
      updateDocumentDto,
      file, // This can be undefined if no new file is uploaded
      user.id,
    );

    return {
      success: true,
      data: document,
      message: 'Document updated successfully',
    };
  } catch (error) {
    console.error('Error in updateDocument controller:', error);
    if (error instanceof SyntaxError) {
      throw new BadRequestException('Invalid JSON in documentData');
    }
    throw error;
  }
}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.documentTrackingService.deleteDocument(id);

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  @Post(':id/renew')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RenewDocumentFormDto })
  @ApiOperation({ summary: 'Renew a document' })
  @ApiResponse({ status: 201, description: 'Document renewed successfully', type: DocumentRenewal })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async renewDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RenewDocumentFormDto,
    @UploadedFile() file: import('multer').File,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; data: DocumentRenewal; message: string }> {
    try {
      // Parse renewal data from JSON string
      const renewalData = JSON.parse(body.renewalData);
      const renewDocumentDto = plainToInstance(RenewDocumentDto, renewalData);

      // Validate DTO
      const errors = await validate(renewDocumentDto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const renewal = await this.documentTrackingService.renewDocument(
        id,
        renewDocumentDto,
        file,
        user.id,
      );

      return {
        success: true,
        data: renewal,
        message: 'Document renewed successfully',
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Invalid JSON in renewalData');
      }
      throw error;
    }
  }

  @Get(':id/renewals')
  @ApiOperation({ summary: 'Get document renewal history' })
  @ApiResponse({ status: 200, description: 'Renewals retrieved successfully', type: [DocumentRenewal] })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentRenewals(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; data: DocumentRenewal[] }> {
    const document = await this.documentTrackingService.getDocumentById(id);

    return {
      success: true,
      data: document.renewals || [],
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update document status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: DocumentTracking })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateDocumentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateDocumentStatusDto,
  ): Promise<{ success: boolean; data: DocumentTracking; message: string }> {
    const document = await this.documentTrackingService.updateDocumentStatus(
      id,
      updateStatusDto,
    );

    return {
      success: true,
      data: document,
      message: 'Document status updated successfully',
    };
  }

  @Put('bulk/status')
  @ApiOperation({ summary: 'Bulk update document status' })
  @ApiResponse({ status: 200, description: 'Statuses updated successfully' })
  async bulkUpdateStatus(
    @Body() bulkUpdateDto: BulkUpdateStatusDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.documentTrackingService.bulkUpdateStatus(bulkUpdateDto);

    return {
      success: true,
      message: 'Document statuses updated successfully',
    };
  }

  @Post(':id/send-reminder')
  @ApiOperation({ summary: 'Send reminder for document' })
  @ApiResponse({ status: 200, description: 'Reminder sent successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async sendReminder(
    @Param('id', ParseIntPipe) id: number,
    @Body() sendReminderDto: SendReminderDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.documentTrackingService.sendReminder(id, sendReminderDto);

    return {
      success: true,
      message: 'Reminder sent successfully',
    };
  }

  // Category Endpoints

  @Post('categories')
  @ApiOperation({ summary: 'Create a new document category' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: DocumentCategory })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<{ success: boolean; data: DocumentCategory; message: string }> {
    const category = await this.documentTrackingService.createCategory(createCategoryDto);

    return {
      success: true,
      data: category,
      message: 'Category created successfully',
    };
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update document category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: DocumentCategory })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ success: boolean; data: DocumentCategory; message: string }> {
    const category = await this.documentTrackingService.updateCategory(id, updateCategoryDto);

    return {
      success: true,
      data: category,
      message: 'Category updated successfully',
    };
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document category' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 400, description: 'Category has documents' })
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.documentTrackingService.deleteCategory(id);

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }


  // Test endpoint for file upload
  @Post('test-upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async testUpload(
    @UploadedFile() file: import('multer').File,
    @Body() body: any,
  ) {
    console.log('File:', file);
    console.log('Body:', body);
    
    return {
      success: true,
      message: 'Upload received',
      file: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      body,
    };
  }
}