# Medi Rides Backend API

**NestJS REST API for Medical Transportation Platform**

Enterprise-grade backend service powering the Compassionate Medi Rides platform with authentication, ride management, fleet tracking, and document compliance.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Module Breakdown](#module-breakdown)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Authentication](#authentication)
7. [Business Logic](#business-logic)
8. [DTOs & Validation](#dtos--validation)
9. [Error Handling](#error-handling)
10. [Setup & Development](#setup--development)

---

## Overview

### Tech Stack

- **Framework**: NestJS 11.x (TypeScript)
- **ORM**: Prisma 6.x
- **Database**: PostgreSQL
- **Authentication**: Passport (JWT + Google OAuth)
- **File Storage**: Cloudinary
- **Email**: Nodemailer + Resend
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Core Capabilities

- 🔐 **Multi-strategy Authentication** (Local + OAuth2)
- 🚗 **Ride Booking & Management** (Customer & Driver)
- 📋 **Document Compliance Tracking** (Licenses, Insurance)
- 🚙 **Fleet Management** (Vehicles, Availability)
- 💰 **Payment Processing** (Multiple payment methods)
- 📊 **Analytics Dashboard** (Business metrics)
- 📧 **Email Notifications** (Verification, Alerts)
- 📄 **Invoice Generation** (PDF creation)

---

## Architecture

### Design Pattern

**Modular Monolith** with clear separation of concerns:

```
Controller → Service → Prisma → Database
   ↓          ↓
  DTOs      Business
Validation   Logic
```

### Layers

1. **Controllers**: HTTP request handling, validation
2. **Services**: Business logic, data manipulation
3. **Prisma Service**: Database access layer
4. **Guards**: Authentication & authorization
5. **Filters**: Global exception handling
6. **Pipes**: Data transformation & validation

### Module Structure

```
src/
├── auth/              # Authentication & user management
├── rides/             # Ride booking system
├── driver/            # Driver operations
├── admin/             # Admin operations
├── vehicles/          # Fleet management
├── document-tracking/ # Compliance documents
├── invoice/           # Billing & invoicing
├── dashboard/         # Analytics
├── service-categories/# Service types
├── cloudinary/        # File uploads
├── mail/              # Email service
├── public/            # Public endpoints
└── common/            # Shared utilities
    ├── decorators/
    ├── filters/
    ├── guards/
    └── types/
```

---

## Module Breakdown

### Auth Module (`src/auth/`)

**Purpose**: User authentication, registration, and profile management

**Controllers**:
- `AuthController` - Auth endpoints

**Services**:
- `AuthService` - Core auth logic
- `JwtStrategy` - JWT validation
- `GoogleStrategy` - OAuth integration
- `LocalStrategy` - Email/password login

**Key Features**:
- User registration with email verification
- Login (local + Google OAuth)
- Password reset flow
- Token refresh mechanism
- Profile management

**Guards**:
- `JwtAuthGuard` - Protect routes with JWT
- `RolesGuard` - Role-based access control
- `GoogleOAuthGuard` - OAuth flow

---

### Rides Module (`src/rides/`)

**Purpose**: Ride booking and management

**Controllers**:
- `RidesController` - Customer ride operations
- `AdminRidesController` - Admin ride management

**Services**:
- `RidesService` - Ride CRUD operations
- `AdminRidesService` - Admin-specific operations

**Key Features**:
- Guest ride booking (no auth required)
- Authenticated user bookings
- Ride status tracking
- Service category management
- Distance/duration calculation
- Ride history retrieval

**DTOs**:
- `CreateRideDto` - Booking validation
- `CreateGuestRideDto` - Guest booking
- `UpdateRideStatusDto` - Status changes

---

### Driver Module (`src/driver/`)

**Purpose**: Driver-specific operations

**Components**:
- `DriversModule` - Driver management
- `DriverDashboardModule` - Dashboard data
- `DriverRidesModule` - Assigned rides

**Key Features**:
- Driver registration
- Availability management
- Assigned ride retrieval
- Ride status updates
- Profile management

---

### Vehicles Module (`src/vehicles/`)

**Purpose**: Fleet management

**Key Features**:
- Vehicle registration
- Maintenance tracking
- Availability status
- Wheelchair/oxygen support flags
- Insurance expiry tracking
- Assignment to drivers

---

### Document Tracking Module (`src/document-tracking/`)

**Purpose**: Compliance document management

**Key Features**:
- Document upload (licenses, insurance, registrations)
- Expiry tracking with auto-reminders
- Renewal workflow
- Multi-entity support (Vehicle, Driver, Company)
- Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- Email notifications for expiring documents

**Document Status Flow**:
```
VALID → EXPIRING_SOON (30 days) → EXPIRED → RENEWAL_IN_PROGRESS
```

---

### Invoice Module (`src/invoice/`)

**Purpose**: Billing and invoice generation

**Key Features**:
- PDF invoice creation
- Linked to completed rides
- Tax calculation
- Due date management
- Invoice number generation
- PDF storage (local + Cloudinary)

---

### Dashboard Module (`src/dashboard/`)

**Purpose**: Analytics and reporting

**Components**:
- `DashboardModule` - Core dashboard
- `AnalyticsModule` - Business metrics

**Metrics**:
- Total rides (pending, completed, cancelled)
- Revenue analytics
- Driver performance
- Vehicle utilization
- Document compliance status

---

### Service Categories Module (`src/service-categories/`)

**Purpose**: Service type management

**Categories**:
- Medical Transportation
- Non-Medical Transportation
- Emergency Transport
- Wheelchair Services
- Dialysis Transport

**Pricing**:
- Base price per service
- Price per mile
- Custom pricing rules

---

### Mail Module (`src/mail/`)

**Purpose**: Email delivery

**Providers**:
- Nodemailer (SMTP)
- Resend (alternative)

**Email Types**:
- Email verification
- Password reset
- Ride confirmations
- Document expiry alerts

---

### Cloudinary Module (`src/cloudinary/`)

**Purpose**: File upload and storage

**Supported Files**:
- User avatars
- Vehicle images
- Document PDFs
- Invoice PDFs

**Features**:
- Auto-optimization
- CDN delivery
- Secure URLs

---

## API Endpoints

### Base URL

```
http://localhost:1000
```

### Authentication Endpoints

#### POST `/auth/register`

Register a new user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful. Please check your email.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

#### POST `/auth/login`

Login with credentials

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "refresh_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

#### GET `/auth/verify-email?token={token}`

Verify email address

**Response** (200):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### POST `/auth/forgot-password`

Request password reset

**Request**:
```json
{
  "email": "user@example.com"
}
```

#### POST `/auth/reset-password`

Reset password with token

**Request**:
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123!"
}
```

#### POST `/auth/refresh`

Refresh access token

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

#### GET `/auth/profile` 🔒

Get current user profile

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CUSTOMER",
  "phone": "+1234567890",
  "isVerified": true
}
```

---

### Ride Endpoints

#### POST `/rides/guest`

Create guest ride booking (no auth)

**Request**:
```json
{
  "passengerName": "Jane Smith",
  "passengerPhone": "+1234567890",
  "pickupAddress": "123 Main St, City, State",
  "dropoffAddress": "456 Oak Ave, City, State",
  "serviceCategoryId": 1,
  "scheduledAt": "2024-01-20T10:00:00Z",
  "specialNeeds": "Wheelchair accessible",
  "paymentType": "private"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Ride booking created successfully",
  "data": {
    "id": 42,
    "status": "PENDING",
    "basePrice": 45.00,
    "scheduledAt": "2024-01-20T10:00:00Z"
  }
}
```

#### POST `/rides` 🔒

Create authenticated ride booking

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "pickupAddress": "123 Main St",
  "pickupLatitude": 40.7128,
  "pickupLongitude": -74.0060,
  "dropoffAddress": "456 Oak Ave",
  "dropoffLatitude": 40.7589,
  "dropoffLongitude": -73.9851,
  "serviceCategoryId": 1,
  "serviceType": "MEDICAL",
  "scheduledAt": "2024-01-20T10:00:00Z",
  "distance": 5.2,
  "duration": 15,
  "specialNeeds": "Oxygen support needed"
}
```

#### GET `/rides` 🔒

Get user's ride history

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "pickupAddress": "123 Main St",
      "dropoffAddress": "456 Oak Ave",
      "status": "COMPLETED",
      "scheduledAt": "2024-01-20T10:00:00Z",
      "driver": {
        "name": "John Driver",
        "phone": "+1234567890"
      },
      "basePrice": 45.00,
      "finalPrice": 48.50
    }
  ]
}
```

#### GET `/rides/upcoming` 🔒

Get upcoming rides (limit = 3 by default)

**Query Params**:
- `limit` (optional): Number of rides to return

#### GET `/rides/:id` 🔒

Get ride details

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 42,
    "pickupAddress": "123 Main St",
    "dropoffAddress": "456 Oak Ave",
    "status": "IN_PROGRESS",
    "customer": { ... },
    "driver": { ... },
    "serviceCategory": { ... }
  }
}
```

---

### Admin Ride Endpoints

#### GET `/admin/rides` 🔒

**Role**: ADMIN, DISPATCHER

Get all rides with filters

**Query Params**:
- `status`: Filter by status
- `startDate`, `endDate`: Date range
- `page`, `limit`: Pagination

**Response** (200):
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "totalPages": 15
}
```

#### PATCH `/admin/rides/:id/assign` 🔒

**Role**: ADMIN, DISPATCHER

Assign driver to ride

**Request**:
```json
{
  "driverId": 5
}
```

#### PATCH `/admin/rides/:id/status` 🔒

**Role**: ADMIN, DISPATCHER

Update ride status

**Request**:
```json
{
  "status": "CONFIRMED"
}
```

---

### Driver Endpoints

#### GET `/driver/rides` 🔒

**Role**: DRIVER

Get assigned rides

**Response** (200):
```json
{
  "data": [
    {
      "id": 42,
      "customer": {
        "name": "Jane Doe",
        "phone": "+1234567890"
      },
      "pickupAddress": "123 Main St",
      "status": "ASSIGNED",
      "scheduledAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

#### PATCH `/driver/rides/:id/status` 🔒

**Role**: DRIVER

Update ride status (DRIVER_EN_ROUTE, PICKUP_ARRIVED, IN_PROGRESS, COMPLETED)

**Request**:
```json
{
  "status": "IN_PROGRESS",
  "actualPickupAt": "2024-01-20T10:05:00Z"
}
```

#### GET `/driver/availability` 🔒

**Role**: DRIVER

Get availability schedule

#### POST `/driver/availability` 🔒

**Role**: DRIVER

Set availability

**Request**:
```json
{
  "startTime": "2024-01-20T08:00:00Z",
  "endTime": "2024-01-20T18:00:00Z",
  "isAvailable": true
}
```

---

### Vehicle Endpoints

#### POST `/vehicles` 🔒

**Role**: ADMIN

Register new vehicle

**Request**:
```json
{
  "make": "Toyota",
  "model": "Sienna",
  "year": 2023,
  "color": "White",
  "licensePlate": "ABC123",
  "vin": "1HGBH41JXMN109186",
  "type": "WHEELCHAIR_VAN",
  "capacity": 4,
  "hasWheelchairAccess": true,
  "hasOxygenSupport": true,
  "insuranceExpiry": "2025-12-31",
  "registrationExpiry": "2025-06-30"
}
```

#### GET `/vehicles` 🔒

**Role**: ADMIN, DISPATCHER

List all vehicles

#### GET `/vehicles/:id` 🔒

Get vehicle details

#### PATCH `/vehicles/:id` 🔒

**Role**: ADMIN

Update vehicle

#### DELETE `/vehicles/:id` 🔒

**Role**: ADMIN

Delete vehicle

---

### Document Tracking Endpoints

#### POST `/document-tracking` 🔒

**Role**: ADMIN

Upload document

**Request** (multipart/form-data):
```json
{
  "title": "Driver License - John Doe",
  "documentNumber": "DL123456789",
  "categoryId": 1,
  "issueDate": "2020-01-15",
  "expiryDate": "2025-01-15",
  "entityType": "DRIVER",
  "entityId": 5,
  "priority": "HIGH",
  "file": "<PDF file>"
}
```

#### GET `/document-tracking` 🔒

**Role**: ADMIN

Get all documents with filters

**Query Params**:
- `status`: VALID, EXPIRING_SOON, EXPIRED
- `priority`: LOW, MEDIUM, HIGH, CRITICAL
- `entityType`: VEHICLE, DRIVER, COMPANY

#### GET `/document-tracking/expiring-soon` 🔒

**Role**: ADMIN

Get documents expiring within 30 days

#### POST `/document-tracking/:id/renew` 🔒

**Role**: ADMIN

Renew document

---

### Service Categories Endpoints

#### GET `/service-categories`

Get all active service categories (public)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Medical Transportation",
      "value": "MEDICAL_TRANSPORT",
      "description": "Non-emergency medical transport",
      "basePrice": 15.00,
      "pricePerMile": 1.50,
      "serviceType": "MEDICAL"
    }
  ]
}
```

---

### Invoice Endpoints

#### POST `/invoices/generate/:rideId` 🔒

**Role**: ADMIN

Generate invoice for ride

**Response** (201):
```json
{
  "id": 10,
  "invoiceNumber": "INV-2024-00010",
  "rideId": 42,
  "amount": 45.00,
  "tax": 3.50,
  "totalAmount": 48.50,
  "pdfUrl": "https://cloudinary.com/invoices/INV-2024-00010.pdf",
  "status": "PENDING"
}
```

#### GET `/invoices/:id` 🔒

Get invoice details

#### GET `/invoices/ride/:rideId` 🔒

Get invoice for specific ride

---

## Database Schema

### Core Models

#### User
```prisma
model User {
  id                       Int
  email                    String @unique
  password                 String?
  name                     String
  role                     UserRole @default(CUSTOMER)
  phone                    String?
  isVerified               Boolean @default(false)
  provider                 AuthProvider @default(LOCAL)
  
  // Relations
  customerRides     Ride[] @relation("CustomerRides")
  driverRides       Ride[] @relation("DriverRides")
  driverProfile     DriverProfile?
  payments          Payment[]
  documentTrackings DocumentTracking[]
}
```

#### Ride
```prisma
model Ride {
  id                Int
  customerId        Int?
  driverId          Int?
  pickupAddress     String
  dropoffAddress    String
  serviceCategoryId Int
  serviceType       ServiceType
  status            RideStatus @default(PENDING)
  scheduledAt       DateTime
  isGuest           Boolean @default(false)
  passengerName     String?
  basePrice         Float
  finalPrice        Float?
  
  // Relations
  customer          User? @relation("CustomerRides")
  driver            User? @relation("DriverRides")
  serviceCategory   ServiceCategory
  payment           Payment?
  invoice           Invoice?
}
```

#### Vehicle
```prisma
model Vehicle {
  id                     Int
  make                   String
  model                  String
  year                   Int
  licensePlate           String @unique
  type                   VehicleType
  capacity               Int
  hasWheelchairAccess    Boolean @default(false)
  hasOxygenSupport       Boolean @default(false)
  insuranceExpiry        DateTime
  registrationExpiry     DateTime
  status                 VehicleStatus @default(AVAILABLE)
}
```

#### DocumentTracking
```prisma
model DocumentTracking {
  id             Int
  title          String
  documentNumber String
  categoryId     Int
  issueDate      DateTime
  expiryDate     DateTime
  status         DocumentStatus @default(VALID)
  priority       Priority @default(MEDIUM)
  entityType     EntityType
  entityId       Int?
  fileUrl        String
  
  // Relations
  category       DocumentCategory
  renewals       DocumentRenewal[]
  reminders      DocumentReminder[]
}
```

### Enums

```prisma
enum UserRole {
  CUSTOMER
  DRIVER
  ADMIN
  DISPATCHER
}

enum RideStatus {
  PENDING
  ASSIGNED
  CONFIRMED
  DRIVER_EN_ROUTE
  PICKUP_ARRIVED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum VehicleType {
  SEDAN
  SUV
  VAN
  WHEELCHAIR_VAN
  STRETCHER_VAN
}

enum DocumentStatus {
  VALID
  EXPIRING_SOON  // Within 30 days
  EXPIRED
  RENEWAL_IN_PROGRESS
}
```

---

## Authentication

### JWT Strategy

**Token Payload**:
```json
{
  "sub": 123,           // User ID
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1234567890,
  "exp": 1234998765
}
```

**Token Lifetimes**:
- Access Token: 7 days
- Refresh Token: 30 days

### Password Security

- Hashing: bcrypt with 12 salt rounds
- Password requirements enforced via DTOs
- Reset tokens expire after 1 hour

### OAuth Flow

1. User clicks "Login with Google"
2. Redirect to Google consent screen
3. Google callback with user info
4. Create/update user in database
5. Issue JWT tokens
6. Redirect to frontend with tokens

### Role-Based Access

```typescript
// Protect endpoint
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile() { }

// Restrict by role
@Roles('ADMIN', 'DISPATCHER')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('assign-driver')
assignDriver() { }
```

---

## Business Logic

### Ride Booking Flow

1. **Customer Creates Booking**
   - Validate service category exists
   - Calculate distance via Google Maps
   - Calculate base price
   - Check for scheduling conflicts
   - Create ride with PENDING status

2. **Admin/Dispatcher Assigns Driver**
   - Check driver availability
   - Update ride status to ASSIGNED
   - Notify driver via email/app

3. **Driver Accepts/Updates**
   - ASSIGNED → CONFIRMED → DRIVER_EN_ROUTE
   - → PICKUP_ARRIVED → IN_PROGRESS → COMPLETED

4. **Invoice Generation**
   - Calculate final price (base + mileage)
   - Apply tax
   - Generate PDF
   - Link to ride
   - Mark as PENDING

### Document Expiry Tracking

**Automated Process**:
```
Daily Cron Job:
  1. Query documents expiring within 30 days
  2. Update status to EXPIRING_SOON
  3. Send email reminders
  4. Query expired documents
  5. Update status to EXPIRED
  6. Send urgent notifications
```

**Renewal Workflow**:
1. Admin uploads new document
2. System creates DocumentRenewal record
3. Updates parent document expiry date
4. Changes status to VALID
5. Archives old document

---

## DTOs & Validation

### Example: CreateRideDto

```typescript
import { IsNotEmpty, IsString, IsInt, IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

export class CreateRideDto {
  @IsNotEmpty()
  @IsString()
  pickupAddress: string;

  @IsOptional()
  @IsNumber()
  pickupLatitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLongitude?: number;

  @IsNotEmpty()
  @IsString()
  dropoffAddress: string;

  @IsNotEmpty()
  @IsInt()
  serviceCategoryId: number;

  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  scheduledAt: Date;

  @IsOptional()
  @IsString()
  specialNeeds?: string;
}
```

### Global Validation Pipe

```typescript
// app.module.ts
{
  provide: APP_PIPE,
  useClass: ValidationPipe,
}
```

---

## Error Handling

### Global Exception Filter

```typescript
// common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

### Custom Exceptions

```typescript
throw new NotFoundException('Ride not found');
throw new UnauthorizedException('Invalid credentials');
throw new ConflictException('Ride already exists for this time slot');
```

---

## Setup & Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run prisma:seed
```

### Environment Variables

Create `.env` file (see main README for all variables)

### Development

```bash
# Start dev server (hot reload)
npm run start:dev

# Build for production
npm run build

# Start production
npm run start:prod
```

### Database Commands

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Reset database
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## Swagger Documentation

Access interactive API docs at:

```
http://localhost:1000/api/docs
```

Swagger UI provides:
- All endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication integration

---

## Performance Considerations

### Database Optimization

- **Indexes**: Applied on frequently queried fields
  - `users.email`
  - `rides.status`, `rides.customerId`, `rides.driverId`
  - `document_tracking.expiryDate`, `document_tracking.status`

- **Pagination**: Implemented for list endpoints

- **Select Fields**: Only fetch needed columns

### Caching Strategy

- Service categories (rarely change)
- User profiles (invalidate on update)
- Document statistics (refresh daily)

---

## Security Measures

✅ **Input Validation**: All DTOs validated with `class-validator`  
✅ **SQL Injection**: Prevented by Prisma parameterized queries  
✅ **CORS**: Configured for frontend domain only  
✅ **Helmet**: Security headers enabled  
✅ **Rate Limiting**: Throttler on auth endpoints  
✅ **Password Hashing**: bcrypt with 12 rounds  
✅ **JWT Expiry**: Short-lived tokens  
✅ **Environment Secrets**: Never committed to git  

---

## Deployment

### Build

```bash
npm run build
```

### Production Start

```bash
npm run start:prod
```

### Process Manager (PM2)

```bash
pm2 start dist/src/main.js --name medi-rides-api
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

---

## Monitoring

### Logging

NestJS built-in logger used throughout:

```typescript
this.logger.log('Ride created', { rideId: 42 });
this.logger.error('Payment failed', error);
```

### Health Check

```bash
GET /health
```

---

## Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Redis caching layer
- [ ] Message queue (RabbitMQ)
- [ ] GraphQL API
- [ ] Microservices split
- [ ] Advanced search (Elasticsearch)
- [ ] API rate limiting per user
- [ ] Audit logging

---

**Version**: 1.0.0  
**Last Updated**: January 2024