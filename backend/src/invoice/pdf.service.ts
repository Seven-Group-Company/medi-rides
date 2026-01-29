import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as moment from 'moment';

@Injectable()
export class PDFService {
  private readonly BUSINESS_INFO = {
    name: 'Compassionate Medi Rides',
    address: 'Wasilla, Alaska',
    phone: '+1 (907) 414-7664',
    email: 'rcompassionate@gmail.com',
    website: '', // Add if available
    tagline: 'Safe, Reliable Medical & Non-Medical Transportation',
    services: ['Medical Transport', 'Non-Emergency Transportation', 'Wheelchair Accessible', '24/7 Service']
  };

  async generateInvoice(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Validate required data
        if (!invoice.ride) {
          reject(new Error('Ride information is missing'));
          return;
        }

        const doc = new PDFDocument({
          size: 'LETTER',
          margin: 40,
          info: {
            Title: `Invoice ${invoice.invoiceNumber}`,
            Author: this.BUSINESS_INFO.name,
            Subject: 'Transportation Service Invoice',
            Keywords: 'invoice, transportation, medical, ride',
            Creator: 'Compassionate Medi Rides Billing System',
            CreationDate: new Date(),
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add watermark for paid invoices
        if (invoice.status === 'PAID') {
          this.addPaidWatermark(doc);
        }

        // Professional Header Section
        this.createHeader(doc);

        // Invoice Title and Details Section
        this.createInvoiceHeader(doc, invoice);

        // Billing Information Section
        this.createBillingSection(doc, invoice);

        // Service Details Section
        this.createServiceDetails(doc, invoice);

        // Items Table (Professional Layout)
        this.createProfessionalTable(doc, invoice);

        // Payment & Notes Section
        this.createPaymentNotesSection(doc, invoice);

        // Footer Section
        this.createFooter(doc);

        doc.end();
      } catch (error) {
        console.error('PDF Generation Error:', error);
        reject(error);
      }
    });
  }

  private createHeader(doc: InstanceType<typeof PDFDocument>) {
    // Company Info Section
    doc
      .fillColor('#0A2342') // Your brand color from hero
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(this.BUSINESS_INFO.name, 50, 50)
      .moveDown(0.5);

    doc
      .fillColor('#64748B')
      .fontSize(10)
      .font('Helvetica')
      .text(this.BUSINESS_INFO.address, 50, 80)
      .text(`Phone: ${this.BUSINESS_INFO.phone}`, 50, 95)
      .text(`Email: ${this.BUSINESS_INFO.email}`, 50, 110);

    // Right side - Tagline & Services
    const rightX = 350;
    doc
      .fillColor('#9BC9FF') // Your accent color
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(this.BUSINESS_INFO.tagline, rightX, 80, { width: 200 });

    // Services badges
    const servicesY = 100;
    this.BUSINESS_INFO.services.forEach((service, index) => {
      const y = servicesY + (index * 15);
      doc
        .fillColor('#0A2342')
        .fontSize(8)
        .font('Helvetica')
        .text(`✓ ${service}`, rightX, y, { width: 200 });
    });

    // Separator line
    doc
      .moveTo(50, 140)
      .lineTo(550, 140)
      .lineWidth(2)
      .strokeColor('#E2E8F0')
      .stroke();
  }

  private createInvoiceHeader(doc: InstanceType<typeof PDFDocument>, invoice: any) {
    // Invoice title
    doc
      .fillColor('#1E293B')
      .fontSize(32)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 160)
      .moveDown(0.5);

    // Status badge
    const statusX = 450;
    const statusY = 160;
    const statusWidth = 100;
    const statusHeight = 30;
    
    // Status background
    const statusColor = this.getStatusColor(invoice.status);
    doc
      .fillColor(statusColor.background)
      .roundedRect(statusX, statusY, statusWidth, statusHeight, 5)
      .fill();
    
    // Status text
    doc
      .fillColor(statusColor.text)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(invoice.status, statusX + (statusWidth/2), statusY + 10, { 
        align: 'center',
        width: statusWidth 
      });

    // Invoice details table
    const detailsY = 210;
    const details = [
      { label: 'Invoice Number', value: invoice.invoiceNumber },
      { label: 'Invoice Date', value: moment(invoice.issuedDate).format('MMMM DD, YYYY') },
      { label: 'Due Date', value: moment(invoice.dueDate).format('MMMM DD, YYYY') },
      { label: 'Payment Status', value: invoice.status }
    ];

    details.forEach((detail, index) => {
      const y = detailsY + (index * 20);
      doc
        .fillColor('#64748B')
        .fontSize(10)
        .font('Helvetica')
        .text(detail.label + ':', 50, y)
        .fillColor('#1E293B')
        .font('Helvetica-Bold')
        .text(detail.value, 180, y);
    });

    // Bottom separator
    doc
      .moveTo(50, detailsY + 85)
      .lineTo(550, detailsY + 85)
      .lineWidth(1)
      .strokeColor('#E2E8F0')
      .stroke();
  }

  private createBillingSection(doc: InstanceType<typeof PDFDocument>, invoice: any) {
    const billingY = 310;
    
    // Bill To section
    doc
      .fillColor('#0A2342')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('BILL TO', 50, billingY)
      .moveDown(0.5);

    const isGuest = invoice.ride.isGuest || !invoice.ride.customer;
    const customerName = isGuest 
      ? (invoice.ride.passengerName || 'Guest Customer')
      : (invoice.ride.customer?.name || 'N/A');
    const customerPhone = isGuest 
      ? (invoice.ride.passengerPhone || '')
      : (invoice.ride.customer?.phone || 'N/A');

    doc
      .fillColor('#1E293B')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(customerName, 50, billingY + 25);

    doc
      .fillColor('#64748B')
      .fontSize(10)
      .font('Helvetica')
      .text(`Phone: ${customerPhone}`, 50, billingY + 40);

    if (isGuest) {
      doc
        .fillColor('#F59E0B')
        .fontSize(9)
        .font('Helvetica')
        .text('(Guest Booking)', 50, billingY + 55);
    }

    // Business Info on right
    const businessY = billingY;
    doc
      .fillColor('#0A2342')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('FROM', 350, businessY);

    doc
      .fillColor('#1E293B')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(this.BUSINESS_INFO.name, 350, businessY + 25);

    doc
      .fillColor('#64748B')
      .fontSize(10)
      .font('Helvetica')
      .text(this.BUSINESS_INFO.address, 350, businessY + 40)
      .text(`Phone: ${this.BUSINESS_INFO.phone}`, 350, businessY + 55)
      .text(`Email: ${this.BUSINESS_INFO.email}`, 350, businessY + 70);
  }

  private createServiceDetails(doc: InstanceType<typeof PDFDocument>, invoice: any) {
    const serviceY = 420;
    
    doc
      .fillColor('#0A2342')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('SERVICE DETAILS', 50, serviceY);

    // Background box for service details
    doc
      .fillColor('#F8FAFC')
      .roundedRect(50, serviceY + 15, 500, 80, 5)
      .fill();

    const ride = invoice.ride;
    const rideDate = moment(ride.scheduledAt).format('dddd, MMMM DD, YYYY');
    const rideTime = moment(ride.scheduledAt).format('hh:mm A');

    const details = [
      { label: 'Ride ID', value: `#${ride.id}` },
      { label: 'Service Date & Time', value: `${rideDate} at ${rideTime}` },
      { label: 'Service Type', value: ride.serviceType || 'Transportation Service' },
      { label: 'Payment Type', value: this.formatPaymentType(ride.paymentType) },
    ];

    // First column
    details.forEach((detail, index) => {
      const y = serviceY + 30 + (index * 15);
      doc
        .fillColor('#64748B')
        .fontSize(9)
        .font('Helvetica')
        .text(detail.label + ':', 60, y)
        .fillColor('#1E293B')
        .font('Helvetica-Bold')
        .text(detail.value, 140, y);
    });

    // Route information
    const routeY = serviceY + 30;
    doc
      .fillColor('#64748B')
      .fontSize(9)
      .font('Helvetica')
      .text('Route:', 300, routeY)
      .fillColor('#1E293B')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Pickup:', 350, routeY)
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(ride.pickupAddress || 'N/A', 350, routeY + 15, { width: 180 })
      .fillColor('#1E293B')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Dropoff:', 350, routeY + 40)
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(ride.dropoffAddress || 'N/A', 350, routeY + 55, { width: 180 });

    // Separator
    doc
      .moveTo(50, serviceY + 105)
      .lineTo(550, serviceY + 105)
      .lineWidth(1)
      .strokeColor('#E2E8F0')
      .stroke();
  }

  private createProfessionalTable(doc: InstanceType<typeof PDFDocument>, invoice: any) {
    const tableY = 540;
    
    // Table header
    doc
      .fillColor('#FFFFFF')
      .rect(50, tableY, 500, 30)
      .fill()
      .fillColor('#0A2342')
      .fontSize(11)
      .font('Helvetica-Bold');

    const headers = ['DESCRIPTION', 'QUANTITY', 'UNIT PRICE', 'AMOUNT'];
    const headerPositions = [50, 300, 380, 460];
    
    headers.forEach((header, index) => {
      doc.text(header, headerPositions[index], tableY + 10);
    });

    // Header separator line
    doc
      .moveTo(50, tableY + 30)
      .lineTo(550, tableY + 30)
      .lineWidth(1)
      .strokeColor('#0A2342')
      .stroke();

    // Item row
    const itemY = tableY + 40;
    doc
      .fillColor('#1E293B')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Transportation Service', 50, itemY + 10);

    doc
      .font('Helvetica')
      .fillColor('#64748B')
      .fontSize(9)
      .text('Safe, reliable medical/non-medical transportation', 50, itemY + 25, { width: 230 });

    // Quantity, Unit Price, Amount
    doc
      .fillColor('#1E293B')
      .fontSize(10)
      .font('Helvetica')
      .text('1', 300, itemY + 10, { width: 70, align: 'center' })
      .text(`$${invoice.amount.toFixed(2)}`, 380, itemY + 10, { width: 70, align: 'right' })
      .text(`$${invoice.amount.toFixed(2)}`, 460, itemY + 10, { width: 90, align: 'right' });

    // Row separator
    doc
      .moveTo(50, itemY + 45)
      .lineTo(550, itemY + 45)
      .lineWidth(0.5)
      .strokeColor('#E2E8F0')
      .stroke();

    // Totals section
    const totalsY = itemY + 65;
    
    // Subtotal
    doc
      .fillColor('#64748B')
      .fontSize(10)
      .font('Helvetica')
      .text('Subtotal:', 380, totalsY)
      .fillColor('#1E293B')
      .font('Helvetica-Bold')
      .text(`$${invoice.amount.toFixed(2)}`, 460, totalsY, { width: 90, align: 'right' });

    // Tax (shown as $0.00 since no taxes)
    doc
      .fillColor('#64748B')
      .fontSize(10)
      .font('Helvetica')
      .text('Tax:', 380, totalsY + 20)
      .fillColor('#1E293B')
      .font('Helvetica-Bold')
      .text('$0.00', 460, totalsY + 20, { width: 90, align: 'right' });

    // Total separator
    doc
      .moveTo(380, totalsY + 40)
      .lineTo(550, totalsY + 40)
      .lineWidth(1)
      .strokeColor('#0A2342')
      .stroke();

    // Grand Total
    doc
      .fillColor('#0A2342')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL AMOUNT:', 380, totalsY + 55)
      .fillColor('#0A2342')
      .fontSize(14)
      .text(`$${invoice.amount.toFixed(2)}`, 460, totalsY + 55, { width: 90, align: 'right' });

    // Paid stamp if applicable
    if (invoice.status === 'PAID') {
      doc
        .fillColor('#10B981')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('PAID', 450, totalsY + 85, { 
          width: 100,
          align: 'center',
          oblique: true 
        });
    }
  }

  private createPaymentNotesSection(doc: InstanceType<typeof PDFDocument>, invoice: any) {
    const notesY = 680;
    
    // Payment Instructions
    doc
      .fillColor('#0A2342')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('PAYMENT INSTRUCTIONS', 50, notesY);

    const instructions = [
      '• Payment is due upon receipt of this invoice',
      '• Make checks payable to: Compassionate Medi Rides',
      '• For bank transfers, please contact us for account details',
      '• Credit/Debit card payments accepted over the phone',
      '• Please reference invoice number when making payment'
    ];

    instructions.forEach((instruction, index) => {
      doc
        .fillColor('#475569')
        .fontSize(10)
        .font('Helvetica')
        .text(instruction, 50, notesY + 25 + (index * 15));
    });

    // Notes section
    const notesX = 300;
    doc
      .fillColor('#0A2342')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('NOTES', notesX, notesY);

    doc
      .fillColor('#475569')
      .fontSize(10)
      .font('Helvetica')
      .text('Thank you for choosing Compassionate Medi Rides.', notesX, notesY + 25)
      .text('We appreciate your business and look forward to serving you again.', notesX, notesY + 40);

    if (invoice.notes) {
      doc
        .fillColor('#F59E0B')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Additional Notes:', notesX, notesY + 60)
        .fillColor('#92400E')
        .font('Helvetica')
        .text(invoice.notes, notesX, notesY + 75, { width: 200 });
    }
  }

  private createFooter(doc: InstanceType<typeof PDFDocument>) {
    const footerY = 780;
    
    // Footer separator
    doc
      .moveTo(50, footerY)
      .lineTo(550, footerY)
      .lineWidth(0.5)
      .strokeColor('#E2E8F0')
      .stroke();

    // Contact information
    doc
      .fillColor('#64748B')
      .fontSize(8)
      .font('Helvetica')
      .text('For questions about this invoice, please contact:', 50, footerY + 15)
      .font('Helvetica-Bold')
      .text(this.BUSINESS_INFO.phone, 50, footerY + 30)
      .font('Helvetica')
      .text(`or email ${this.BUSINESS_INFO.email}`, 50, footerY + 40);

    // Terms
    doc
      .fillColor('#94A3B8')
      .fontSize(7)
      .font('Helvetica')
      .text('All services subject to terms and conditions. Payment terms: Net 30.', 50, footerY + 60, { width: 500 });

    // Page number
    doc
      .fillColor('#94A3B8')
      .fontSize(7)
      .font('Helvetica')
      .text(`Page 1 of 1 | Generated: ${moment().format('MMMM DD, YYYY hh:mm A')}`, 50, footerY + 75, { 
        width: 500,
        align: 'center' 
      });
  }

  private addPaidWatermark(doc: InstanceType<typeof PDFDocument>) {
    doc.save();
    doc.translate(300, 400);
    doc.rotate(-45);
    
    doc
      .fillColor('#10B981')
      .fontSize(72)
      .font('Helvetica-Bold')
      .text('PAID', -100, 0, {
        opacity: 0.1
      });
    
    doc.restore();
  }

  private getStatusColor(status: string) {
    switch (status) {
      case 'PAID':
        return { background: '#D1FAE5', text: '#065F46' };
      case 'PENDING':
        return { background: '#FEF3C7', text: '#92400E' };
      case 'OVERDUE':
        return { background: '#FEE2E2', text: '#991B1B' };
      default:
        return { background: '#F3F4F6', text: '#374151' };
    }
  }

  private formatPaymentType(paymentType: string): string {
    switch (paymentType?.toLowerCase()) {
      case 'private':
        return 'Private Pay';
      case 'waiver':
        return 'Waiver Program';
      case 'insurance':
        return 'Insurance';
      default:
        return 'Private Pay';
    }
  }
}