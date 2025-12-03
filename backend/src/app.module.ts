import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import authConfig from './config/auth.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaService } from 'prisma/prisma.service';
import { RidesModule } from './rides/rides.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './driver/drivers.module';
import { DriverDashboardModule } from './driver/driver-dashboard.module';
import { AdminModule } from './admin/admin.module';
import { DriverRidesModule } from './driver/driver-rides.module';
import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { PublicModule } from './public/public.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
    }),
    AuthModule,
    RidesModule,
    CloudinaryModule,
    VehiclesModule,
    DriversModule,
    DriverDashboardModule,
    AdminModule,
    DriverRidesModule,
    ServiceCategoriesModule,
    PublicModule,
    InvoiceModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}