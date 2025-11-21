import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { PrismaService } from 'prisma/prisma.service';
import { AdminRidesController } from 'src/rides/admin-rides.controller';
import { AdminCustomersController } from 'src/customer/admin-customers.controller';
import { AdminRidesService } from 'src/rides/admin-rides.service';
import { AdminCustomersService } from 'src/customer/admin-customers.service';

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
  ],
  exports: [
    AdminRidesService,
    AdminCustomersService,
    AdminStatsService,
  ],
})
export class AdminModule {}