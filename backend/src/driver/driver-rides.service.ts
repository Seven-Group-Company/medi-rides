import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EmailService } from '../mail/email.service';
import { PrismaService } from 'prisma/prisma.service';
import { RideStatus, Prisma } from '@prisma/client';
import { AcceptRideDto, UpdateRideStatusDto } from './dto/driver-ride.dto';

@Injectable()
export class DriverRidesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  async getAssignedRides(driverId: number) {
    return this.prisma.ride.findMany({
      where: {
        driverId,
        status: RideStatus.ASSIGNED,
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
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async getActiveRides(driverId: number) {
    return this.prisma.ride.findMany({
      where: {
        driverId,
        status: {
          in: [
            RideStatus.CONFIRMED,
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
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async getRideHistory(driverId: number) {
    return this.prisma.ride.findMany({
      where: {
        driverId,
        status: {
          in: [RideStatus.COMPLETED, RideStatus.CANCELLED],
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
        payment: {
          select: {
            status: true,
            amount: true,
            method: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      take: 50, // Limit history to last 50 rides
    });
  }

  async getRideDetails(rideId: number, driverId: number) {
    const ride = await this.prisma.ride.findFirst({
      where: {
        id: rideId,
        driverId,
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
        payment: {
          select: {
            status: true,
            amount: true,
            method: true,
            transactionId: true,
            paidAt: true,
          },
        },
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    return ride;
  }

  async acceptRide(rideId: number, driverId: number, acceptRideDto: AcceptRideDto) {
    const ride = await this.prisma.ride.findFirst({
      where: {
        id: rideId,
        driverId,
        status: RideStatus.ASSIGNED,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found or already accepted');
    }

    // Calculate estimated arrival time
    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + acceptRideDto.estimatedArrivalMinutes);

    return this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CONFIRMED,
        additionalNotes: acceptRideDto.notes
          ? `${ride.additionalNotes || ''}\nDriver ETA: ${acceptRideDto.estimatedArrivalMinutes} minutes`.trim()
          : ride.additionalNotes,
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
      },
    });
  }

  async updateRideStatus(rideId: number, driverId: number, updateRideStatusDto: UpdateRideStatusDto) {
    const ride = await this.prisma.ride.findFirst({
      where: {
        id: rideId,
        driverId,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(ride.status, updateRideStatusDto.status)) {
      throw new BadRequestException(`Invalid status transition from ${ride.status} to ${updateRideStatusDto.status}`);
    }

    const updateData: any = {
      status: updateRideStatusDto.status,
    };

    // Set timestamps based on status
    if (updateRideStatusDto.status === RideStatus.PICKUP_ARRIVED && !ride.actualPickupAt) {
      updateData.actualPickupAt = new Date();
    } else if (updateRideStatusDto.status === RideStatus.COMPLETED && !ride.actualDropoffAt) {
      updateData.actualDropoffAt = new Date();
    }

    // Add notes if provided
    if (updateRideStatusDto.notes) {
      updateData.additionalNotes = `${ride.additionalNotes || ''}\nDriver: ${updateRideStatusDto.notes}`.trim();
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
      },
    });

    console.log(`[DriverRidesService] Ride #${rideId} status updated to ${updateRideStatusDto.status}`);

    // Notify user if driver arrived
    if (updateRideStatusDto.status === RideStatus.PICKUP_ARRIVED) {
      if (updatedRide.customer?.email) {
        console.log(`[DriverRidesService] Triggering driver arrived email to ${updatedRide.customer.email}`);
        await this.emailService.sendDriverArrivedEmail(
          updatedRide.customer.email,
          updatedRide.customer.name,
          updatedRide
        );
      } else {
        console.log(`[DriverRidesService] Cannot send driver arrived email: No customer email linked (Guest ride?).`);
      }
    }

    return updatedRide;
  }

  async completeRide(rideId: number, driverId: number, actualDistance?: number, actualDuration?: number) {
    const ride = await this.prisma.ride.findFirst({
      where: {
        id: rideId,
        driverId,
        status: RideStatus.IN_PROGRESS,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found or not in progress');
    }

    return this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.COMPLETED,
        actualDropoffAt: new Date(),
        distance: actualDistance || ride.distance,
        duration: actualDuration || ride.duration,
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
        payment: {
          select: {
            status: true,
            amount: true,
            method: true,
            transactionId: true,
            paidAt: true,
          },
        },
      },
    });
  }

  private isValidStatusTransition(currentStatus: RideStatus, newStatus: RideStatus): boolean {
    const validTransitions: Record<RideStatus, RideStatus[]> = {
      [RideStatus.ASSIGNED]: [RideStatus.CONFIRMED, RideStatus.CANCELLED],
      [RideStatus.CONFIRMED]: [RideStatus.DRIVER_EN_ROUTE, RideStatus.CANCELLED],
      [RideStatus.DRIVER_EN_ROUTE]: [RideStatus.PICKUP_ARRIVED, RideStatus.CANCELLED],
      [RideStatus.PICKUP_ARRIVED]: [RideStatus.IN_PROGRESS, RideStatus.CANCELLED],
      [RideStatus.IN_PROGRESS]: [RideStatus.COMPLETED, RideStatus.CANCELLED],
      [RideStatus.COMPLETED]: [],
      [RideStatus.CANCELLED]: [],
      [RideStatus.PENDING]: [RideStatus.CANCELLED],
      [RideStatus.NO_SHOW]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}