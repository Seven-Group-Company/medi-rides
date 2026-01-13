import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { PrismaService } from 'prisma/prisma.service';
import { AdminRidesController } from '../rides/admin-rides.controller';
import { AdminCustomersController } from '../customer/admin-customers.controller';
import { AdminRidesService } from '../rides/admin-rides.service';
import { AdminCustomersService } from '../customer/admin-customers.service';
import { InvoiceService } from '../invoice/invoice.service';
import { PDFService } from '../invoice/pdf.service';
import { EmailService } from '../mail/email.service';

@Module({
  imports: [],
  controllers: [
    AdminRidesController,
    AdminCustomersController,
    AdminStatsController,
  ],
  providers: [
    AdminRidesService,
    AdminCustomersService,
    AdminStatsService,
    PrismaService,
    InvoiceService,
    PDFService,
    EmailService,
  ],
  exports: [
    AdminRidesService,
    AdminCustomersService,
    AdminStatsService,
  ],
})
export class AdminModule { }