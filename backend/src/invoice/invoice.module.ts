import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PrismaService } from 'prisma/prisma.service';
import { PDFService } from './pdf.service';
import { EmailService } from 'src/mail/email.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService, PDFService, EmailService],
})
export class InvoiceModule {}