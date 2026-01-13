import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceStatus } from './dto/invoice.dto';
import { PDFService } from './pdf.service';
import * as moment from 'moment';
import { EmailService } from '../mail/email.service';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PDFService,
    private emailService: EmailService,
  ) { }

  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    // Check if ride exists
    const ride = await this.prisma.ride.findUnique({
      where: { id: createInvoiceDto.rideId },
      include: {
        customer: true,
        driver: true,
        payment: true,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { rideId: createInvoiceDto.rideId },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists for this ride');
    }

    // Calculate total amount
    const tax = createInvoiceDto.tax || 0;
    const totalAmount = Number(createInvoiceDto.amount) + Number(tax);

    // Create invoice first
    const invoice = await this.prisma.invoice.create({
      data: {
        rideId: createInvoiceDto.rideId,
        amount: createInvoiceDto.amount,
        tax,
        totalAmount,
        dueDate: createInvoiceDto.dueDate,
        status: InvoiceStatus.PENDING,
        notes: createInvoiceDto.notes,
      },
      include: {
        ride: {
          include: {
            customer: true,
            driver: true,
          },
        },
      },
    });

    // Generate PDF invoice - THIS IS CRITICAL
    try {
      const pdfBuffer = await this.pdfService.generateInvoice(invoice);

      // Save PDF to storage
      const pdfUrl = await this.saveInvoicePdf(pdfBuffer, invoice.id);

      // Update invoice with PDF URL
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl },
        include: {
          ride: {
            include: {
              customer: true,
              driver: true,
            },
          },
        },
      });

      // Send invoice email to customer
      await this.sendInvoiceEmail(updatedInvoice);

      return updatedInvoice;
    } catch (error) {
      console.error('Error generating PDF for invoice:', error);
      // Return invoice even if PDF generation fails
      return invoice;
    }
  }

  // ADD: Method to regenerate PDF for existing invoice
  async regenerateInvoicePdf(invoiceId: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        ride: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if this is a guest ride or if customer data is missing
    const isGuest = invoice.ride.isGuest || !invoice.ride.customer;

    if (!isGuest && !invoice.ride.customer) {
      throw new BadRequestException(
        'Cannot generate PDF: Customer information is missing. This may be a data integrity issue.'
      );
    }

    try {
      // Generate new PDF (pdf.service will handle guest rides)
      const pdfBuffer = await this.pdfService.generateInvoice(invoice);

      // Save PDF to storage
      const pdfUrl = await this.saveInvoicePdf(pdfBuffer, invoice.id);

      // Update invoice with new PDF URL
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { pdfUrl },
        include: {
          ride: {
            include: {
              customer: true,
              driver: true,
            },
          },
        },
      });

      return updatedInvoice;
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      throw new BadRequestException(`Failed to regenerate PDF: ${error.message}`);
    }
  }

  async generateInvoiceOnRideCompletion(rideId: number) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        customer: true,
        driver: true,
        payment: true,
        serviceCategory: true,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Check if ride is completed
    if (ride.status !== 'COMPLETED') {
      throw new BadRequestException('Ride must be completed to generate invoice');
    }

    // Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { rideId },
      include: {
        ride: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (existingInvoice) {
      // If PDF is missing, regenerate it
      if (!existingInvoice.pdfUrl) {
        return this.regenerateInvoicePdf(existingInvoice.id);
      }
      return existingInvoice;
    }

    // Calculate amount
    const amount = ride.finalPrice || ride.basePrice || 0;
    const dueDate = moment().add(30, 'days').toDate();

    const createInvoiceDto: CreateInvoiceDto = {
      rideId,
      amount: Number(amount),
      tax: this.calculateTax(Number(amount)),
      dueDate,
      notes: ride.isGuest
        ? 'Invoice for completed guest ride'
        : 'Invoice for completed ride',
    };

    return this.createInvoice(createInvoiceDto);
  }

  async getInvoice(invoiceId: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        ride: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            serviceCategory: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(invoiceId: number, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: updateInvoiceDto,
    });
  }

  async markAsPaid(invoiceId: number) {
    return this.updateInvoice(invoiceId, {
      status: InvoiceStatus.PAID,
    });
  }

  async getInvoicesByCustomer(customerId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          ride: {
            customerId,
          },
        },
        skip,
        take: limit,
        include: {
          ride: {
            select: {
              id: true,
              pickupAddress: true,
              dropoffAddress: true,
            },
          },
        },
        orderBy: { issuedDate: 'desc' },
      }),
      this.prisma.invoice.count({
        where: {
          ride: {
            customerId,
          },
        },
      }),
    ]);

    return {
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async saveInvoicePdf(pdfBuffer: Buffer, invoiceId: number): Promise<string> {
    const fs = require('fs');
    const path = require('path');

    const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `invoice-${invoiceId}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, pdfBuffer);

    // Return URL or file path
    return `/uploads/invoices/${filename}`;
  }

  private calculateTax(amount: number): number {
    // Example: 10% tax
    return amount * 0.1;
  }

  private async sendInvoiceEmail(invoice: any) {
    const customerEmail = invoice.ride.customer.email;
    const customerName = invoice.ride.customer.name;

    const emailData = {
      to: customerEmail,
      subject: `Invoice #${invoice.invoiceNumber} - Your Ride Invoice`,
      template: 'invoice',
      context: {
        customerName,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        totalAmount: invoice.totalAmount,
        dueDate: moment(invoice.dueDate).format('MMMM DD, YYYY'),
        rideDate: moment(invoice.ride.date).format('MMMM DD, YYYY'),
        pickup: invoice.ride.pickupAddress,
        dropoff: invoice.ride.dropoffAddress,
      },
    };

    try {
      await this.emailService.sendInvoiceEmail(emailData);
    } catch (error) {
      console.error('Failed to send invoice email:', error);
    }
  }
}
