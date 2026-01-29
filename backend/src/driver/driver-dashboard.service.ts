import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RideStatus, UserRole } from '@prisma/client';
import { UpdateDriverStatusDto } from './dto/create-driver.dto';
import { AcceptRideDto, UpdateRideStatusDto } from './dto/driver-ride.dto';

@Injectable()
export class DriverDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get driver profile with complete information
   */
  async getDriverProfile(driverId: number) {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id: driverId },
        include: {
          driverProfile: {
            include: {
              vehicles: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  color: true,
                  licensePlate: true,
                  type: true,
                  status: true,
                  capacity: true,
                  hasWheelchairAccess: true,
                  hasOxygenSupport: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      return {
        id: driver.id,
        email: driver.email,
        name: driver.name,
        phone: driver.phone,
        avatar: driver.avatar,
        isVerified: driver.isVerified,
        isActive: driver.isActive,
        lastLoginAt: driver.lastLoginAt,
        driverProfile: driver.driverProfile,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching driver profile:', error);
      throw new InternalServerErrorException('Failed to fetch driver profile');
    }
  }

  /**
   * Get driver statistics
   */
  async getDriverStats(driverId: number) {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id: driverId },
        include: { driverProfile: true },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      const [totalRides, completedRides, cancelledRides, activeRides] = await Promise.all([
        this.prisma.ride.count({
          where: { driverId },
        }),
        this.prisma.ride.count({
          where: { driverId, status: RideStatus.COMPLETED },
        }),
        this.prisma.ride.count({
          where: { driverId, status: RideStatus.CANCELLED },
        }),
        this.prisma.ride.count({
          where: {
            driverId,
            status: {
              in: [
                RideStatus.ASSIGNED,
                RideStatus.CONFIRMED,
                RideStatus.DRIVER_EN_ROUTE,
                RideStatus.PICKUP_ARRIVED,
                RideStatus.IN_PROGRESS,
              ],
            },
          },
        }),
      ]);

      // Calculate total earnings from completed rides
      const earnings = await this.prisma.payment.aggregate({
        where: {
          ride: {
            driverId,
            status: RideStatus.COMPLETED,
          },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      });

      return {
        totalRides,
        completedRides,
        cancelledRides,
        activeRides,
        rating: driver.driverProfile?.rating || 5.0,
        totalEarnings: earnings._sum.amount || 0,
        isAvailable: driver.driverProfile?.isAvailable,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching driver stats:', error);
      throw new InternalServerErrorException('Failed to fetch driver stats');
    }
  }

  /**
   * Get assigned vehicles
   */
  async getAssignedVehicles(driverId: number) {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id: driverId },
        include: {
          driverProfile: {
            include: {
              vehicles: true,
            },
          },
        },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      return driver.driverProfile?.vehicles;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching assigned vehicles:', error);
      throw new InternalServerErrorException('Failed to fetch assigned vehicles');
    }
  }

  /**
   * Update driver availability status
   */
  async updateDriverStatus(driverId: number, statusDto: UpdateDriverStatusDto) {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id: driverId },
        include: { driverProfile: true },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      await this.prisma.driverProfile.update({
        where: { userId: driverId },
        data: { isAvailable: statusDto.isAvailable },
      });

      // Log availability change
      if (!statusDto.isAvailable && statusDto.reason) {
        await this.prisma.driverAvailability.create({
          data: {
            driverId,
            startTime: new Date(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isAvailable: false,
            reason: statusDto.reason,
          },
        });
      }

      return {
        isAvailable: statusDto.isAvailable,
        reason: statusDto.reason,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error updating driver status:', error);
      throw new InternalServerErrorException('Failed to update driver status');
    }
  }

  /**
   * Get assigned rides
   */
  async getAssignedRides(driverId: number) {
    try {
      return await this.prisma.ride.findMany({
        where: {
          driverId,
          status: {
            in: [RideStatus.ASSIGNED, RideStatus.CONFIRMED],
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          payment: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching assigned rides:', error);
      throw new InternalServerErrorException('Failed to fetch assigned rides');
    }
  }

  /**
   * Get active rides (in progress)
   */
  async getActiveRides(driverId: number) {
    try {
      return await this.prisma.ride.findMany({
        where: {
          driverId,
          status: {
            in: [
              RideStatus.DRIVER_EN_ROUTE,
              RideStatus.PICKUP_ARRIVED,
              RideStatus.IN_PROGRESS,
            ],
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          payment: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching active rides:', error);
      throw new InternalServerErrorException('Failed to fetch active rides');
    }
  }

  /**
   * Get ride history
   */
  async getRideHistory(driverId: number, limit = 50) {
    try {
      return await this.prisma.ride.findMany({
        where: {
          driverId,
          status: {
            in: [RideStatus.COMPLETED, RideStatus.CANCELLED, RideStatus.NO_SHOW],
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          payment: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error fetching ride history:', error);
      throw new InternalServerErrorException('Failed to fetch ride history');
    }
  }

  /**
   * Get ride details
   */
  async getRideDetails(driverId: number, rideId: number) {
    try {
      const ride = await this.prisma.ride.findUnique({
        where: { id: rideId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              avatar: true,
            },
          },
          payment: true,
        },
      });

      if (!ride) {
        throw new NotFoundException('Ride not found');
      }

      if (ride.driverId !== driverId) {
        throw new UnauthorizedException('You are not assigned to this ride');
      }

      return ride;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error('Error fetching ride details:', error);
      throw new InternalServerErrorException('Failed to fetch ride details');
    }
  }

  /**
 * Accept ride
 */
async acceptRide(driverId: number, rideId: number, acceptRideDto: AcceptRideDto) {
  try {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId !== driverId) {
      throw new UnauthorizedException('You are not assigned to this ride');
    }

    if (ride.status !== RideStatus.ASSIGNED) {
      throw new BadRequestException('Ride cannot be accepted in current status');
    }

    // Check if this is a guest ride or regular ride
    if (!ride.customerId && !ride.isGuest) {
      throw new BadRequestException('Ride does not have a customer assigned');
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CONFIRMED,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    // Create notification for customer (if registered) OR handle guest ride notification
    if (ride.customerId) {
      // Registered user - create in-app notification
      await this.prisma.notification.create({
        data: {
          userId: ride.customerId,
          type: 'RIDE_UPDATED',
          title: 'Driver Accepted Your Ride',
          message: `Your driver will arrive in approximately ${acceptRideDto.estimatedArrivalMinutes} minutes.`,
          metadata: {
            rideId: ride.id,
            estimatedArrival: acceptRideDto.estimatedArrivalMinutes,
          },
        },
      });
    } else if (ride.isGuest) {

      console.log(`Guest ride ${ride.id} accepted. Passenger: ${ride.passengerName}, Phone: ${ride.passengerPhone}`);
    }

    return updatedRide;
  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    console.error('Error accepting ride:', error);
    throw new InternalServerErrorException('Failed to accept ride');
  }
}

  /**
   * Update ride status
   */
  async updateRideStatus(driverId: number, rideId: number, statusDto: UpdateRideStatusDto) {
    try {
      const ride = await this.prisma.ride.findUnique({
        where: { id: rideId },
      });

      if (!ride) {
        throw new NotFoundException('Ride not found');
      }

      if (ride.driverId !== driverId) {
        throw new UnauthorizedException('You are not assigned to this ride');
      }

      // Validate status transition
      this.validateStatusTransition(ride.status, statusDto.status);

      const updateData: any = {
        status: statusDto.status,
      };

      // Set timestamps based on status
      if (statusDto.status === RideStatus.PICKUP_ARRIVED) {
        updateData.actualPickupAt = new Date();
      } else if (statusDto.status === RideStatus.IN_PROGRESS) {
        if (!ride.actualPickupAt) {
          updateData.actualPickupAt = new Date();
        }
      } else if (statusDto.status === RideStatus.COMPLETED) {
        updateData.actualDropoffAt = new Date();
        if (!ride.actualPickupAt) {
          updateData.actualPickupAt = ride.scheduledAt;
        }
      }

      const updatedRide = await this.prisma.ride.update({
        where: { id: rideId },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          payment: true,
        },
      });

      // Update driver stats if ride is completed
      if (statusDto.status === RideStatus.COMPLETED) {
        await this.prisma.driverProfile.update({
          where: { userId: driverId },
          data: {
            totalTrips: { increment: 1 },
          },
        });
      }

      // Create notification for customer
      const notificationMessage = this.getStatusNotificationMessage(statusDto.status);
      if (notificationMessage && ride.customerId) {
        await this.prisma.notification.create({
          data: {
            userId: ride.customerId,
            type: 'RIDE_UPDATED',
            title: 'Ride Status Updated',
            message: notificationMessage,
            metadata: {
              rideId: ride.id,
              status: statusDto.status,
            },
          },
        });
      }

      return updatedRide;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error updating ride status:', error);
      throw new InternalServerErrorException('Failed to update ride status');
    }
  }

  /**
   * Get earnings summary
   */
  async getEarnings(driverId: number) {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id: driverId },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const [totalEarnings, monthlyEarnings, weeklyEarnings, todayEarnings] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            ride: { driverId },
            status: 'COMPLETED',
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            ride: { driverId },
            status: 'COMPLETED',
            paidAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            ride: { driverId },
            status: 'COMPLETED',
            paidAt: { gte: startOfWeek },
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            ride: { driverId },
            status: 'COMPLETED',
            paidAt: {
              gte: new Date(now.setHours(0, 0, 0, 0)),
            },
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        total: totalEarnings._sum.amount || 0,
        thisMonth: monthlyEarnings._sum.amount || 0,
        thisWeek: weeklyEarnings._sum.amount || 0,
        today: todayEarnings._sum.amount || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching earnings:', error);
      throw new InternalServerErrorException('Failed to fetch earnings');
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: RideStatus, newStatus: RideStatus) {
    const validTransitions: Record<RideStatus, RideStatus[]> = {
      [RideStatus.PENDING]: [RideStatus.ASSIGNED, RideStatus.CANCELLED],
      [RideStatus.ASSIGNED]: [RideStatus.CONFIRMED, RideStatus.CANCELLED],
      [RideStatus.CONFIRMED]: [RideStatus.DRIVER_EN_ROUTE, RideStatus.CANCELLED],
      [RideStatus.DRIVER_EN_ROUTE]: [RideStatus.PICKUP_ARRIVED, RideStatus.CANCELLED],
      [RideStatus.PICKUP_ARRIVED]: [RideStatus.IN_PROGRESS, RideStatus.NO_SHOW, RideStatus.CANCELLED],
      [RideStatus.IN_PROGRESS]: [RideStatus.COMPLETED, RideStatus.CANCELLED],
      [RideStatus.COMPLETED]: [],
      [RideStatus.CANCELLED]: [],
      [RideStatus.NO_SHOW]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Get notification message for status
   */
  private getStatusNotificationMessage(status: RideStatus): string | null {
    const messages: Record<RideStatus, string> = {
      [RideStatus.DRIVER_EN_ROUTE]: 'Your driver is on the way!',
      [RideStatus.PICKUP_ARRIVED]: 'Your driver has arrived at the pickup location.',
      [RideStatus.IN_PROGRESS]: 'Your ride is in progress.',
      [RideStatus.COMPLETED]: 'Your ride has been completed. Thank you!',
      [RideStatus.CANCELLED]: 'Your ride has been cancelled.',
      [RideStatus.NO_SHOW]: 'Ride marked as no-show.',
      [RideStatus.PENDING]: 'null',
      [RideStatus.ASSIGNED]: 'null',
      [RideStatus.CONFIRMED]: 'null',
    };

    return messages[status];
  }
}