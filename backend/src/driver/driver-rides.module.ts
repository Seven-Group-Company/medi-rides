import { Module } from '@nestjs/common';
import { DriverRidesController } from './driver-rides.controller';
import { DriverRidesService } from './driver-rides.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [DriverRidesController],
  providers: [DriverRidesService, PrismaService],
  exports: [DriverRidesService],
})
export class DriverRidesModule {}