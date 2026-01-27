# Compassionate Medi Rides Platform

**Professional Medical Transportation Management System**

A full-stack web application for managing medical and non-medical transportation services, including ride booking, driver management, vehicle tracking, and document compliance monitoring.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Design](#database-design)
8. [Authentication & Authorization](#authentication--authorization)
9. [API Documentation](#api-documentation)
10. [Frontend Architecture](#frontend-architecture)
11. [Deployment](#deployment)

---

## Project Overview

### What It Does

Compassionate Medi Rides is an enterprise-grade platform for medical transportation companies to:

- **Book & Manage Rides**: Schedule medical and non-medical transportation
- **Track Drivers & Vehicles**: Monitor fleet status, availability, and compliance
- **Process Payments**: Handle multiple payment methods including insurance claims
- **Document Management**: Track expiring licenses, insurance, and certifications
- **Multi-Role Support**: Customer, Driver, Admin, and Dispatcher interfaces

### Core Problem

Medical transportation companies struggle with:
- Manual scheduling and driver assignment
- Compliance tracking for licenses and insurance
- Payment processing across multiple methods
- Real-time fleet visibility

### Key Features

- 🚗 **Real-time ride booking** with Google Maps integration
- 👥 **Role-based dashboards** (Customer, Driver, Admin, Dispatcher)
- 📄 **Document tracking system** with expiry notifications
- 💳 **Multi-payment support** (Insurance, Cash, Credit Card, Corporate)
- 📊 **Analytics dashboard** for business insights
- 🔔 **Automated notifications** via email and in-app
- 🗺️ **Service area management** with geofencing
- ♿ **Accessibility features** (wheelchair-accessible vehicles)

### Target Users

- **Customers**: Book medical transportation rides
- **Drivers**: Receive assignments, manage availability
- **Admins**: Oversee operations, manage fleet
- **Dispatchers**: Assign rides, monitor real-time status

---

## System Architecture

### Architecture Style

**Monolithic Full-Stack** with clear separation of concerns:
- Backend: NestJS REST API
- Frontend: Next.js App Router
- Database: PostgreSQL with Prisma ORM

### Component Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Customer │  │  Driver  │  │  Admin   │              │
│  │Dashboard │  │Dashboard │  │Dashboard │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│         │              │              │                  │
│         └──────────────┴──────────────┘                  │
│                       │                                  │
│                       ▼                                  │
│              Axios API Client                            │
└───────────────────────│──────────────────────────────────┘
                        │ HTTP/JSON
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  NestJS Backend API                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │   Auth    │  │   Rides   │  │ Documents │           │
│  │  Module   │  │  Module   │  │  Module   │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│         │              │              │                  │
│         └──────────────┴──────────────┘                  │
│                       │                                  │
│              Prisma ORM Layer                            │
└───────────────────────│──────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  PostgreSQL Database  │
            └───────────────────────┘
```

### Data Flow

1. User interacts with Next.js frontend
2. Frontend makes authenticated API calls via Axios
3. NestJS validates JWT and processes request
4. Business logic layer handles operations
5. Prisma ORM executes database queries
6. Response flows back through layers

### Design Patterns

- **Repository Pattern**: Database access abstraction via Prisma
- **DTO Pattern**: Data validation using `class-validator`
- **Guard Pattern**: Route protection with JWT strategy
- **Module Pattern**: Feature-based code organization

---

## Tech Stack

### Backend

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **NestJS** | 11.x | API Framework | TypeScript-first, modular architecture, built-in DI |
| **Prisma** | 6.x | ORM | Type-safe queries, migrations, excellent DX |
| **PostgreSQL** | Latest | Database | ACID compliance, relations, JSON support |
| **Passport** | Latest | Authentication | JWT + OAuth strategies, industry standard |
| **Cloudinary** | Latest | File Storage | CDN, image optimization, easy integration |
| **Nodemailer** | Latest | Email | Transactional emails, verification |

### Frontend

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Next.js** | 16.x | Framework | SSR, App Router, SEO, performance |
| **React** | 19.x | UI Library | Component reusability, large ecosystem |
| **Tailwind CSS** | 4.x | Styling | Utility-first, rapid development |
| **Axios** | Latest | HTTP Client | Interceptors, request/response handling |
| **Google Maps API** | Latest | Maps | Location services, route calculation |
| **Framer Motion** | Latest | Animations | Smooth UI transitions |

---

## Project Structure

```
medi-rides/
├── backend/                    # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # DB migrations
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── customer/          # Customer operations
│   │   ├── driver/            # Driver operations
│   │   ├── admin/             # Admin operations
│   │   ├── rides/             # Ride booking & management
│   │   ├── vehicles/          # Fleet management
│   │   ├── document-tracking/ # Compliance docs
│   │   ├── invoice/           # Billing & invoicing
│   │   ├── mail/              # Email service
│   │   ├── cloudinary/        # File uploads
│   │   └── common/            # Shared utilities
│   └── uploads/               # Local file storage
├── frontend/                   # Next.js App
│   ├── app/                   # App Router pages
│   │   ├── (back-office)/    # Admin dashboard
│   │   ├── (customer-office)/ # Customer portal
│   │   ├── (driver-office)/  # Driver portal
│   │   ├── auth/             # Auth pages
│   │   ├── services/         # Public services
│   │   └── contact/          # Contact page
│   ├── components/
│   │   ├── auth/             # Auth components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── homepage/         # Landing page
│   │   └── services/         # Service pages
│   ├── services/             # API client services
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript types
│   ├── utils/                # Utilities
│   └── lib/                  # Configuration
│       ├── seo.config.ts     # SEO settings
│       └── structured-data.ts # Schema.org markup
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL 14+ database
- Google Maps API key
- Cloudinary account (optional, for file uploads)

### Local Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd medi-rides
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file (see Environment Configuration)
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend runs on `http://localhost:1000`

#### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### Production Build

#### Backend

```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend

```bash
cd frontend
npm run build
npm start
```

---

## Environment Configuration

### Backend (.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | ✅ |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key-min-32-chars` | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret` | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxxxx.apps.googleusercontent.com` | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-xxxxx` | ❌ |
| `GOOGLE_CALLBACK_URL` | OAuth callback | `http://localhost:1000/auth/google/callback` | ❌ |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` | ❌ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` | ❌ |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `abcdef123` | ❌ |
| `EMAIL_SMTP_HOST` | SMTP server | `smtp.gmail.com` | ✅ |
| `EMAIL_SMTP_PORT` | SMTP port | `587` | ✅ |
| `EMAIL_SMTP_USER` | SMTP username | `your-email@gmail.com` | ✅ |
| `EMAIL_SMTP_PASS` | SMTP password | `app-specific-password` | ✅ |
| `EMAIL_FROM_ADDRESS` | From email | `noreply@example.com` | ✅ |
| `RESEND_API_KEY` | Resend API key (alternative) | `re_xxxxx` | ❌ |
| `GOOGLE_MAPS_API_KEY` | Google Maps key | `AIzaSyxxxxx` | ✅ |

### Frontend (.env.local)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:1000` | ✅ |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL | `http://localhost:1000` | ✅ |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL | `http://localhost:3000` | ✅ |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API | `AIzaSyxxxxx` | ✅ |

### Security Best Practices

- **Never commit `.env` files** to version control
- Use strong, unique secrets for production (32+ characters)
- Rotate JWT secrets periodically
- Use environment-specific keys for dev/staging/prod
- Store production secrets in secure vaults (AWS Secrets Manager, HashiCorp Vault)

---

## Database Design

### Entity Relationship Overview

```
User (1) ──────── (*) Ride           # Users book rides
User (1) ──────── (*) Payment        # Users make payments
User (1) ──────── (1) DriverProfile  # Drivers have profile
User (1) ──────── (*) Vehicle        # Drivers own vehicles
User (1) ──────── (*) DocumentTracking # Users have documents
Ride (1) ──────── (1) Invoice        # Rides generate invoices
Ride (1) ──────── (1) Payment        # Rides have payment
ServiceCategory (1) ── (*) Ride      # Rides belong to category
```

### Core Tables

#### `users`
Primary user table for all roles (Customer, Driver, Admin, Dispatcher)

**Key Fields:**
- `email`, `password`, `name`, `role`
- `emailVerificationToken`, `isVerified`
- `provider` (LOCAL/GOOGLE OAuth)

#### `rides`
Ride booking and tracking

**Key Fields:**
- `customerId`, `driverId`, `serviceCategoryId`
- `pickupAddress`, `dropoffAddress`, `coordinates`
- `status` (PENDING → ASSIGNED → IN_PROGRESS → COMPLETED)
- `scheduledAt`, `actualPickupAt`, `actualDropoffAt`
- `basePrice`, `finalPrice`

#### `vehicles`
Fleet management

**Key Fields:**
- `make`, `model`, `year`, `licensePlate`
- `type` (SEDAN, SUV, WHEELCHAIR_VAN, etc.)
- `hasWheelchairAccess`, `hasOxygenSupport`
- `insuranceExpiry`, `registrationExpiry`
- `status` (AVAILABLE, IN_USE, MAINTENANCE)

#### `document_tracking`
Compliance document management

**Key Fields:**
- `title`, `documentNumber`, `categoryId`
- `issueDate`, `expiryDate`, `renewalDate`
- `status` (VALID, EXPIRING_SOON, EXPIRED)
- `fileUrl`, `fileName`
- `entityType` (VEHICLE, DRIVER, COMPANY)

#### `payments`
Payment processing

**Key Fields:**
- `rideId`, `customerId`, `amount`
- `status` (PENDING, COMPLETED, FAILED)
- `method` (CREDIT_CARD, INSURANCE, CASH, etc.)
- `transactionId`

### Indexing Strategy

```sql
-- High-traffic queries
CREATE INDEX idx_rides_customer ON rides(customerId);
CREATE INDEX idx_rides_driver ON rides(driverId);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_scheduled ON rides(scheduledAt);

-- Document tracking
CREATE INDEX idx_documents_status ON document_tracking(status);
CREATE INDEX idx_documents_expiry ON document_tracking(expiryDate);
CREATE INDEX idx_documents_entity ON document_tracking(entityType, entityId);

-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Migrations

Prisma handles migrations automatically:

```bash
# Create migration
npx prisma migrate dev --name describe_changes

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

---

## Authentication & Authorization

### Flow

1. **Registration**: `/auth/register`
   - User provides email, password, name
   - Email verification sent
   - Account created with `isVerified: false`

2. **Email Verification**: `/auth/verify-email/:token`
   - Token validated
   - Account activated

3. **Login**: `/auth/login`
   - Credentials validated
   - JWT access token (7d) + refresh token (30d) issued
   - Tokens returned in response

4. **Google OAuth**: `/auth/google`
   - Redirects to Google consent screen
   - Callback creates/finds user
   - Returns JWT tokens

5. **Token Refresh**: `/auth/refresh`
   - Old refresh token exchanged
   - New access token issued

### Token Structure

**Access Token Payload:**
```json
{
  "sub": 123,
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1234567890,
  "exp": 1234998765
}
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **CUSTOMER** | Book rides, view own rides, update profile |
| **DRIVER** | View assigned rides, update ride status, manage availability |
| **ADMIN** | Full access, manage users, vehicles, reports |
| **DISPATCHER** | Assign rides, view all rides, manage schedules |

### Guards Implementation

```typescript
// Protect routes
@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController { }

// Role restriction
@Roles('ADMIN', 'DISPATCHER')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('assign')
assignRide() { }
```

### Security Safeguards

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT tokens signed with HS256
- ✅ Refresh token stored in database (revocable)
- ✅ Email verification required
- ✅ Password reset with expiring tokens
- ✅ CORS configured for frontend domain
- ✅ Rate limiting on auth endpoints
- ✅ HTTP-only cookies option available

---

## API Documentation

### Base URL

- **Development**: `http://localhost:1000`
- **Production**: Configure in deployment

### Authentication Endpoints

#### POST `/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  },
  "message": "Verification email sent"
}
```

#### POST `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

### Ride Endpoints

#### POST `/rides/customer/book`
🔒 **Auth Required** | **Role:** CUSTOMER

**Request:**
```json
{
  "pickupAddress": "123 Main St",
  "dropoffAddress": "456 Oak Ave",
  "serviceCategoryId": 1,
  "scheduledAt": "2024-01-15T10:00:00Z",
  "specialNeeds": "Wheelchair accessible"
}
```

**Response:**
```json
{
  "id": 42,
  "status": "PENDING",
  "basePrice": 45.00,
  "scheduledAt": "2024-01-15T10:00:00Z"
}
```

#### GET `/rides/customer/my-rides`
🔒 **Auth Required** | **Role:** CUSTOMER

**Response:**
```json
[
  {
    "id": 42,
    "pickupAddress": "123 Main St",
    "dropoffAddress": "456 Oak Ave",
    "status": "COMPLETED",
    "driver": {
      "name": "Jane Smith",
      "phone": "+1234567890"
    },
    "scheduledAt": "2024-01-15T10:00:00Z"
  }
]
```

### Driver Endpoints

#### GET `/driver/rides`
🔒 **Auth Required** | **Role:** DRIVER

**Response:**
```json
[
  {
    "id": 42,
    "customer": {
      "name": "John Doe",
      "phone": "+1234567890"
    },
    "pickupAddress": "123 Main St",
    "status": "ASSIGNED",
    "scheduledAt": "2024-01-15T10:00:00Z"
  }
]
```

#### PATCH `/driver/rides/:id/status`
🔒 **Auth Required** | **Role:** DRIVER

**Request:**
```json
{
  "status": "IN_PROGRESS"
}
```

### Admin Endpoints

#### GET `/admin/rides`
🔒 **Auth Required** | **Role:** ADMIN, DISPATCHER

**Query Params:**
- `status` (optional)
- `startDate`, `endDate` (optional)
- `page`, `limit` (pagination)

**Response:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "totalPages": 15
}
```

### Error Responses

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be a valid email"
  ]
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Frontend Architecture

### State Management

- **Auth Context** (`contexts/auth-context.tsx`)
  - Manages user authentication state
  - Provides `useAuth()` hook
  - Handles token refresh

- **Local State** (React `useState`, `useReducer`)
  - Component-level state
  - Form inputs, UI toggles

### Routing

Next.js App Router with route groups:

```
/                          → Homepage
/services                  → Services page
/contact                   → Contact page
/auth/login               → Login page
/customer-dashboard       → Customer portal
/driver-dashboard         → Driver portal
/dashboard (admin)        → Admin dashboard
```

### API Communication

**Service Layer** (`services/*.service.ts`):

```typescript
// services/rides.service.ts
export const bookRide = async (data: BookRideDto) => {
  const response = await api.post('/rides/customer/book', data);
  return response.data;
};
```

**Usage in Components:**
```typescript
import { bookRide } from '@/services/rides.service';

const handleBooking = async (formData) => {
  try {
    const ride = await bookRide(formData);
    toast.success('Ride booked successfully!');
  } catch (error) {
    toast.error('Booking failed');
  }
};
```

### Performance Strategies

- ✅ **Server Components** by default (Next.js)
- ✅ **Dynamic imports** for heavy components
- ✅ **Image optimization** via Next.js `<Image>`
- ✅ **Route prefetching** automatic in Next.js
- ✅ **Code splitting** per route
- ✅ **Memo/useMemo** for expensive computations

---

## Deployment

### Production Build

#### Backend (NestJS)

```bash
cd backend

# Build
npm run build

# Start
npm run start:prod

# Or with PM2
pm2 start dist/src/main.js --name medi-rides-api
```

#### Frontend (Next.js)

```bash
cd frontend

# Build
npm run build

# Start
npm start

# Or export static (if no SSR needed)
npm run build && npm run export
```

### Deployment Platforms

#### Backend Options

1. **Railway/Render** (Recommended for simplicity)
   - Connect GitHub repo
   - Set environment variables
   - Auto-deploy on push

2. **AWS EC2**
   - Deploy with PM2 or Docker
   - Use RDS for PostgreSQL
   - Load balancer for scaling

3. **Docker** (Containerized)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   CMD ["npm", "run", "start:prod"]
   ```

#### Frontend Options

1. **Vercel** (Recommended for Next.js)
   - Connect GitHub repo
   - Auto-deploy on push
   - Edge network CDN

2. **Netlify**
   - Similar to Vercel
   - Great for static exports

3. **AWS Amplify/S3+CloudFront**
   - Full AWS integration
   - Scalable CDN

### Environment Setup

**Production Checklist:**
- ✅ Set `NODE_ENV=production`
- ✅ Use strong JWT secrets (32+ chars)
- ✅ Configure production database URL
- ✅ Enable CORS only for production domain
- ✅ Set up SSL certificates
- ✅ Configure logging service
- ✅ Set up monitoring (Sentry, LogRocket)
- ✅ Enable rate limiting
- ✅ Backup database regularly

### Domain & SSL

```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d compassionatemedieides.com
```

### Rollback Process

```bash
# With PM2
pm2 stop medi-rides-api
git checkout <previous-commit>
npm run build
pm2 restart medi-rides-api

# With Vercel/Railway
# Use dashboard to revert to previous deployment
```

---

## Testing Strategy

### Backend Tests

```bash
cd backend
npm test              # Run unit tests
npm run test:e2e     # Run e2e tests
npm run test:cov     # Coverage report
```

**Test Structure:**
```typescript
describe('RidesController', () => {
  it('should book a ride', async () => {
    const result = await controller.bookRide(mockDto);
    expect(result.status).toBe('PENDING');
  });
});
```

### Frontend Tests

Install testing libraries:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Coverage Expectations:**
- Unit tests: 70%+ coverage
- Integration tests for critical flows
- E2E tests for main user journeys

---

## Security Practices

- ✅ **Input Validation**: `class-validator` DTOs
- ✅ **SQL Injection Prevention**: Prisma parameterized queries
- ✅ **XSS Prevention**: React auto-escaping
- ✅ **CSRF**: SameSite cookies
- ✅ **Rate Limiting**: `@nestjs/throttler`
- ✅ **Helmet.js**: Secure HTTP headers
- ✅ **CORS**: Whitelist frontend domain
- ✅ **Password Hashing**: bcrypt (12 rounds)
- ✅ **JWT Expiry**: Short-lived tokens

---

## Contribution Guide

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

Example: `feature/add-payment-processing`

### Commit Messages

Follow conventional commits:

```
feat: add payment processing module
fix: resolve ride assignment bug
docs: update API documentation
refactor: improve auth service structure
```

### Pull Request Guidelines

1. Create feature branch from `main`
2. Write descriptive PR title
3. Include screenshots for UI changes
4. Ensure tests pass
5. Request review from maintainers

---

## Maintenance & Monitoring

### Logging

Backend uses NestJS Logger:

```typescript
this.logger.log('Ride booked', { rideId: 123 });
this.logger.error('Payment failed', error);
```

### Health Checks

```bash
# API health
curl http://localhost:1000/health
```

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update safely
npm update

# Major updates (careful)
npx npm-check-updates -u
npm install
```

### Backup Strategy

**Database:**
```bash
# Daily backups
pg_dump -U postgres medi_rides > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres medi_rides < backup_20240115.sql
```

---

## Future Improvements

### Scaling Ideas

- [ ] Microservices architecture (separate ride, payment, notification services)
- [ ] Redis caching for frequent queries
- [ ] WebSocket for real-time driver tracking
- [ ] Message queue (RabbitMQ) for async tasks
- [ ] Elasticsearch for advanced search

### Technical Debt

- [ ] Add comprehensive test coverage
- [ ] Implement API rate limiting
- [ ] Add request/response logging
- [ ] Set up CI/CD pipeline
- [ ] Dockerize applications

### Feature Expansions

- [ ] Mobile app (React Native)
- [ ] SMS notifications (Twilio)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] Driver app with offline mode
- [ ] Stripe payment integration
- [ ] Route optimization algorithms

---

## License

This project is proprietary and confidential.

## Support

For issues or questions, contact: [support email]

---

**Documentation Version**: 1.0.0  
**Last Updated**: January 2024
