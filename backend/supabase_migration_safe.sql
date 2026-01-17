-- Medi-Rides Database Migration for Supabase (SAFE VERSION)
-- This version won't fail if objects already exist
-- Run this in Supabase Studio SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums (with DO block to handle if they exist)
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ServiceType" AS ENUM ('MEDICAL', 'GENERAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RideStatus" AS ENUM ('PENDING', 'ASSIGNED', 'CONFIRMED', 'DRIVER_EN_ROUTE', 'PICKUP_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'CASH', 'VOUCHER', 'CORPORATE_BILLING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "methodType" AS ENUM ('private', 'waiver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'SUV', 'VAN', 'WHEELCHAIR_VAN', 'STRETCHER_VAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('RIDE_BOOKED', 'RIDE_ASSIGNED', 'RIDE_UPDATED', 'RIDE_COMPLETED', 'PAYMENT_RECEIVED', 'SYSTEM_ALERT', 'PROMOTIONAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DocumentStatus" AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED', 'RENEWAL_IN_PROGRESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EntityType" AS ENUM ('VEHICLE', 'DRIVER', 'COMPANY', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReminderType" AS ENUM ('EMAIL', 'SMS', 'IN_APP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Tables (only if they don't exist)

-- Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3)
);

-- Driver Availability Table
CREATE TABLE IF NOT EXISTS "driver_availabilities" (
    "id" SERIAL PRIMARY KEY,
    "driverId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service Categories Table
CREATE TABLE IF NOT EXISTS "service_categories" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 15.00,
    "pricePerMile" DOUBLE PRECISION NOT NULL DEFAULT 1.50,
    "serviceType" "ServiceType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rides Table
CREATE TABLE IF NOT EXISTS "rides" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER,
    "driverId" INTEGER,
    "pickupAddress" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION,
    "pickupLongitude" DOUBLE PRECISION,
    "dropoffAddress" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "duration" INTEGER,
    "dropoffLatitude" DOUBLE PRECISION,
    "dropoffLongitude" DOUBLE PRECISION,
    "serviceCategoryId" INTEGER NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "status" "RideStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "actualPickupAt" TIMESTAMP(3),
    "actualDropoffAt" TIMESTAMP(3),
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "passengerName" TEXT,
    "passengerPhone" TEXT,
    "paymentType" "methodType" NOT NULL DEFAULT 'private',
    "specialNeeds" TEXT,
    "additionalNotes" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS "payments" (
    "id" SERIAL PRIMARY KEY,
    "rideId" INTEGER NOT NULL UNIQUE,
    "customerId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "transactionId" TEXT,
    "billingName" TEXT,
    "billingEmail" TEXT,
    "billingPhone" TEXT,
    "billingAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" SERIAL PRIMARY KEY,
    "rideId" INTEGER NOT NULL UNIQUE,
    "invoiceNumber" TEXT NOT NULL UNIQUE,
    "amount" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "pdfUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS "addresses" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "addresses_userId_label_key" UNIQUE ("userId", "label")
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" SERIAL PRIMARY KEY,
    "token" TEXT NOT NULL UNIQUE,
    "userId" INTEGER NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Driver Profiles Table
CREATE TABLE IF NOT EXISTS "driver_profiles" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL UNIQUE,
    "licenseNumber" TEXT NOT NULL,
    "licenseState" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "vehicleInfo" TEXT,
    "insuranceInfo" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION DEFAULT 5.0,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" SERIAL PRIMARY KEY,
    "driverId" INTEGER,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL UNIQUE,
    "vin" TEXT,
    "type" "VehicleType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "hasWheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
    "hasOxygenSupport" BOOLEAN NOT NULL DEFAULT false,
    "insuranceExpiry" TIMESTAMP(3) NOT NULL,
    "registrationExpiry" TIMESTAMP(3) NOT NULL,
    "liabilityInsuranceExpiry" TIMESTAMP(3),
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driverProfileId" INTEGER
);

-- Patient Profiles Table
CREATE TABLE IF NOT EXISTS "patient_profiles" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL UNIQUE,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service Areas Table
CREATE TABLE IF NOT EXISTS "service_areas" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "polygon" JSONB,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "pricePerMile" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3)
);

-- Document Categories Table
CREATE TABLE IF NOT EXISTS "DocumentCategory" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT NOT NULL DEFAULT 'Tag',
    "requiresRenewal" BOOLEAN NOT NULL DEFAULT true,
    "renewalPeriodDays" INTEGER NOT NULL DEFAULT 365,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Document Tracking Table
CREATE TABLE IF NOT EXISTS "DocumentTracking" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "documentNumber" TEXT NOT NULL,
    "documentType" TEXT,
    "categoryId" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3),
    "lastReminderSent" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'VALID',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "entityType" "EntityType" NOT NULL DEFAULT 'OTHER',
    "entityId" INTEGER,
    "entityName" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "tags" TEXT[],
    "notes" TEXT,
    "reminderDays" INTEGER NOT NULL DEFAULT 30,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" INTEGER,
    "userId" INTEGER
);

-- Document Renewals Table
CREATE TABLE IF NOT EXISTS "DocumentRenewal" (
    "id" SERIAL PRIMARY KEY,
    "documentId" INTEGER NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "notes" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER
);

-- Document Reminders Table
CREATE TABLE IF NOT EXISTS "DocumentReminder" (
    "id" SERIAL PRIMARY KEY,
    "documentId" INTEGER NOT NULL,
    "reminderType" "ReminderType" NOT NULL DEFAULT 'IN_APP',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "status" "ReminderStatus" NOT NULL DEFAULT 'SENT',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Document Stats Table
CREATE TABLE IF NOT EXISTS "document_stats" (
    "id" SERIAL PRIMARY KEY,
    "totalDocuments" INTEGER NOT NULL DEFAULT 0,
    "validDocuments" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonCount" INTEGER NOT NULL DEFAULT 0,
    "expiredDocuments" INTEGER NOT NULL DEFAULT 0,
    "renewalInProgress" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Paginated Documents Table
CREATE TABLE IF NOT EXISTS "paginated_documents" (
    "id" SERIAL PRIMARY KEY,
    "page" INTEGER NOT NULL,
    "pageSize" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "documents" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes (if not exists)
CREATE INDEX IF NOT EXISTS "driver_availabilities_driverId_idx" ON "driver_availabilities"("driverId");
CREATE INDEX IF NOT EXISTS "rides_customerId_idx" ON "rides"("customerId");
CREATE INDEX IF NOT EXISTS "rides_driverId_idx" ON "rides"("driverId");
CREATE INDEX IF NOT EXISTS "rides_serviceCategoryId_idx" ON "rides"("serviceCategoryId");
CREATE INDEX IF NOT EXISTS "payments_rideId_idx" ON "payments"("rideId");
CREATE INDEX IF NOT EXISTS "payments_customerId_idx" ON "payments"("customerId");
CREATE INDEX IF NOT EXISTS "invoices_rideId_idx" ON "invoices"("rideId");
CREATE INDEX IF NOT EXISTS "addresses_userId_idx" ON "addresses"("userId");
CREATE INDEX IF NOT EXISTS "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
CREATE INDEX IF NOT EXISTS "driver_profiles_userId_idx" ON "driver_profiles"("userId");
CREATE INDEX IF NOT EXISTS "vehicles_driverProfileId_idx" ON "vehicles"("driverProfileId");
CREATE INDEX IF NOT EXISTS "patient_profiles_userId_idx" ON "patient_profiles"("userId");
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "DocumentTracking_documentNumber_idx" ON "DocumentTracking"("documentNumber");
CREATE INDEX IF NOT EXISTS "DocumentTracking_status_idx" ON "DocumentTracking"("status");
CREATE INDEX IF NOT EXISTS "DocumentTracking_priority_idx" ON "DocumentTracking"("priority");
CREATE INDEX IF NOT EXISTS "DocumentTracking_expiryDate_idx" ON "DocumentTracking"("expiryDate");
CREATE INDEX IF NOT EXISTS "DocumentTracking_entityType_entityId_idx" ON "DocumentTracking"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "DocumentTracking_categoryId_idx" ON "DocumentTracking"("categoryId");
CREATE INDEX IF NOT EXISTS "DocumentRenewal_documentId_idx" ON "DocumentRenewal"("documentId");
CREATE INDEX IF NOT EXISTS "DocumentReminder_documentId_idx" ON "DocumentReminder"("documentId");
CREATE INDEX IF NOT EXISTS "DocumentReminder_sentAt_idx" ON "DocumentReminder"("sentAt");

-- Add Foreign Key Constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driver_availabilities_driverId_fkey') THEN
        ALTER TABLE "driver_availabilities" ADD CONSTRAINT "driver_availabilities_driverId_fkey" 
            FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rides_customerId_fkey') THEN
        ALTER TABLE "rides" ADD CONSTRAINT "rides_customerId_fkey" 
            FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rides_driverId_fkey') THEN
        ALTER TABLE "rides" ADD CONSTRAINT "rides_driverId_fkey" 
            FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rides_serviceCategoryId_fkey') THEN
        ALTER TABLE "rides" ADD CONSTRAINT "rides_serviceCategoryId_fkey" 
            FOREIGN KEY ("serviceCategoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_rideId_fkey') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_rideId_fkey" 
            FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_customerId_fkey') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" 
            FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_rideId_fkey') THEN
        ALTER TABLE "invoices" ADD CONSTRAINT "invoices_rideId_fkey" 
            FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'addresses_userId_fkey') THEN
        ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_userId_fkey') THEN
        ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driver_profiles_userId_fkey') THEN
        ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_driverProfileId_fkey') THEN
        ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driverProfileId_fkey" 
            FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_profiles_userId_fkey') THEN
        ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_userId_fkey') THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentTracking_categoryId_fkey') THEN
        ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_categoryId_fkey" 
            FOREIGN KEY ("categoryId") REFERENCES "DocumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentTracking_createdById_fkey') THEN
        ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_createdById_fkey" 
            FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentTracking_updatedById_fkey') THEN
        ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_updatedById_fkey" 
            FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentTracking_userId_fkey') THEN
        ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentRenewal_documentId_fkey') THEN
        ALTER TABLE "DocumentRenewal" ADD CONSTRAINT "DocumentRenewal_documentId_fkey" 
            FOREIGN KEY ("documentId") REFERENCES "DocumentTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentRenewal_createdById_fkey') THEN
        ALTER TABLE "DocumentRenewal" ADD CONSTRAINT "DocumentRenewal_createdById_fkey" 
            FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentRenewal_userId_fkey') THEN
        ALTER TABLE "DocumentRenewal" ADD CONSTRAINT "DocumentRenewal_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DocumentReminder_documentId_fkey') THEN
        ALTER TABLE "DocumentReminder" ADD CONSTRAINT "DocumentReminder_documentId_fkey" 
            FOREIGN KEY ("documentId") REFERENCES "DocumentTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Success message
SELECT 'Database schema created/updated successfully! ✅' as message;
SELECT 'All existing objects were preserved.' as note;
