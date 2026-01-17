-- Medi-Rides Database Seed Data for Supabase
-- Run this AFTER running supabase_migration.sql
-- This will create initial admin users and service categories

-- Create Service Areas
INSERT INTO "service_areas" ("name", "description", "basePrice", "pricePerMile", "createdAt", "updatedAt")
VALUES
    ('Wasilla Metro', 'Wasilla metropolitan area and immediate surroundings', 25.00, 2.50, NOW(), NOW()),
    ('Mat-Su Valley', 'Matanuska-Susitna Valley region', 35.00, 3.00, NOW(), NOW()),
    ('Anchorage Area', 'Anchorage and surrounding communities', 45.00, 3.50, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create Admin User (password: Admin123!)
INSERT INTO "users" ("email", "password", "name", "role", "phone", "isVerified", "createdAt", "updatedAt")
VALUES (
    'admin@compassionatemedirides.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeUMH0Ut.Wpi',
    'System Administrator',
    'ADMIN',
    '+1 (907) 555-0001',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Dispatcher User (password: Dispatch123!)
INSERT INTO "users" ("email", "password", "name", "role", "phone", "isVerified", "createdAt", "updatedAt")
VALUES (
    'dispatch@compassionatemedirides.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeUMH0Ut.Wpi',
    'Ride Dispatcher',
    'DISPATCHER',
    '+1 (907) 555-0002',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Sample Driver User (password: Driver123!)
INSERT INTO "users" ("email", "password", "name", "role", "phone", "isVerified", "createdAt", "updatedAt")
VALUES (
    'driver@compassionatemedirides.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeUMH0Ut.Wpi',
    'John Driver',
    'DRIVER',
    '+1 (907) 555-0003',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Sample Customer User (password: Customer123!)
INSERT INTO "users" ("email", "password", "name", "role", "phone", "isVerified", "createdAt", "updatedAt")
VALUES (
    'customer@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeUMH0Ut.Wpi',
    'Jane Customer',
    'CUSTOMER',
    '+1 (907) 555-0004',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Service Categories
INSERT INTO "service_categories" ("name", "value", "description", "icon", "basePrice", "pricePerMile", "serviceType", "isActive", "createdAt", "updatedAt")
VALUES
    (
        'Medical Transport',
        'medical-transport',
        'Non-emergency medical transportation for doctor appointments, dialysis, physical therapy, and other healthcare needs',
        'medical',
        30.00,
        2.50,
        'MEDICAL',
        true,
        NOW(),
        NOW()
    ),
    (
        'Wheelchair Accessible',
        'wheelchair-accessible',
        'Specially equipped vehicles with wheelchair lifts or ramps for patients requiring wheelchair transportation',
        'wheelchair',
        45.00,
        3.00,
        'MEDICAL',
        true,
        NOW(),
        NOW()
    ),
    (
        'Stretcher Transport',
        'stretcher-transport',
        'Ambulatory transport for patients who need to remain lying down during transport',
        'stretcher',
        65.00,
        4.00,
        'MEDICAL',
        true,
        NOW(),
        NOW()
    ),
    (
        'Oxygen Support',
        'oxygen-support',
        'Transportation with oxygen equipment support for patients requiring continuous oxygen therapy',
        'oxygen',
        55.00,
        3.50,
        'MEDICAL',
        true,
        NOW(),
        NOW()
    ),
    (
        'Companion Ride',
        'companion-ride',
        'General transportation with companionship and assistance for elderly or patients needing support',
        'companion',
        25.00,
        2.00,
        'GENERAL',
        true,
        NOW(),
        NOW()
    ),
    (
        'Hospital Discharge',
        'hospital-discharge',
        'Specialized service for safe transportation from hospital to home after discharge',
        'hospital',
        40.00,
        2.75,
        'MEDICAL',
        true,
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO NOTHING;

-- Create Document Categories
INSERT INTO "DocumentCategory" ("name", "description", "color", "icon", "requiresRenewal", "renewalPeriodDays", "createdAt", "updatedAt")
VALUES
    ('Vehicle Registration', 'Vehicle registration documents', '#3B82F6', 'FileText', true, 365, NOW(), NOW()),
    ('Insurance', 'Insurance policy documents', '#10B981', 'Shield', true, 365, NOW(), NOW()),
    ('Driver License', 'Driver license documents', '#F59E0B', 'CreditCard', true, 1095, NOW(), NOW()),
    ('Medical Certification', 'Medical certification documents', '#EF4444', 'Heart', true, 365, NOW(), NOW()),
    ('Safety Inspection', 'Vehicle safety inspection records', '#8B5CF6', 'CheckCircle', true, 180, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Database seeded successfully! 🌱' as message;
SELECT '---' as separator;
SELECT 'Admin Login: admin@compassionatemedirides.com / Admin123!' as admin_credentials;
SELECT 'Dispatcher Login: dispatch@compassionatemedirides.com / Dispatch123!' as dispatcher_credentials;
SELECT 'Driver Login: driver@compassionatemedirides.com / Driver123!' as driver_credentials;
SELECT 'Customer Login: customer@example.com / Customer123!' as customer_credentials;
