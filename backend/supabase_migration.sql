-- Medi-Rides Database Migration for Supabase
-- Run this in Supabase Studio SQL Editor
-- Project: tqtzwqmeyvkozkrhptjf

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER');
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');
CREATE TYPE "ServiceType" AS ENUM ('MEDICAL', 'GENERAL');
CREATE TYPE "RideStatus" AS ENUM ('PENDING', 'ASSIGNED', 'CONFIRMED', 'DRIVER_EN_ROUTE', 'PICKUP_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'CASH', 'VOUCHER', 'CORPORATE_BILLING');
CREATE TYPE "methodType" AS ENUM ('private', 'waiver');
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'SUV', 'VAN', 'WHEELCHAIR_VAN', 'STRETCHER_VAN');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE');
CREATE TYPE "NotificationType" AS ENUM ('RIDE_BOOKED', 'RIDE_ASSIGNED', 'RIDE_UPDATED', 'RIDE_COMPLETED', 'PAYMENT_RECEIVED', 'SYSTEM_ALERT', 'PROMOTIONAL');
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "DocumentStatus" AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED', 'RENEWAL_IN_PROGRESS');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "EntityType" AS ENUM ('VEHICLE', 'DRIVER', 'COMPANY', 'OTHER');
CREATE TYPE "ReminderType" AS ENUM ('EMAIL', 'SMS', 'IN_APP');
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- Create Tables

-- Users Table
CREATE TABLE "users" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3)
);

-- Driver Availability Table
CREATE TABLE "driver_availabilities" (
    "id" SERIAL PRIMARY KEY,
    "driverId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Service Categories Table
CREATE TABLE "service_categories" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Rides Table
CREATE TABLE "rides" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Payments Table
CREATE TABLE "payments" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3)
);

-- Invoices Table
CREATE TABLE "invoices" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Addresses Table
CREATE TABLE "addresses" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "addresses_userId_label_key" UNIQUE ("userId", "label")
);

-- Refresh Tokens Table
CREATE TABLE "refresh_tokens" (
    "id" SERIAL PRIMARY KEY,
    "token" TEXT NOT NULL UNIQUE,
    "userId" INTEGER NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Driver Profiles Table
CREATE TABLE "driver_profiles" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Vehicles Table
CREATE TABLE "vehicles" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "driverProfileId" INTEGER
);

-- Patient Profiles Table
CREATE TABLE "patient_profiles" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL UNIQUE,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Service Areas Table
CREATE TABLE "service_areas" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "polygon" JSONB,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "pricePerMile" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Notifications Table
CREATE TABLE "notifications" (
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
CREATE TABLE "DocumentCategory" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT NOT NULL DEFAULT 'Tag',
    "requiresRenewal" BOOLEAN NOT NULL DEFAULT true,
    "renewalPeriodDays" INTEGER NOT NULL DEFAULT 365,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Document Tracking Table
CREATE TABLE "DocumentTracking" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" INTEGER,
    "userId" INTEGER
);

-- Document Renewals Table
CREATE TABLE "DocumentRenewal" (
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
CREATE TABLE "DocumentReminder" (
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
CREATE TABLE "document_stats" (
    "id" SERIAL PRIMARY KEY,
    "totalDocuments" INTEGER NOT NULL DEFAULT 0,
    "validDocuments" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonCount" INTEGER NOT NULL DEFAULT 0,
    "expiredDocuments" INTEGER NOT NULL DEFAULT 0,
    "renewalInProgress" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Paginated Documents Table
CREATE TABLE "paginated_documents" (
    "id" SERIAL PRIMARY KEY,
    "page" INTEGER NOT NULL,
    "pageSize" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "documents" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create Indexes
CREATE INDEX "driver_availabilities_driverId_idx" ON "driver_availabilities"("driverId");
CREATE INDEX "rides_customerId_idx" ON "rides"("customerId");
CREATE INDEX "rides_driverId_idx" ON "rides"("driverId");
CREATE INDEX "rides_serviceCategoryId_idx" ON "rides"("serviceCategoryId");
CREATE INDEX "payments_rideId_idx" ON "payments"("rideId");
CREATE INDEX "payments_customerId_idx" ON "payments"("customerId");
CREATE INDEX "invoices_rideId_idx" ON "invoices"("rideId");
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
CREATE INDEX "driver_profiles_userId_idx" ON "driver_profiles"("userId");
CREATE INDEX "vehicles_driverProfileId_idx" ON "vehicles"("driverProfileId");
CREATE INDEX "patient_profiles_userId_idx" ON "patient_profiles"("userId");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "DocumentTracking_documentNumber_idx" ON "DocumentTracking"("documentNumber");
CREATE INDEX "DocumentTracking_status_idx" ON "DocumentTracking"("status");
CREATE INDEX "DocumentTracking_priority_idx" ON "DocumentTracking"("priority");
CREATE INDEX "DocumentTracking_expiryDate_idx" ON "DocumentTracking"("expiryDate");
CREATE INDEX "DocumentTracking_entityType_entityId_idx" ON "DocumentTracking"("entityType", "entityId");
CREATE INDEX "DocumentTracking_categoryId_idx" ON "DocumentTracking"("categoryId");
CREATE INDEX "DocumentRenewal_documentId_idx" ON "DocumentRenewal"("documentId");
CREATE INDEX "DocumentReminder_documentId_idx" ON "DocumentReminder"("documentId");
CREATE INDEX "DocumentReminder_sentAt_idx" ON "DocumentReminder"("sentAt");

-- Add Foreign Key Constraints
ALTER TABLE "driver_availabilities" ADD CONSTRAINT "driver_availabilities_driverId_fkey" 
    FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rides" ADD CONSTRAINT "rides_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "rides" ADD CONSTRAINT "rides_driverId_fkey" 
    FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "rides" ADD CONSTRAINT "rides_serviceCategoryId_fkey" 
    FOREIGN KEY ("serviceCategoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_rideId_fkey" 
    FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_rideId_fkey" 
    FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driverProfileId_fkey" 
    FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "DocumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_updatedById_fkey" 
    FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentTracking" ADD CONSTRAINT "DocumentTracking_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentRenewal" ADD CONSTRAINT "DocumentRenewal_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "DocumentTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DocumentRenewal" ADD CONSTRAINT "DocumentRenewal_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DocumentRenewal" ADD CONSTRAINT "DocumentRenewal_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentReminder" ADD CONSTRAINT "DocumentReminder_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "DocumentTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Success message
SELECT 'Database schema created successfully! 🎉' as message;
