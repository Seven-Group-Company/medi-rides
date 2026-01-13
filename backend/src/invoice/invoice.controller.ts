import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    const invoice = await this.invoiceService.createInvoice(createInvoiceDto);

    return {
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    };
  }

  @Post('ride/:rideId/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate invoice for completed ride' })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  async generateInvoiceForRide(@Param('rideId', ParseIntPipe) rideId: number) {
    const invoice = await this.invoiceService.generateInvoiceOnRideCompletion(rideId);

    return {
      success: true,
      message: 'Invoice generated successfully',
      data: invoice,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  async getInvoice(@Param('id', ParseIntPipe) invoiceId: number) {
    const invoice = await this.invoiceService.getInvoice(invoiceId);

    return {
      success: true,
      data: invoice,
    };
  }

  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoices by customer' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getInvoicesByCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1') || 1;
    const limitNum = parseInt(limit || '10') || 10;

    const result = await this.invoiceService.getInvoicesByCustomer(
      customerId,
      pageNum,
      limitNum
    );

    return {
      success: true,
      ...result,
    };
  }

  @Post(':id/regenerate-pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate PDF for existing invoice' })
  @ApiResponse({ status: 200, description: 'PDF regenerated successfully' })
  async regeneratePdf(@Param('id', ParseIntPipe) invoiceId: number) {
    const invoice = await this.invoiceService.regenerateInvoicePdf(invoiceId);

    return {
      success: true,
      message: 'PDF regenerated successfully',
      data: invoice,
    };
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Invoice status updated successfully' })
  async updateInvoiceStatus(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const invoice = await this.invoiceService.updateInvoice(invoiceId, updateInvoiceDto);

    return {
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice,
    };
  }

  @Put(':id/mark-paid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid successfully' })
  async markAsPaid(@Param('id', ParseIntPipe) invoiceId: number) {
    const invoice = await this.invoiceService.markAsPaid(invoiceId);

    return {
      success: true,
      message: 'Invoice marked as paid successfully',
      data: invoice,
    };
  }

  @Get(':id/download')
  @Public()
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiResponse({ status: 200, description: 'Invoice PDF retrieved' })
  async downloadInvoice(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Res() res: Response,
  ) {
    try {
      const invoice = await this.invoiceService.getInvoice(invoiceId);

      if (!invoice.pdfUrl) {
        // Try to regenerate the PDF if it's missing
        const regeneratedInvoice = await this.invoiceService.regenerateInvoicePdf(invoiceId);
        if (!regeneratedInvoice.pdfUrl) {
          throw new NotFoundException('Unable to generate PDF for this invoice');
        }
        invoice.pdfUrl = regeneratedInvoice.pdfUrl;
      }

      // Check if pdfUrl is a full URL or relative path
      if (invoice.pdfUrl.startsWith('http')) {
        // Redirect to external URL
        return res.redirect(invoice.pdfUrl);
      }

      // For local files
      const fs = require('fs');
      const path = require('path');

      // Try multiple possible locations
      const possiblePaths = [
        // Original path (relative to project root)
        path.join(process.cwd(), invoice.pdfUrl),
        // Path from uploads folder
        path.join(process.cwd(), 'uploads', invoice.pdfUrl.replace('/uploads/', '')),
        // Direct path if already absolute
        invoice.pdfUrl,
      ];

      let filePath: string = '';
      let found = false;

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          filePath = possiblePath;
          found = true;
          break;
        }
      }

      if (!found) {
        console.error('PDF not found at any of these paths:', possiblePaths);
        throw new NotFoundException('PDF file not found on server');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to retrieve invoice PDF');
    }
  }

  // ADD: Alternative endpoint that returns JSON with download URL
  @Get(':id/download-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice download URL' })
  @ApiResponse({ status: 200, description: 'Invoice download URL retrieved' })
  async getDownloadUrl(@Param('id', ParseIntPipe) invoiceId: number) {
    const invoice = await this.invoiceService.getInvoice(invoiceId);

    if (!invoice.pdfUrl) {
      throw new NotFoundException('PDF not available for this invoice');
    }

    return {
      success: true,
      data: {
        pdfUrl: invoice.pdfUrl,
        downloadUrl: invoice.pdfUrl.startsWith('http')
          ? invoice.pdfUrl
          : `${process.env.APP_URL || 'http://localhost:1000'}${invoice.pdfUrl}`,
      },
    };
  }
}