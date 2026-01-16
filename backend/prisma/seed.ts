import { PrismaClient, UserRole, ServiceType, VehicleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Service Areas
  console.log('Creating service areas...');
  const serviceAreas = await prisma.serviceArea.createMany({
    data: [
      {
        name: 'Wasilla Metro',
        description: 'Wasilla metropolitan area and immediate surroundings',
        basePrice: 25.00,
        pricePerMile: 2.50,
      },
      {
        name: 'Mat-Su Valley',
        description: 'Matanuska-Susitna Valley region',
        basePrice: 35.00,
        pricePerMile: 3.00,
      },
      {
        name: 'Anchorage Area',
        description: 'Anchorage and surrounding communities',
        basePrice: 45.00,
        pricePerMile: 3.50,
      },
    ],
  });

  // Create Admin User
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@compassionatemedirides.com' },
    update: {},
    create: {
      email: 'admin@compassionatemedirides.com',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
      phone: '+1 (907) 555-0001',
      isVerified: true,
    },
  });

  // Create Dispatcher User
  console.log('Creating dispatcher user...');
  const dispatcherPassword = await bcrypt.hash('Dispatch123!', 12);
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatch@compassionatemedirides.com' },
    update: {},
    create: {
      email: 'dispatch@compassionatemedirides.com',
      password: dispatcherPassword,
      name: 'Ride Dispatcher',
      role: UserRole.DISPATCHER,
      phone: '+1 (907) 555-0002',
      isVerified: true,
    },
  });

  //create Service Categories
  console.log('Creating service categories...');
  const serviceCategory1 = await prisma.serviceCategory.upsert({
    where: { value: 'medical-appointment' },
    update: {},
    create: {
      name: 'Medical Appointment',
      value: 'medical-appointment',
      description: 'Doctor visits, hospital appointments',
      icon: 'Stethoscope',
      isActive: true,
      basePrice: 25.00,
      pricePerMile: 2.50,
      serviceType: ServiceType.MEDICAL,
    },
  });

  const serviceCategory2 = await prisma.serviceCategory.upsert({
    where: { value: 'general-transport' },
    update: {},
    create: {
      name: 'General Transport',
      value: 'general-transport',
      description: 'Non-medical rides and errands',
      icon: 'Car',
      isActive: true,
      basePrice: 15.00,
      pricePerMile: 1.50,
      serviceType: ServiceType.GENERAL,
    },
  });

  // Create Sample Drivers
  console.log('Creating sample drivers...');
  const driver1Password = await bcrypt.hash('Driver123!', 12);
  const driver1 = await prisma.user.upsert({
    where: { email: 'michael.driver@compassionatemedirides.com' },
    update: {},
    create: {
      email: 'michael.driver@compassionatemedirides.com',
      password: driver1Password,
      name: 'Michael Johnson',
      role: UserRole.DRIVER,
      phone: '+1 (907) 555-1001',
      isVerified: true,
      driverProfile: {
        create: {
          licenseNumber: 'AK12345678',
          licenseState: 'AK',
          licenseExpiry: new Date('2025-12-31'),
          vehicleInfo: '2022 Ford Transit Wagon - Wheelchair Accessible',
          insuranceInfo: 'Geico Policy #GC123456789',
          isAvailable: true,
          rating: 4.8,
          totalTrips: 156,
        },
      },
    },
  });

  const driver2Password = await bcrypt.hash('Driver123!', 12);
  const driver2 = await prisma.user.upsert({
    where: { email: 'sarah.driver@compassionatemedirides.com' },
    update: {},
    create: {
      email: 'sarah.driver@compassionatemedirides.com',
      password: driver2Password,
      name: 'Sarah Williams',
      role: UserRole.DRIVER,
      phone: '+1 (907) 555-1002',
      isVerified: true,
      driverProfile: {
        create: {
          licenseNumber: 'AK87654321',
          licenseState: 'AK',
          licenseExpiry: new Date('2025-11-30'),
          vehicleInfo: '2021 Toyota Sienna - Medical Transport',
          insuranceInfo: 'State Farm Policy #SF987654321',
          isAvailable: true,
          rating: 4.9,
          totalTrips: 203,
        },
      },
    },
  });

  // Create Sample Vehicles
  console.log('Creating sample vehicles...');
  await prisma.vehicle.createMany({
    data: [
      {
        make: 'Ford',
        model: 'Transit Wagon',
        year: 2022,
        color: 'White',
        licensePlate: 'AK MED1',
        type: VehicleType.WHEELCHAIR_VAN,
        capacity: 4,
        hasWheelchairAccess: true,
        hasOxygenSupport: true,
        insuranceExpiry: new Date('2024-12-31'),
        registrationExpiry: new Date('2024-12-31'),
      },
      {
        make: 'Toyota',
        model: 'Sienna',
        year: 2021,
        color: 'Silver',
        licensePlate: 'AK MED2',
        type: VehicleType.VAN,
        capacity: 6,
        hasWheelchairAccess: false,
        hasOxygenSupport: true,
        insuranceExpiry: new Date('2024-11-30'),
        registrationExpiry: new Date('2024-11-30'),
      },
    ],
  });

  // Create Sample Customer
  console.log('Creating sample customer...');
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'john.patient@example.com' },
    update: {},
    create: {
      email: 'john.patient@example.com',
      password: customerPassword,
      name: 'John Patient',
      role: UserRole.CUSTOMER,
      phone: '+1 (907) 555-2001',
      isVerified: true,
      addresses: {
        create: [
          {
            label: 'Home',
            address: '123 Main Street',
            city: 'Wasilla',
            state: 'AK',
            zipCode: '99654',
            isDefault: true,
          },
          {
            label: 'Medical Center',
            address: 'Mat-Su Regional Medical Center',
            city: 'Palmer',
            state: 'AK',
            zipCode: '99645',
            isDefault: false,
          },
        ],
      },
    },
  });

  // Create Sample Rides
  console.log('Creating sample rides...');
  await prisma.ride.createMany({
    data: [
      {
        customerId: customer.id,
        driverId: driver1.id,
        pickupAddress: '123 Main Street, Wasilla, AK 99654',
        dropoffAddress: 'Mat-Su Regional Medical Center, Palmer, AK 99645',
        serviceType: ServiceType.MEDICAL,
        serviceCategoryId: serviceCategory1.id,
        status: 'COMPLETED',
        scheduledAt: new Date('2024-01-15T09:00:00Z'),
        actualPickupAt: new Date('2024-01-15T08:45:00Z'),
        actualDropoffAt: new Date('2024-01-15T09:20:00Z'),
        passengerName: 'John Patient',
        passengerPhone: '+1 (907) 555-2001',
        specialNeeds: 'Wheelchair accessible vehicle required',
        basePrice: 35.00,
        distance: 12.5,
        duration: 35,
        finalPrice: 42.50,
      },
      {
        customerId: customer.id,
        driverId: driver2.id,
        pickupAddress: '123 Main Street, Wasilla, AK 99654',
        dropoffAddress: 'Providence Alaska Medical Center, Anchorage, AK 99508',
        serviceType: ServiceType.MEDICAL,
        serviceCategoryId: serviceCategory1.id,
        status: 'ASSIGNED',
        scheduledAt: new Date('2024-01-20T10:30:00Z'),
        passengerName: 'John Patient',
        passengerPhone: '+1 (907) 555-2001',
        specialNeeds: 'Oxygen tank support',
        basePrice: 65.00,
        distance: 43.2,
        duration: 55,
        finalPrice: 78.50,
      },
    ],
  });

  // Create Sample Payments
  console.log('Creating sample payments...');
  const rides = await prisma.ride.findMany();
  
  await prisma.payment.createMany({
    data: [
      {
        rideId: rides[0].id,
        customerId: customer.id,
        amount: 42.50,
        status: 'COMPLETED',
        method: 'INSURANCE',
        transactionId: 'INS_123456789',
        billingName: 'John Patient',
        billingEmail: 'john.patient@example.com',
        paidAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        rideId: rides[1].id,
        customerId: customer.id,
        amount: 78.50,
        status: 'PENDING',
        method: 'INSURANCE',
        billingName: 'John Patient',
        billingEmail: 'john.patient@example.com',
      },
    ],
  });

  // Create Driver Availability
  console.log('Creating driver availability...');
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  await prisma.driverAvailability.createMany({
    data: [
      {
        driverId: driver1.id,
        startTime: new Date('2024-01-20T08:00:00Z'),
        endTime: new Date('2024-01-20T17:00:00Z'),
        isAvailable: true,
      },
      {
        driverId: driver2.id,
        startTime: new Date('2024-01-20T07:00:00Z'),
        endTime: new Date('2024-01-20T16:00:00Z'),
        isAvailable: true,
      },
    ],
  });

  console.log('✅ Database seed completed successfully!');
  console.log('');
  console.log('📋 Sample Accounts Created:');
  console.log('👑 Admin: admin@compassionatemedirides.com / Admin123!');
  console.log('📞 Dispatcher: dispatch@compassionatemedirides.com / Dispatch123!');
  console.log('🚗 Driver 1: michael.driver@compassionatemedirides.com / Driver123!');
  console.log('🚙 Driver 2: sarah.driver@compassionatemedirides.com / Driver123!');
  console.log('👤 Customer: john.patient@example.com / Customer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });