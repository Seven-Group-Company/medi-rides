import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RideStatus } from '@prisma/client';

@Injectable()
export class AdminRidesService {
  constructor(private prisma: PrismaService) {}

  async getAllRides(
    page: number = 1,
    limit: number = 10,
    status?: RideStatus,
    search?: string,
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
      ];
    }

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take: limit,
        include: {
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
                    },
                  },
                },
              },
            },
          },
          payment: true,
        },
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

    // TODO: Send email/notification to customer about approval and pricing

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

    // TODO: Send email/notification to customer about decline

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

    // TODO: Send notification to driver about new assignment

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