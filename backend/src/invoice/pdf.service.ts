import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import PDFKit from 'pdfkit';

@Injectable()
export class PDFService {
  async generateInvoice(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Company Header
        doc
          .fontSize(20)
          .fillColor('#333333')
          .text('TRANSPORT SERVICES', { align: 'center' })
          .moveDown();

        doc
          .fontSize(10)
          .fillColor('#666666')
          .text('123 Business Street, City, State 12345', { align: 'center' })
          .text('Phone: (555) 123-4567 | Email: info@transportsvc.com', { align: 'center' })
          .moveDown(2);

        // Invoice Title
        doc
          .fontSize(24)
          .fillColor('#2c5282')
          .text('INVOICE', { align: 'center' })
          .moveDown();

        // Invoice Details
        doc
          .fontSize(12)
          .fillColor('#333333');

        // Left column
        const leftX = 50;
        doc.text('Bill To:', leftX, doc.y, { continued: false });
        doc.font('Helvetica-Bold').text(invoice.ride.customer.name, leftX + 80, doc.y - 20);
        doc.font('Helvetica');
        
        if (invoice.ride.customer.email) {
          doc.text(invoice.ride.customer.email, leftX + 80, doc.y);
        }
        
        if (invoice.ride.customer.phone) {
          doc.text(invoice.ride.customer.phone, leftX + 80, doc.y);
        }

        // Right column
        const rightX = 350;
        doc
          .text('Invoice #:', rightX, 200, { continued: false })
          .font('Helvetica-Bold')
          .text(invoice.invoiceNumber, rightX + 80, 200);

        doc
          .font('Helvetica')
          .text('Invoice Date:', rightX, doc.y + 20, { continued: false })
          .font('Helvetica-Bold')
          .text(new Date(invoice.issuedDate).toLocaleDateString(), rightX + 80, doc.y);

        doc
          .font('Helvetica')
          .text('Due Date:', rightX, doc.y + 20, { continued: false })
          .font('Helvetica-Bold')
          .text(new Date(invoice.dueDate).toLocaleDateString(), rightX + 80, doc.y);

        // Ride Details Section
        doc.moveDown(3);
        doc
          .fontSize(14)
          .fillColor('#2c5282')
          .text('Ride Details', { underline: true })
          .moveDown();

        doc
          .fontSize(11)
          .fillColor('#333333');

        const rideDetails = [
          ['Ride ID:', invoice.ride.id.toString()],
          ['Date:', new Date(invoice.ride.date).toLocaleDateString()],
          ['Time:', invoice.ride.time],
          ['Pickup:', invoice.ride.pickupAddress],
          ['Dropoff:', invoice.ride.dropoffAddress],
        ];

        rideDetails.forEach(([label, value]) => {
          doc.text(label, leftX, doc.y, { continued: false });
          doc.text(value, leftX + 100, doc.y);
        });

        // Invoice Items Table
        doc.moveDown(3);
        this.createInvoiceTable(doc, invoice);

        // Payment Instructions
        doc.moveDown(4);
        doc
          .fontSize(10)
          .fillColor('#666666')
          .text('Payment Instructions:', leftX, doc.y)
          .moveDown(0.5);

        doc.text('• Make payment via bank transfer to account #: 1234567890', leftX, doc.y);
        doc.text('• Please include invoice number as reference', leftX, doc.y);
        doc.text('• Payment due within 30 days', leftX, doc.y);

        // Footer
        const bottomY = doc.page.height - 100;
        doc
          .fontSize(8)
          .fillColor('#999999')
          .text('Thank you for your business!', 50, bottomY, { align: 'center' })
          .text('For any questions, please contact: support@transportsvc.com', 50, doc.y + 10, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  private createInvoiceTable(doc: InstanceType<typeof PDFDocument>, invoice: any) {
    const tableTop = doc.y;
    const itemX = 50;
    const quantityX = 350;
    const priceX = 400;
    const totalX = 470;

    // Table Headers
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#2c5282')
      .text('Description', itemX, tableTop)
      .text('Amount', priceX, tableTop)
      .text('Tax', totalX - 30, tableTop)
      .text('Total', totalX, tableTop);

    // Line under headers
    doc
      .moveTo(itemX, tableTop + 15)
      .lineTo(totalX + 50, tableTop + 15)
      .strokeColor('#cccccc')
      .lineWidth(1)
      .stroke();

    // Invoice Item
    const itemY = tableTop + 25;
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#333333')
      .text('Ride Service - Transport', itemX, itemY)
      .text(`$${invoice.amount.toFixed(2)}`, priceX, itemY)
      .text(`$${invoice.tax.toFixed(2)}`, totalX - 30, itemY)
      .text(`$${invoice.totalAmount.toFixed(2)}`, totalX, itemY);

    // Line under item
    doc
      .moveTo(itemX, itemY + 15)
      .lineTo(totalX + 50, itemY + 15)
      .strokeColor('#eeeeee')
      .lineWidth(0.5)
      .stroke();

    // Total Line
    const totalY = itemY + 35;
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#2c5282')
      .text('Total Due:', priceX - 80, totalY)
      .text(`$${invoice.totalAmount.toFixed(2)}`, totalX, totalY);

    // Update y position
    doc.y = totalY + 30;
  }
}