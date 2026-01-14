import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [MailModule],
  controllers: [RidesController],
  providers: [RidesService, PrismaService],
  exports: [RidesService],
})

export class RidesModule { }