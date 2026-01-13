import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from '../mail/email.service';
import { AuthModule } from '../auth/auth.module';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [DriversController, UploadController],
  providers: [DriversService, PrismaService, EmailService],
  exports: [DriversService],
})
export class DriversModule { }