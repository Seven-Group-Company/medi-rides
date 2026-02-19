import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UserRole, RideStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: number, userRole: UserRole) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate start of week (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const baseWhere = userRole === UserRole.ADMIN 
      ? {} 
      : userRole === UserRole.DRIVER
      ? { driverId: userId }
      : { customerId: userId };

    const [
      totalRides,
      todayRides,
      upcomingRides,
      completedRides,
      ridesThisWeek,
      totalRevenue
    ] = await Promise.all([
      // Total rides
      this.prisma.ride.count({
        where: baseWhere,
      }),

      // Today's rides
      this.prisma.ride.count({
        where: {
          ...baseWhere,
          scheduledAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Upcoming rides (future rides that are not completed)
      this.prisma.ride.count({
        where: {
          ...baseWhere,
          scheduledAt: {
            gte: tomorrow,
          },
          status: {
            notIn: [RideStatus.COMPLETED, RideStatus.CANCELLED],
          },
        },
      }),

      // Completed rides
      this.prisma.ride.count({
        where: {
          ...baseWhere,
          status: RideStatus.COMPLETED,
        },
      }),

      // Rides this week
      this.prisma.ride.count({
        where: {
          ...baseWhere,
          scheduledAt: {
            gte: startOfWeek,
          },
        },
      }),

      // Total revenue (sum of completed ride prices)
      this.prisma.ride.aggregate({
        where: {
          ...baseWhere,
          status: RideStatus.COMPLETED,
          finalPrice: { not: null },
        },
        _sum: {
          finalPrice: true,
        },
      }),
    ]);

    // Get recent rides (last 10)
    const recentRides = await this.prisma.ride.findMany({
      where: baseWhere,
      take: 10,
      orderBy: { scheduledAt: 'desc' },
      include: {
        customer: userRole === UserRole.ADMIN ? {
          select: {
            name: true,
            email: true,
          },
        } : false,
        driver: userRole !== UserRole.CUSTOMER ? {
          select: {
            name: true,
            driverProfile: {
              select: {
                vehicleInfo: true,
              },
            },
          },
        } : undefined,
        invoice: {
          select: {
            id: true,
            pdfUrl: true,
            invoiceNumber: true,
          },
        },
      },
    });

    // Format recent rides
    const formattedRecentRides = recentRides.map(ride => ({
      id: ride.id,
      pickup: ride.pickupAddress,
      dropoff: ride.dropoffAddress,
      scheduledAt: ride.scheduledAt.toISOString(),
      status: ride.status,
      passengerName: ride.passengerName || ride.customer?.name || 'Guest',
      driverName: ride.driver?.name,
      finalPrice: ride.finalPrice,
      invoice: ride.invoice,
    }));

    return {
      stats: {
        totalRides,
        todayRides,
        upcomingRides,
        completedRides,
        ridesThisWeek,
        totalRevenue: totalRevenue._sum.finalPrice || 0,
      },
      recentRides: formattedRecentRides,
    };
  }
}