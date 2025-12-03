import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { PrismaService } from 'prisma/prisma.service';
import { AdminRidesController } from 'src/rides/admin-rides.controller';
import { AdminCustomersController } from 'src/customer/admin-customers.controller';
import { AdminRidesService } from 'src/rides/admin-rides.service';
import { AdminCustomersService } from 'src/customer/admin-customers.service';
import { InvoiceService } from 'src/invoice/invoice.service';
import { PDFService } from 'src/invoice/pdf.service';
import { EmailService } from 'src/mail/email.service';

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
export class AdminModule {}