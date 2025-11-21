import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RideStatus, VehicleStatus } from '@prisma/client';

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalCustomers,
      activeCustomers,
      totalRides,
      pendingRides,
      completedRides,
      totalDrivers,
      availableDrivers,
      totalVehicles,
      availableVehicles,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      this.prisma.ride.count(),
      this.prisma.ride.count({ where: { status: RideStatus.PENDING } }),
      this.prisma.ride.count({ where: { status: RideStatus.COMPLETED } }),
      this.prisma.user.count({ where: { role: 'DRIVER' } }),
      this.prisma.driverProfile.count({ where: { isAvailable: true } }),
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
      this.prisma.ride.aggregate({
        where: { status: RideStatus.COMPLETED },
        _sum: { finalPrice: true },
      }),
    ]);

    // Recent activity (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [recentRides, recentCustomers, recentRevenue] = await Promise.all([
      this.prisma.ride.count({
        where: { createdAt: { gte: oneWeekAgo } },
      }),
      this.prisma.user.count({
        where: { 
          role: 'CUSTOMER',
          createdAt: { gte: oneWeekAgo },
        },
      }),
      this.prisma.ride.aggregate({
        where: { 
          status: RideStatus.COMPLETED,
          createdAt: { gte: oneWeekAgo },
        },
        _sum: { finalPrice: true },
      }),
    ]);

    // Ride status distribution
    const rideStatusDistribution = await this.prisma.ride.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return {
      totalCustomers,
      activeCustomers,
      totalRides,
      pendingRides,
      completedRides,
      totalDrivers,
      availableDrivers,
      totalVehicles,
      availableVehicles,
      totalRevenue: totalRevenue._sum.finalPrice || 0,
      recentRides,
      recentCustomers,
      recentRevenue: recentRevenue._sum.finalPrice || 0,
      rideStatusDistribution,
    };
  }
}