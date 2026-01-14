import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EmailService } from '../mail/email.service';
import { PrismaService } from 'prisma/prisma.service';
import { RideStatus } from '@prisma/client';

@Injectable()
export class AdminRidesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  async getAllRides(
    page: number = 1,
    limit: number = 10,
    status?: RideStatus,
    search?: string,
    include?: string, // Add include parameter
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { pickupAddress: { contains: search, mode: 'insensitive' } },
        { dropoffAddress: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { passengerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build include object
    const includeObject: any = {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          driverProfile: {
            select: {
              licenseNumber: true,
              vehicles: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  licensePlate: true,
                  status: true, // Add this line
                  capacity: true, // Add this line
                  type: true, // Add this line
                  hasWheelchairAccess: true, // Add this line
                  hasOxygenSupport: true, // Add this line
                },
              },
            },
          },
        },
      },
      payment: true,
    };

    // Include invoice if requested
    if (include && include.includes('invoice')) {
      includeObject.invoice = true;
    }

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take: limit,
        include: includeObject,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ride.count({ where }),
    ]);

    return {
      data: rides,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveRide(rideId: number, price: number, note?: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status !== RideStatus.PENDING) {
      throw new BadRequestException('Ride is not in pending status');
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CONFIRMED,
        finalPrice: price,
        additionalNotes: note ? `${ride.additionalNotes || ''}\nAdmin: ${note}`.trim() : ride.additionalNotes,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Notify customer
    if (updatedRide.customer?.email) {
      await this.emailService.sendRideStatusUpdateEmail(
        updatedRide.customer.email,
        updatedRide.customer.name,
        updatedRide,
        'CONFIRMED'
      );
    }

    return updatedRide;
  }

  async declineRide(rideId: number, reason: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status !== RideStatus.PENDING) {
      throw new BadRequestException('Ride is not in pending status');
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CANCELLED,
        additionalNotes: `${ride.additionalNotes || ''}\nAdmin Decline Reason: ${reason}`.trim(),
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Notify customer
    if (updatedRide.customer?.email) {
      await this.emailService.sendRideStatusUpdateEmail(
        updatedRide.customer.email,
        updatedRide.customer.name,
        updatedRide,
        'CANCELLED'
      );
    }

    return updatedRide;
  }

  async assignDriver(rideId: number, driverId: number, vehicleId: number) {
    const [ride, driver, vehicle] = await Promise.all([
      this.prisma.ride.findUnique({ where: { id: rideId } }),
      this.prisma.user.findUnique({
        where: { id: driverId },
        include: { driverProfile: true },
      }),
      this.prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    ]);

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (!driver || driver.role !== 'DRIVER' || !driver.driverProfile) {
      throw new NotFoundException('Driver not found');
    }

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== 'AVAILABLE') {
      throw new BadRequestException('Vehicle is not available');
    }

    const updatedRide = await this.prisma.$transaction(async (tx) => {
      // Update ride with driver assignment
      const rideUpdate = await tx.ride.update({
        where: { id: rideId },
        data: {
          driverId,
          status: RideStatus.ASSIGNED,
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          driver: {
            select: {
              name: true,
              email: true,
              phone: true,
              driverProfile: {
                select: {
                  vehicleInfo: true,
                  vehicles: {
                    select: {
                      licensePlate: true
                    }
                  }
                }
              }
            },
          },
        },
      });

      // Update vehicle status
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'IN_USE' },
      });

      return rideUpdate;
    });

    // Notify driver
    if (updatedRide.driver?.email) {
      await this.emailService.sendDriverAssignedEmail(
        updatedRide.driver.email,
        updatedRide.driver.name,
        updatedRide
      );
    }

    // Notify customer
    if (updatedRide.customer?.email) {
      await this.emailService.sendDriverDetailsEmail(
        updatedRide.customer.email,
        updatedRide.customer.name,
        updatedRide,
        updatedRide.driver
      );
    }

    return updatedRide;
  }

  async completeRide(rideId: number) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        customer: true,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Check if ride can be completed
    if (ride.status !== RideStatus.ASSIGNED && ride.status !== RideStatus.IN_PROGRESS) {
      throw new BadRequestException('Ride cannot be completed from current status');
    }

    // Update ride status to COMPLETED
    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.COMPLETED,
      },
      include: {
        customer: true,
        invoice: true,
        driver: true, // Include driver for email template
      },
    });

    console.log(`[AdminRidesService] Ride #${rideId} completed. Sending notifications...`);

    // Generate invoice automatically if not exists
    if (!updatedRide.invoice) {
      // ... (existing invoice logic)
    }

    // Notify customer
    if (updatedRide.customer?.email) {
      console.log(`[AdminRidesService] Sending completion email to customer: ${updatedRide.customer.email}`);
      const invoiceUrl = updatedRide.invoice?.pdfUrl ? `${this.emailService['configService'].get('FRONTEND_URL')}/invoices/${updatedRide.invoice.id}` : undefined;

      await this.emailService.sendRideStatusUpdateEmail(
        updatedRide.customer.email,
        updatedRide.customer.name,
        updatedRide,
        'COMPLETED',
        invoiceUrl
      );
    } else {
      console.log(`[AdminRidesService] No customer email linked for ride #${rideId}. Skipping customer email.`);
    }

    // Notify Admin of completion
    console.log(`[AdminRidesService] Sending completion email to Admin.`);
    await this.emailService.sendRideCompletedAdminEmail(updatedRide);

    return updatedRide;
  }

  async getRideStats() {
    const [
      totalRides,
      pendingRides,
      completedRides,
      cancelledRides,
      assignedRides,
    ] = await Promise.all([
      this.prisma.ride.count(),
      this.prisma.ride.count({ where: { status: RideStatus.PENDING } }),
      this.prisma.ride.count({ where: { status: RideStatus.COMPLETED } }),
      this.prisma.ride.count({ where: { status: RideStatus.CANCELLED } }),
      this.prisma.ride.count({ where: { status: RideStatus.ASSIGNED } }),
    ]);

    const recentRides = await this.prisma.ride.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return {
      totalRides,
      pendingRides,
      completedRides,
      cancelledRides,
      assignedRides,
      recentRides,
    };
  }
}