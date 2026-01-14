# Medi Rides Backend API

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 📋 Overview

Medi Rides Backend is a comprehensive medical transportation management system API built with NestJS. It provides secure, scalable, and reliable services for managing patient transportation, driver coordination, vehicle tracking, and administrative oversight for healthcare transportation needs.

### 🎯 Key Features

- **Patient Ride Management**: Book, track, and manage medical transportation requests
- **Driver Coordination**: Match patients with available drivers and vehicles
- **Real-time Tracking**: Monitor ride status and location updates
- **Automated Scheduling**: Intelligent scheduling system for recurring medical appointments
- **Document Management**: Secure handling of medical documents and compliance paperwork
- **Billing & Invoicing**: Automated invoice generation and payment tracking
- **Multi-role Authentication**: Secure access for patients, drivers, and administrators
- **Email Notifications**: Automated updates for ride status changes and reminders
- **Admin Dashboard**: Comprehensive analytics and system management tools

## 🏗️ Architecture

```mermaid
graph TB
    A[Client Applications] --> B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Ride Management Service]
    B --> E[Driver Service]
    B --> F[Admin Service]
    C --> G[PostgreSQL Database]
    D --> G
    E --> G
    F --> G
    D --> H[External Services]
    H --> I[Email Service]
    H --> J[Cloud Storage]
    H --> K[PDF Generation]
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14 or higher
- **npm**: v9.x or higher (or pnpm/yarn)
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone and navigate to backend directory:**
```bash
git clone <repository-url>
cd medi-rides/backend
```

2. **Install dependencies:**
```bash
npm install
# or
pnpm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup:**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run prisma:seed
```

5. **Start development server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# ====================
# Application Settings
# ====================
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
API_PREFIX=/api
CORS_ORIGINS=http://localhost:3001,http://localhost:3000

# ====================
# Database
# ====================
DATABASE_URL="postgresql://user:password@localhost:5432/medirides?schema=public"
DATABASE_SSL=false

# ====================
# Authentication
# ====================
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-chars"
JWT_EXPIRATION="7d"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
REFRESH_TOKEN_EXPIRATION="30d"

# ====================
# OAuth Providers
# ====================
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# ====================
# File Storage (Cloudinary)
# ====================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ====================
# Email Service
# ====================
EMAIL_PROVIDER=resend  # or 'nodemailer'
RESEND_API_KEY="your-resend-api-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM_ADDRESS="noreply@medirides.com"
ADMIN_EMAIL="admin@medirides.com"

# ====================
# Rate Limiting
# ====================
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# ====================
# Security
# ====================
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET="session-secret"
```

### Database Configuration

The application uses Prisma ORM with PostgreSQL. Key database models include:

- **Users**: Patient, driver, and admin accounts
- **Rides**: Transportation requests and scheduling
- **Vehicles**: Fleet management
- **Invoices**: Billing and payment records
- **Documents**: Compliance and medical documentation

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run start:dev
```
- Auto-reload on changes
- Detailed error messages
- Access Swagger docs at `/api`

### Production Build
```bash
# Build the application
npm run build

# Run in production mode
npm run start:prod
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or using individual containers
docker build -t medi-rides-backend .
docker run -p 3000:3000 --env-file .env medi-rides-backend
```

### PM2 Process Management (Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start dist/main.js --name medi-rides-api

# Monitor application
pm2 monit

# View logs
pm2 logs medi-rides-api
```

## 📚 API Documentation

### Interactive Documentation
Once the server is running, access the auto-generated Swagger documentation:

👉 **http://localhost:3000/api**

### API Structure

| Endpoint Group | Base Path | Description |
|----------------|-----------|-------------|
| Authentication | `/api/auth` | User registration, login, OAuth, token refresh |
| Rides | `/api/rides` | Ride booking, status updates, history |
| Drivers | `/api/drivers` | Driver profiles, availability, assignments |
| Patients | `/api/patients` | Patient profiles, medical information |
| Vehicles | `/api/vehicles` | Fleet management, maintenance tracking |
| Admin | `/api/admin` | System management, analytics, user management |
| Invoices | `/api/invoices` | Billing, PDF generation, payment tracking |
| Dashboard | `/api/dashboard` | Analytics and reporting |

### Authentication Flow

```typescript
// Sample authentication request
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "patient",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### WebSocket Events (Real-time Updates)

The application provides real-time updates via WebSocket for:
- Ride status changes
- Driver location updates
- New ride assignments
- System notifications

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Specific test file
npm run test -- rides.service.spec
```

### Test Environment
Tests run with a dedicated test database. Configure in `test.env`:
```env
DATABASE_URL="postgresql://test:test@localhost:5433/medirides_test"
NODE_ENV=test
```

### Mock Services
- **Database**: Test containers with isolated PostgreSQL instance
- **External APIs**: Nock for HTTP mocking
- **File Storage**: Memory storage for uploads
- **Email**: In-memory email capture

## 🔧 Development

### Code Style & Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Git Hooks
Pre-commit hooks automatically:
- Run linting
- Execute tests
- Check commit message format

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

## 📦 Deployment

### Production Checklist
- [ ] Update all environment variables for production
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up CI/CD pipeline
- [ ] Perform security audit
- [ ] Load testing completed

### Cloud Deployment (AWS Example)
```yaml
# AWS ECS Task Definition
version: '3'
services:
  api:
    image: medi-rides-backend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    secrets:
      - db_password
```

### Environment-Specific Configurations

#### Development
```typescript
// config/development.ts
export default {
  database: {
    logging: true,
    synchronize: false,
  },
  security: {
    cors: {
      origin: ['http://localhost:3001'],
    },
  },
};
```

#### Production
```typescript
// config/production.ts
export default {
  database: {
    logging: false,
    ssl: true,
    poolSize: 10,
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};
```

## 🔒 Security

### Implemented Security Measures
- **JWT Authentication**: Stateless token-based authentication
- **Role-Based Access Control (RBAC)**: Granular permissions
- **Input Validation**: DTO validation with class-validator
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **CORS Configuration**: Restrictive CORS policies
- **Rate Limiting**: Protect against brute force attacks
- **Helmet.js**: Secure HTTP headers
- **BCrypt**: Password hashing with salt rounds
- **XSS Protection**: Input sanitization

### Security Audit
```bash
# Run security audit
npm audit

# Check for vulnerabilities in dependencies
npx snyk test

# Dependency updates
npm run audit:fix
```

## 📊 Monitoring & Logging

### Logging Configuration
```typescript
// Winston logger configuration
const logger = WinstonModule.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Health Checks
```bash
# Health check endpoint
GET /api/health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "services": {
    "database": "connected",
    "storage": "available",
    "email": "operational"
  }
}
```

### Performance Monitoring
- **New Relic** or **Datadog** for APM
- **Prometheus** for metrics collection
- **Grafana** for dashboards

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings introduced
```

## 🆘 Support

### Getting Help
- **Documentation**: Check the [Wiki](../../wiki) for detailed guides
- **Issues**: [GitHub Issues](../../issues) for bug reports and feature requests
- **Discussions**: [GitHub Discussions](../../discussions) for questions and ideas
- **Email**: support@medirides.com

### Common Issues & Solutions

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
npx prisma db execute --stdin <<< "SELECT 1"
```

#### Migration Problems
```bash
# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name migration_name
```

## 📄 License

This project is proprietary and confidential. All rights reserved.

### Third-Party Licenses
```bash
# Generate licenses report
npx license-checker --summary

# List all dependencies with licenses
npm run licenses
```

## 🔗 Related Projects

- **[Frontend](../frontend/)**: React-based web application
- **[Mobile App](../mobile/)**: React Native mobile application
- **[Admin Dashboard](../admin-dashboard/)**: Administrative interface

## 📈 Performance Metrics

| Metric | Target | Current |
|--------|---------|---------|
| API Response Time | < 200ms | 150ms |
| Database Query Time | < 50ms | 35ms |
| Uptime | 99.9% | 99.95% |
| Error Rate | < 0.1% | 0.05% |

---


*For emergency support or critical issues, contact the on-call engineer at +233-53-406-5652