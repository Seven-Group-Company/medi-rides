import { Module } from '@nestjs/common';
import { ServiceCategoriesController } from './service-categories.controller';
import { ServiceCategoriesService } from './service-categories.service';
import { PrismaService } from 'prisma/prisma.service';
import { ServiceCategoriesPublicController } from './service-categories-public.controller';

@Module({
  controllers: [ServiceCategoriesController, ServiceCategoriesPublicController],
  providers: [ServiceCategoriesService, PrismaService],
  exports: [ServiceCategoriesService],
})
export class ServiceCategoriesModule {}