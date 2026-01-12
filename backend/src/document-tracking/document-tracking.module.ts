import { Module } from '@nestjs/common';
import { DocumentTrackingService } from './document-tracking.service';
import { DocumentTrackingController } from './document-tracking.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    CloudinaryModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [DocumentTrackingController],
  providers: [DocumentTrackingService, PrismaService],
  exports: [DocumentTrackingService],
})
export class DocumentTrackingModule {}