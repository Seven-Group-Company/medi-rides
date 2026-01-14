import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EmailService } from '../mail/email.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ServiceType, RideStatus } from '@prisma/client';
import { CreateGuestRideDto } from './dto/create-guest-ride.dto';

@Injectable()
export class RidesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  async create(createRideDto: CreateRideDto, userId: number) {
    try {
      console.log('🔧 Creating ride for user:', userId);
      console.log('🔧 Ride data:', createRideDto);

      // Validate user ID
      if (!userId || isNaN(userId)) {
        throw new BadRequestException('Invalid user ID provided');
      }

      // Combine date and time into a single DateTime object
      const scheduledAt = new Date(`${createRideDto.date}T${createRideDto.time}`);

      // Check if scheduled time is in the future
      if (scheduledAt <= new Date()) {
        throw new ConflictException('Ride must be scheduled for a future date and time');
      }

      // Check for conflicting rides (same user, similar time)
      const conflictingRide = await this.prisma.ride.findFirst({
        where: {
          customerId: userId,
          scheduledAt: {
            gte: new Date(scheduledAt.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
            lte: new Date(scheduledAt.getTime() + 2 * 60 * 60 * 1000), // 2 hours after
          },
          status: {
            in: [RideStatus.PENDING, RideStatus.ASSIGNED, RideStatus.CONFIRMED]
          }
        }
      });

      if (conflictingRide) {
        throw new ConflictException(
          'You already have a ride scheduled around this time. Please choose a different time.'
        );
      }

      // Get user details for passenger information
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, phone: true }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const serviceCategory = await this.prisma.serviceCategory.findUnique({
        where: { id: createRideDto.serviceCategoryId },
      });

      if (!serviceCategory) {
        throw new NotFoundException('Service category not found');
      }

      // Map service type based on service category
      let serviceType: ServiceType;
      switch (serviceCategory.serviceType) {
        case ServiceType.MEDICAL:
          serviceType = ServiceType.MEDICAL;
          break;
        case ServiceType.GENERAL:
        default:
          serviceType = ServiceType.GENERAL;
      }


      // Convert distance from km to miles if provided
      const distanceMiles = createRideDto.distanceKm ? createRideDto.distanceKm * 0.621371 : null;

      // Create the ride
      const ride = await this.prisma.ride.create({
        data: {
          customerId: userId,
          pickupAddress: createRideDto.pickup,
          dropoffAddress: createRideDto.dropoff,
          serviceType,
          serviceCategoryId: createRideDto.serviceCategoryId,
          scheduledAt,
          additionalNotes: createRideDto.notes,
          distance: distanceMiles,
          duration: createRideDto.estimatedTime,
          passengerName: user.name,
          passengerPhone: user.phone,
          paymentType: createRideDto.paymentType,
          basePrice: await this.calculateBasePrice(createRideDto.serviceCategoryId, distanceMiles, scheduledAt),
          status: RideStatus.PENDING,
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      console.log('✅ Ride created successfully:', ride.id);

      // Notify Admin
      await this.emailService.sendRideBookedEmail(ride, '');

      return {
        id: ride.id,
        pickup: ride.pickupAddress,
        dropoff: ride.dropoffAddress,
        serviceType: createRideDto.serviceType, // Return original service type
        date: createRideDto.date,
        time: createRideDto.time,
        notes: ride.additionalNotes,
        distanceKm: createRideDto.distanceKm,
        estimatedTime: ride.duration,
        status: ride.status,
        passengerName: ride.passengerName,
        passengerPhone: ride.passengerPhone,
        scheduledAt: ride.scheduledAt,
        paymentType: ride.paymentType,
        createdAt: ride.createdAt,
      };
    } catch (error) {
      console.error('❌ Error creating ride:', error);

      // Re-throw known exceptions
      if (error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException) {
        throw error;
      }

      // Wrap unknown errors
      throw new Error(`Failed to create ride booking: ${error.message}`);
    }
  }

  async createGuestRide(createGuestRideDto: CreateGuestRideDto) {
    try {
      console.log('🔧 Creating guest ride:', createGuestRideDto);

      const scheduledAt = new Date(`${createGuestRideDto.date}T${createGuestRideDto.time}`);

      if (scheduledAt <= new Date()) {
        throw new ConflictException('Ride must be scheduled for a future date and time');
      }

      const serviceCategory = await this.prisma.serviceCategory.findUnique({
        where: { id: createGuestRideDto.serviceCategoryId },
      });

      if (!serviceCategory) {
        throw new NotFoundException('Service category not found');
      }

      // Check for ANY booking on this date (global check)
      const conflictingRide = await this.prisma.ride.findFirst({
        where: {
          scheduledAt: {
            gte: new Date(scheduledAt.toISOString().split('T')[0] + 'T00:00:00'),
            lte: new Date(scheduledAt.toISOString().split('T')[0] + 'T23:59:59')
          },
          status: {
            in: [RideStatus.PENDING, RideStatus.ASSIGNED, RideStatus.CONFIRMED]
          }
        }
      });

      if (conflictingRide) {
        throw new ConflictException(
          'This date is fully booked. We provide one ride per day. Please choose a different date.'
        );
      }

      // Map service type from frontend to Prisma enum
      let serviceType: ServiceType;
      switch (createGuestRideDto.serviceType) {
        case 'Medical Appointment':
        case 'Wheelchair Transport':
          serviceType = ServiceType.MEDICAL;
          break;
        case 'Errands':
        case 'Airport Shuttle':
        case 'Other':
        default:
          serviceType = ServiceType.GENERAL;
      }

      // Convert distance from km to miles if provided
      const distanceMiles = createGuestRideDto.distanceKm ? createGuestRideDto.distanceKm * 0.621371 : null;

      // Calculate base price
      const basePrice = await this.calculateBasePrice(
        createGuestRideDto.serviceCategoryId,
        distanceMiles,
        scheduledAt
      );


      // Create the guest ride
      const ride = await this.prisma.ride.create({
        data: {
          passengerName: createGuestRideDto.passengerName,
          passengerPhone: createGuestRideDto.passengerPhone,
          pickupAddress: createGuestRideDto.pickup,
          dropoffAddress: createGuestRideDto.dropoff,
          serviceType, // mapped to ServiceType enum above
          serviceCategoryId: createGuestRideDto.serviceCategoryId,
          scheduledAt,
          additionalNotes: createGuestRideDto.notes,
          distance: distanceMiles,
          duration: createGuestRideDto.estimatedTime,
          basePrice,
          paymentType: createGuestRideDto.paymentType,
          status: RideStatus.PENDING,
          isGuest: true,
        },
      });

      console.log('✅ Guest ride created successfully:', ride.id);

      return {
        id: ride.id,
        pickup: ride.pickupAddress,
        dropoff: ride.dropoffAddress,
        serviceType: createGuestRideDto.serviceType,
        date: createGuestRideDto.date,
        time: createGuestRideDto.time,
        notes: ride.additionalNotes,
        distanceKm: createGuestRideDto.distanceKm,
        estimatedPrice: createGuestRideDto.estimatedPrice,
        estimatedTime: ride.duration,
        status: ride.status,
        passengerName: ride.passengerName,
        passengerPhone: ride.passengerPhone,
        basePrice: basePrice,
        scheduledAt: ride.scheduledAt,
        paymentType: ride.paymentType,
        createdAt: ride.createdAt,
        isGuest: true,
      };
    } catch (error) {
      console.error('❌ Error creating guest ride:', error);

      // Re-throw known exceptions
      if (error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException) {
        throw error;
      }

      // Wrap unknown errors
      throw new Error(`Failed to create guest ride booking: ${error.message}`);
    }
  }

  async getBookedDates(userId: number): Promise<string[]> {
    const rides = await this.prisma.ride.findMany({
      where: {
        customerId: userId,
        scheduledAt: {
          gte: new Date(), // Only future dates
        },
        status: {
          notIn: ['CANCELLED', 'COMPLETED'] // Exclude cancelled/completed rides
        }
      },
      select: {
        scheduledAt: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    // Extract just the date part (YYYY-MM-DD) and return unique dates
    const dates = rides.map(ride =>
      ride.scheduledAt.toISOString().split('T')[0]
    );

    return [...new Set(dates)]; // Remove duplicates
  }

  async getServiceCategories() {
    const categories = await this.prisma.serviceCategory.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        value: true,
        description: true,
        icon: true,
        basePrice: true,
        pricePerMile: true,
        serviceType: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return categories;
  }


  private determineServiceType(serviceCategoryName: string): 'AMBULATORY' | 'WHEELCHAIR' | 'OTHER' {
    const name = serviceCategoryName.toLowerCase();
    if (name.includes('wheelchair')) {
      return 'WHEELCHAIR';
    } else if (name.includes('ambulatory') || name.includes('medical')) {
      return 'AMBULATORY';
    }
    return 'OTHER';
  }

  private async calculateBasePrice(
    serviceCategoryId: number,
    distanceMiles: number | null,
    scheduledAt: Date
  ): Promise<number> {
    // Get service category to determine service type
    const serviceCategory = await this.prisma.serviceCategory.findUnique({
      where: { id: serviceCategoryId },
    });

    if (!serviceCategory) {
      throw new NotFoundException('Service category not found');
    }

    // Default to 5 miles if distance not provided
    const distance = distanceMiles || 5;

    // Get hour from scheduled time
    const hour = scheduledAt.getHours();

    // Determine time period
    const isDayTime = hour >= 6 && hour < 18; // 6AM to 6PM
    const isEvening = hour >= 18 && hour <= 23; // 6PM to 11PM
    const isLateNight = hour >= 0 && hour < 6; // 12AM to 6AM

    const serviceType = this.determineServiceType(serviceCategory.name);
    // Determine service type from category name or type
    const isWheelchair = serviceType === 'WHEELCHAIR';
    const isAmbulatory = serviceType === 'AMBULATORY'; // Default to ambulatory if not wheelchair
    let price: number;

    // Daytime pricing (6AM to 6PM)
    if (isDayTime) {
      if (distance <= 5) {
        price = isWheelchair ? 30 : 20;
      } else if (distance <= 10) {
        price = isWheelchair ? 40 : 30;
      } else if (distance <= 20) {
        price = isWheelchair ? 50 : 40;
      } else if (distance <= 50) {
        price = isWheelchair ? 85 : 75;
      } else {
        // For distances over 50 miles, use per-mile calculation
        const baseRate = isWheelchair ? 85 : 75;
        const additionalMiles = distance - 50;
        const perMileRate = isWheelchair ? 2.5 : 2.0;
        price = baseRate + (additionalMiles * perMileRate);
      }
    }
    // Evening pricing (6PM to 12AM)
    else if (isEvening) {
      if (distance <= 5) {
        price = isWheelchair ? 40 : 30;
      } else if (distance <= 10) {
        price = isWheelchair ? 50 : 40;
      } else if (distance <= 20) {
        price = isWheelchair ? 60 : 50;
      } else if (distance <= 50) {
        price = isWheelchair ? 105 : 85;
      } else {
        // For distances over 50 miles, use per-mile calculation
        const baseRate = isWheelchair ? 105 : 85;
        const additionalMiles = distance - 50;
        const perMileRate = isWheelchair ? 3.0 : 2.5;
        price = baseRate + (additionalMiles * perMileRate);
      }
    }
    // Late night pricing (12AM to 6AM) - using evening rates as default
    else if (isLateNight) {
      if (distance <= 5) {
        price = isWheelchair ? 40 : 30;
      } else if (distance <= 10) {
        price = isWheelchair ? 50 : 40;
      } else if (distance <= 20) {
        price = isWheelchair ? 60 : 50;
      } else if (distance <= 50) {
        price = isWheelchair ? 105 : 85;
      } else {
        const baseRate = isWheelchair ? 105 : 85;
        const additionalMiles = distance - 50;
        const perMileRate = isWheelchair ? 3.0 : 2.5;
        price = baseRate + (additionalMiles * perMileRate);
      }
    } else {
      // Fallback to original calculation if time doesn't match any category
      const basePrice = serviceCategory.basePrice;
      const pricePerMile = serviceCategory.pricePerMile;
      price = basePrice + (distance * pricePerMile);
    }

    console.log(`💰 Price calculation: ${distance} miles, ${isDayTime ? 'Day' : 'Evening/Night'}, ${isWheelchair ? 'Wheelchair' : 'Ambulatory'}, total: $${price}`);

    return parseFloat(price.toFixed(2));
  }

  async getExistingBookings(phone: string, serviceCategoryId: number) {
    // Get ALL rides for this service category (from any user)
    const rides = await this.prisma.ride.findMany({
      where: {
        serviceCategoryId: serviceCategoryId,
        scheduledAt: {
          gte: new Date() // Only future rides
        },
        status: {
          notIn: ['CANCELLED', 'COMPLETED'] // Exclude cancelled/completed rides
        }
      },
      select: {
        scheduledAt: true,
        status: true,
        passengerPhone: true // Include to identify if it's the current user
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    return rides.map(ride => ({
      date: ride.scheduledAt.toISOString().split('T')[0],
      time: ride.scheduledAt.toTimeString().split(' ')[0].substring(0, 5),
      status: ride.status,
      isCurrentUser: ride.passengerPhone === phone
    }));
  }

  async checkDateAvailability(passengerPhone: string, date: string, time: string): Promise<{ available: boolean; reason?: string }> {
    try {
      const scheduledAt = new Date(`${date}T${time}`);

      // Check if scheduled time is in the future
      if (scheduledAt <= new Date()) {
        return { available: false, reason: 'Ride must be scheduled for a future date and time' };
      }

      // Check for ANY booking on this date (global check - any user)
      const existingBookingOnDate = await this.prisma.ride.findFirst({
        where: {
          scheduledAt: {
            gte: new Date(date + 'T00:00:00'),
            lte: new Date(date + 'T23:59:59')
          },
          status: {
            notIn: ['CANCELLED', 'COMPLETED']
          }
        }
      });

      if (existingBookingOnDate) {
        return {
          available: false,
          reason: 'This date is fully booked. We provide one ride per day. Please choose a different date.'
        };
      }

      return { available: true };
    } catch (error) {
      console.error('Error checking date availability:', error);
      throw error;
    }
  }

  async getUserRides(userId: number) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID provided');
    }

    const rides = await this.prisma.ride.findMany({
      where: { customerId: userId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        driver: {
          select: {
            name: true,
            phone: true,
            driverProfile: {
              select: {
                vehicleInfo: true
              }
            }
          }
        },
        payment: {
          select: {
            status: true,
            amount: true
          }
        },
        invoice: {
          select: {
            id: true,
            pdfUrl: true,
            invoiceNumber: true
          }
        }
      }
    });

    return rides.map(ride => ({
      id: ride.id,
      pickup: ride.pickupAddress,
      dropoff: ride.dropoffAddress,
      serviceType: ride.serviceType,
      scheduledAt: ride.scheduledAt,
      status: ride.status,
      driver: ride.driver ? {
        name: ride.driver.name,
        phone: ride.driver.phone,
        vehicle: ride.driver.driverProfile?.vehicleInfo
      } : null,
      payment: ride.payment ? {
        status: ride.payment.status,
        amount: ride.payment.amount
      } : null,
      distance: ride.distance,
      duration: ride.duration,
      finalPrice: ride.finalPrice
    }));
  }

  // Add method to get ride details
  async getRideDetails(rideId: number, userId: number) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID provided');
    }

    const ride = await this.prisma.ride.findFirst({
      where: {
        id: rideId,
        customerId: userId
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        driver: {
          select: {
            name: true,
            phone: true,
            driverProfile: {
              select: {
                vehicleInfo: true,
                licenseNumber: true
              }
            }
          }
        },
        payment: {
          select: {
            status: true,
            amount: true,
            method: true,
            transactionId: true,
            paidAt: true
          }
        },
        invoice: {
          select: {
            id: true,
            pdfUrl: true,
            invoiceNumber: true,
            status: true,
            amount: true,
            dueDate: true
          }
        }
      }
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    return ride;
  }
}