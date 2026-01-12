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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './dashboard/analytics.module';
import { DocumentTrackingModule } from './document-tracking/document-tracking.module';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
    }),
    MulterModule.register({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}),
    // Fix 1: Serve from project root, not dist folder
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    // Fix 2: Alternatively, serve only invoices folder
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads', 'invoices'),
      serveRoot: '/uploads/invoices',
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
    DashboardModule,
    AnalyticsModule,
    DocumentTrackingModule
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