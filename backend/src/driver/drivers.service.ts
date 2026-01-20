import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateDriverDto, UpdateDriverDto, AssignVehiclesDto, UpdateDriverStatusDto } from './dto/create-driver.dto';
import { DriverWithProfile, DriverStats } from './types/driver.types';
import { EmailService } from '../mail/email.service';

@Injectable()
export class DriversService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Create a new driver with profile
   */
  async createDriver(createDriverDto: CreateDriverDto): Promise<DriverWithProfile> {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createDriverDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Validate vehicle IDs if provided
      if (createDriverDto.vehicleIds && createDriverDto.vehicleIds.length > 0) {
        const vehicles = await this.prisma.vehicle.findMany({
          where: { id: { in: createDriverDto.vehicleIds } },
        });

        if (vehicles.length !== createDriverDto.vehicleIds.length) {
          throw new BadRequestException('One or more vehicle IDs are invalid');
        }

        // Check if vehicles are already assigned
        const assignedVehicles = vehicles.filter(v => v.driverProfileId !== null);
        if (assignedVehicles.length > 0) {
          throw new ConflictException(
            `Vehicles ${assignedVehicles.map(v => v.licensePlate).join(', ')} are already assigned`,
          );
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createDriverDto.password, 10);

      // Create user and driver profile in a transaction
      const driver = await this.prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: createDriverDto.email,
            password: hashedPassword,
            name: createDriverDto.name,
            phone: createDriverDto.phone,
            avatar: createDriverDto.avatar,
            role: UserRole.DRIVER,
            isVerified: true, // Auto-verify admin-created drivers
            isActive: true,
          },
        });

        // Create driver profile
        const profile = await tx.driverProfile.create({
          data: {
            userId: user.id,
            licenseNumber: createDriverDto.licenseNumber,
            licenseState: createDriverDto.licenseState,
            licenseExpiry: new Date(createDriverDto.licenseExpiry),
            vehicleInfo: createDriverDto.vehicleInfo,
            insuranceInfo: createDriverDto.insuranceInfo,
            isAvailable: createDriverDto.isAvailable ?? true,
          },
        });

        // Assign vehicles if provided
        if (createDriverDto.vehicleIds && createDriverDto.vehicleIds.length > 0) {
          await tx.vehicle.updateMany({
            where: { id: { in: createDriverDto.vehicleIds } },
            data: { driverProfileId: profile.id },
          });
        }

        return user.id;
      });

      // Send welcome email to driver
      await this.sendDriverWelcomeEmail(
        createDriverDto.email,
        createDriverDto.name,
        createDriverDto.password,
      );

      // Fetch and return the complete driver data
      return this.getDriverById(driver);
    } catch (error) {
      console.error('Error creating driver:', error);
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create driver');
    }
  }

  /**
   * Get all drivers with pagination
   */
  async getAllDrivers(page = 1, limit = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      const where = {
        role: UserRole.DRIVER,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [drivers, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          include: {
            driverProfile: {
              include: {
                vehicles: {
                  select: {
                    id: true,
                    make: true,
                    model: true,
                    year: true,
                    licensePlate: true,
                    type: true,
                    status: true,
                    driverProfileId: true,
                    hasWheelchairAccess: true,
                    hasOxygenSupport: true,
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: drivers.map(this.mapDriverResponse),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw new InternalServerErrorException('Failed to fetch drivers');
    }
  }

  /**
   * Get driver by ID
   */
  async getDriverById(id: number): Promise<DriverWithProfile> {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id },
        include: {
          driverProfile: {
            include: {
              vehicles: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  licensePlate: true,
                  type: true,
                  status: true,
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

      return this.mapDriverResponse(driver);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching driver:', error);
      throw new InternalServerErrorException('Failed to fetch driver');
    }
  }

  /**
   * Update driver information
   */
  async updateDriver(id: number, updateDriverDto: UpdateDriverDto): Promise<DriverWithProfile> {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id },
        include: { driverProfile: true },
      });

      if (!driver || driver.role !== UserRole.DRIVER || !driver.driverProfile) {
        throw new NotFoundException('Driver not found');
      }

      // Validate vehicle IDs if provided
      if (updateDriverDto.vehicleIds) {
        const vehicles = await this.prisma.vehicle.findMany({
          where: { id: { in: updateDriverDto.vehicleIds } },
        });

        if (vehicles.length !== updateDriverDto.vehicleIds.length) {
          throw new BadRequestException('One or more vehicle IDs are invalid');
        }

        // Check if vehicles are already assigned to other drivers
        const assignedVehicles = vehicles.filter(
          v => v.driverProfileId !== null && v.driverProfileId !== driver.driverProfile?.id,
        );
        if (assignedVehicles.length > 0) {
          throw new ConflictException(
            `Vehicles ${assignedVehicles.map(v => v.licensePlate).join(', ')} are already assigned`,
          );
        }
      }

      // Update in transaction
      await this.prisma.$transaction(async (tx) => {
        // Update user data
        const userUpdateData: any = {};
        if (updateDriverDto.name) userUpdateData.name = updateDriverDto.name;
        if (updateDriverDto.phone) userUpdateData.phone = updateDriverDto.phone;
        if (updateDriverDto.avatar) userUpdateData.avatar = updateDriverDto.avatar;

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id },
            data: userUpdateData,
          });
        }

        // Update driver profile
        const profileUpdateData: any = {};
        if (updateDriverDto.licenseNumber) profileUpdateData.licenseNumber = updateDriverDto.licenseNumber;
        if (updateDriverDto.licenseState) profileUpdateData.licenseState = updateDriverDto.licenseState;
        if (updateDriverDto.licenseExpiry) profileUpdateData.licenseExpiry = new Date(updateDriverDto.licenseExpiry);
        if (updateDriverDto.vehicleInfo !== undefined) profileUpdateData.vehicleInfo = updateDriverDto.vehicleInfo;
        if (updateDriverDto.insuranceInfo !== undefined) profileUpdateData.insuranceInfo = updateDriverDto.insuranceInfo;
        if (updateDriverDto.isAvailable !== undefined) profileUpdateData.isAvailable = updateDriverDto.isAvailable;

        if (Object.keys(profileUpdateData).length > 0) {
          await tx.driverProfile.update({
            where: { userId: id },
            data: profileUpdateData,
          });
        }

        // Update vehicle assignments if provided
        if (updateDriverDto.vehicleIds) {
          // Unassign all current vehicles
          await tx.vehicle.updateMany({
            where: { driverProfileId: driver.driverProfile?.id },
            data: { driverProfileId: null },
          });

          // Assign new vehicles
          if (updateDriverDto.vehicleIds.length > 0) {
            await tx.vehicle.updateMany({
              where: { id: { in: updateDriverDto.vehicleIds } },
              data: { driverProfileId: driver.driverProfile?.id },
            });
          }
        }
      });

      return this.getDriverById(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error updating driver:', error);
      throw new InternalServerErrorException('Failed to update driver');
    }
  }

  /**
   * Delete driver
   */
  async deleteDriver(id: number): Promise<{ message: string }> {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id },
        include: { driverProfile: true },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      // Check if driver has active rides
      const activeRides = await this.prisma.ride.count({
        where: {
          driverId: id,
          status: {
            in: ['ASSIGNED', 'CONFIRMED', 'DRIVER_EN_ROUTE', 'PICKUP_ARRIVED', 'IN_PROGRESS'],
          },
        },
      });

      if (activeRides > 0) {
        throw new BadRequestException('Cannot delete driver with active rides');
      }

      // Delete driver (cascade will handle profile and vehicle unassignment)
      await this.prisma.user.delete({
        where: { id },
      });

      return { message: 'Driver deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error deleting driver:', error);
      throw new InternalServerErrorException('Failed to delete driver');
    }
  }

  /**
   * Assign vehicles to driver
   */
  async assignVehicles(driverId: number, assignVehiclesDto: AssignVehiclesDto): Promise<DriverWithProfile> {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id: driverId },
        include: { driverProfile: true },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      // Validate vehicles
      const vehicles = await this.prisma.vehicle.findMany({
        where: { id: { in: assignVehiclesDto.vehicleIds } },
      });

      if (vehicles.length !== assignVehiclesDto.vehicleIds.length) {
        throw new BadRequestException('One or more vehicle IDs are invalid');
      }

      // Check if vehicles are already assigned to other drivers
      const assignedVehicles = vehicles.filter(
        v => v.driverProfileId !== null && v.driverProfileId !== driver.driverProfile?.id,
      );
      if (assignedVehicles.length > 0) {
        throw new ConflictException(
          `Vehicles ${assignedVehicles.map(v => v.licensePlate).join(', ')} are already assigned`,
        );
      }

      // Assign vehicles
      await this.prisma.vehicle.updateMany({
        where: { id: { in: assignVehiclesDto.vehicleIds } },
        data: { driverProfileId: driver.driverProfile?.id },
      });

      return this.getDriverById(driverId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error assigning vehicles:', error);
      throw new InternalServerErrorException('Failed to assign vehicles');
    }
  }

  /**
   * Unassign vehicle from driver
   */
  async unassignVehicle(driverId: number, vehicleId: number): Promise<DriverWithProfile> {
    try {
      const driver = await this.prisma.user.findUnique({
        where: { id: driverId },
        include: { driverProfile: true },
      });

      if (!driver || driver.role !== UserRole.DRIVER) {
        throw new NotFoundException('Driver not found');
      }

      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      if (vehicle.driverProfileId !== driver.driverProfile?.id) {
        throw new BadRequestException('Vehicle is not assigned to this driver');
      }

      await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { driverProfileId: null },
      });

      return this.getDriverById(driverId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error unassigning vehicle:', error);
      throw new InternalServerErrorException('Failed to unassign vehicle');
    }
  }

  /**
   * Update driver availability status
   */
  async updateDriverStatus(driverId: number, statusDto: UpdateDriverStatusDto): Promise<DriverWithProfile> {
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
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default
            isAvailable: false,
            reason: statusDto.reason,
          },
        });
      }

      return this.getDriverById(driverId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error updating driver status:', error);
      throw new InternalServerErrorException('Failed to update driver status');
    }
  }

  /**
   * Get driver statistics
   */
  async getDriverStats(): Promise<DriverStats> {
    try {
      const [totalDrivers, activeDrivers, profiles] = await Promise.all([
        this.prisma.user.count({
          where: { role: UserRole.DRIVER },
        }),
        this.prisma.user.count({
          where: { role: UserRole.DRIVER, isActive: true },
        }),
        this.prisma.driverProfile.findMany({
          select: { isAvailable: true, rating: true },
        }),
      ]);

      const availableDrivers = profiles.filter(p => p.isAvailable).length;
      const ratings: number[] = profiles.filter(p => p.rating !== null).map(p => p.rating as number);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      // Count drivers currently on trips
      const onTripRides = await this.prisma.ride.findMany({
        where: {
          status: { in: ['DRIVER_EN_ROUTE', 'PICKUP_ARRIVED', 'IN_PROGRESS'] },
          driverId: { not: null },
        },
        select: { driverId: true },
        distinct: ['driverId'],
      });
      const onTripDrivers = onTripRides.length;

      return {
        totalDrivers,
        activeDrivers,
        availableDrivers,
        onTripDrivers,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      throw new InternalServerErrorException('Failed to fetch driver statistics');
    }
  }

  /**
   * Get available drivers for assignment
   */
  async getAvailableDrivers() {
    try {
      const drivers = await this.prisma.user.findMany({
        where: {
          role: UserRole.DRIVER,
          isActive: true,
          driverProfile: {
            isAvailable: true,
          },
        },
        include: {
          driverProfile: {
            include: {
              vehicles: true,
            },
          },
        },
      });

      return drivers.map(this.mapDriverResponse);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw new InternalServerErrorException('Failed to fetch available drivers');
    }
  }

  /**
   * Send welcome email to new driver
   */
  private async sendDriverWelcomeEmail(email: string, name: string, password: string): Promise<void> {
    try {
      const payload = {
        to: email,
        subject: 'Welcome to Our Driver Team',
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>Your driver account has been created successfully.</p>
          <p><strong>Login Credentials:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Temporary Password: ${password}</li>
          </ul>
          <p>Please change your password after your first login for security purposes.</p>
          <p>You can now log in to the driver portal to start accepting rides.</p>
        `,
      };

      // Cast to any to allow different EmailService method names (sendEmail, sendMail, send)
      const svc: any = this.emailService as any;

      if (typeof svc.sendEmail === 'function') {
        await svc.sendEmail(payload);
      } else if (typeof svc.sendMail === 'function') {
        await svc.sendMail(payload);
      } else if (typeof svc.send === 'function') {
        await svc.send(payload);
      } else {
        console.warn('EmailService has no send/sendMail/sendEmail method; skipping welcome email.');
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error - driver creation should succeed even if email fails
    }
  }

  /**
   * Map driver response
   */
  private mapDriverResponse(driver: any): DriverWithProfile {
    return {
      id: driver.id,
      email: driver.email,
      name: driver.name,
      phone: driver.phone,
      avatar: driver.avatar,
      isVerified: driver.isVerified,
      isActive: driver.isActive,
      role: driver.role,
      createdAt: driver.createdAt,
      lastLoginAt: driver.lastLoginAt,
      driverProfile: driver.driverProfile ? {
        id: driver.driverProfile.id,
        licenseNumber: driver.driverProfile.licenseNumber,
        licenseState: driver.driverProfile.licenseState,
        licenseExpiry: driver.driverProfile.licenseExpiry,
        vehicleInfo: driver.driverProfile.vehicleInfo,
        insuranceInfo: driver.driverProfile.insuranceInfo,
        isAvailable: driver.driverProfile.isAvailable,
        rating: driver.driverProfile.rating,
        totalTrips: driver.driverProfile.totalTrips,
        vehicles: driver.driverProfile.vehicles || [],
      } : null,
    };
  }
}