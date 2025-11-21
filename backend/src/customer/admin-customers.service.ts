import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AdminCustomersService {
  constructor(private prisma: PrismaService) {}

  async getAllCustomers(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'CUSTOMER',
    };

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          isVerified: true,
          isActive: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          customerRides: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const customersWithStats = customers.map(customer => ({
      ...customer,
      totalRides: customer.customerRides.length,
      completedRides: customer.customerRides.filter(ride => ride.status === 'COMPLETED').length,
    }));

    return {
      data: customersWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCustomerStatus(customerId: number, isActive: boolean) {
    const customer = await this.prisma.user.findUnique({
      where: { 
        id: customerId,
        role: 'CUSTOMER',
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updatedCustomer = await this.prisma.user.update({
      where: { id: customerId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return updatedCustomer;
  }

  async getCustomerStats() {
    const [
      totalCustomers,
      activeCustomers,
      verifiedCustomers,
      newCustomersThisWeek,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', isVerified: true } }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get customers with most rides
    const topCustomers = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        customerRides: {
          select: { id: true },
        },
      },
      orderBy: {
        customerRides: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return {
      totalCustomers,
      activeCustomers,
      verifiedCustomers,
      newCustomersThisWeek,
      topCustomers: topCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalRides: customer.customerRides.length,
      })),
    };
  }
}