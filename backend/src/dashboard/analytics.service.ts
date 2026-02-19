import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getWeeklyAnalytics(weeks: number = 4) {
    const weeklyData: Array<{
      week: string;
      startDate: Date;
      endDate: Date;
      rides: number;
      revenue: number;
      avgRideValue: number;
    }> = [];
    const now = new Date();
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      
      const rides = await this.prisma.ride.count({
        where: {
          scheduledAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      });
      
      const revenue = await this.prisma.ride.aggregate({
        where: {
          scheduledAt: {
            gte: weekStart,
            lte: weekEnd,
          },
          status: 'COMPLETED',
          finalPrice: { not: null },
        },
        _sum: {
          finalPrice: true,
        },
      });
      
      weeklyData.push({
        week: format(weekStart, 'MMM dd'),
        startDate: weekStart,
        endDate: weekEnd,
        rides,
        revenue: revenue._sum.finalPrice || 0,
        avgRideValue: rides > 0 ? (revenue._sum.finalPrice || 0) / rides : 0,
      });
    }
    
    return weeklyData;
  }

  async getMonthlyAnalytics(months: number = 6) {
    const monthlyData: Array<{
      month: string;
      startDate: Date;
      endDate: Date;
      rides: number;
      revenue: number;
      avgRideValue: number;
    }> = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      const rides = await this.prisma.ride.count({
        where: {
          scheduledAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });
      
      const revenue = await this.prisma.ride.aggregate({
        where: {
          scheduledAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: 'COMPLETED',
          finalPrice: { not: null },
        },
        _sum: {
          finalPrice: true,
        },
      });
      
      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
        startDate: monthStart,
        endDate: monthEnd,
        rides,
        revenue: revenue._sum.finalPrice || 0,
        avgRideValue: rides > 0 ? (revenue._sum.finalPrice || 0) / rides : 0,
      });
    }
    
    return monthlyData;
  }

  async getRevenueAnalytics(period: string = 'month') {
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'month':
      default:
        startDate = startOfMonth(now);
        break;
    }
    
    // Get daily revenue for the period
    const revenueData = await this.prisma.ride.groupBy({
      by: ['scheduledAt'],
      where: {
        scheduledAt: {
          gte: startDate,
          lte: now,
        },
        status: 'COMPLETED',
        finalPrice: { not: null },
      },
      _sum: {
        finalPrice: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
    
    // Group by day
    const dailyRevenue = revenueData.reduce((acc, item) => {
      const date = format(item.scheduledAt, 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += item._sum.finalPrice || 0;
      return acc;
    }, {} as Record<string, number>);
    
    
    return {
      period,
      startDate,
      endDate: now,
      dailyRevenue,
      totalRevenue: Object.values(dailyRevenue).reduce((sum, revenue) => sum + revenue, 0),
    };
  }

  async getAnalyticsSummary() {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    
    const [
      totalRides,
      thisWeekRides,
      thisMonthRides,
      totalRevenue,
      thisWeekRevenue,
      thisMonthRevenue,
      activeRides,
      topServices,
    ] = await Promise.all([
      // Total rides
      this.prisma.ride.count(),
      
      // This week rides
      this.prisma.ride.count({
        where: {
          scheduledAt: {
            gte: weekStart,
            lte: now,
          },
        },
      }),
      
      // This month rides
      this.prisma.ride.count({
        where: {
          scheduledAt: {
            gte: monthStart,
            lte: now,
          },
        },
      }),
      
      // Total revenue
      this.prisma.ride.aggregate({
        where: {
          status: 'COMPLETED',
          finalPrice: { not: null },
        },
        _sum: {
          finalPrice: true,
        },
      }),
      
      // This week revenue
      this.prisma.ride.aggregate({
        where: {
          scheduledAt: {
            gte: weekStart,
            lte: now,
          },
          status: 'COMPLETED',
          finalPrice: { not: null },
        },
        _sum: {
          finalPrice: true,
        },
      }),
      
      // This month revenue
      this.prisma.ride.aggregate({
        where: {
          scheduledAt: {
            gte: monthStart,
            lte: now,
          },
          status: 'COMPLETED',
          finalPrice: { not: null },
        },
        _sum: {
          finalPrice: true,
        },
      }),
      
      // Active rides (not completed or cancelled)
      this.prisma.ride.count({
        where: {
          status: {
            notIn: ['COMPLETED', 'CANCELLED'],
          },
        },
      }),
      
      // Recent rides (last 5)
      this.prisma.ride.findMany({
        where: {
          scheduledAt: {
            gte: weekStart,
          },
        },
        take: 5,
        orderBy: {
          scheduledAt: 'desc',
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);
    
    return {
      summary: {
        totalRides,
        thisWeekRides,
        thisMonthRides,
        totalRevenue: totalRevenue._sum.finalPrice || 0,
        thisWeekRevenue: thisWeekRevenue._sum.finalPrice || 0,
        thisMonthRevenue: thisMonthRevenue._sum.finalPrice || 0,
        activeRides,
        avgRideValue: totalRides > 0 ? (totalRevenue._sum.finalPrice || 0) / totalRides : 0,
      },
    };
  }
}