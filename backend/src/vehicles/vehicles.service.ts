import { 
  Injectable, 
  ConflictException, 
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService
  ) {}

  async createVehicle(createVehicleDto: CreateVehicleDto, files?: import('multer').File[]) {
    try {
      console.log('🔧 Creating vehicle with data:', createVehicleDto);

      const existingVehicle = await this.prisma.vehicle.findFirst({
        where: { licensePlate: createVehicleDto.licensePlate }
      });

      if (existingVehicle) {
        throw new ConflictException('Vehicle with this license plate already exists');
      }

      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadResults = await this.cloudinaryService.uploadMultipleImages(files);
        imageUrls = uploadResults.map(result => result.url);
      }

      const vehicle = await this.prisma.vehicle.create({
        data: {
          make: createVehicleDto.make,
          model: createVehicleDto.model,
          year: createVehicleDto.year,
          color: createVehicleDto.color,
          licensePlate: createVehicleDto.licensePlate,
          vin: createVehicleDto.vin,
          type: createVehicleDto.type,
          capacity: createVehicleDto.capacity,
          hasWheelchairAccess: createVehicleDto.hasWheelchairAccess,
          hasOxygenSupport: createVehicleDto.hasOxygenSupport,
          insuranceExpiry: new Date(createVehicleDto.insuranceExpiry),
          liabilityInsuranceExpiry: new Date(createVehicleDto.liabilityInsuranceExpiry),
          registrationExpiry: new Date(createVehicleDto.registrationExpiry),
          images: JSON.stringify(imageUrls),
          status: 'AVAILABLE',
        },
      });

      return {
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
      };

    } catch (error) {
      console.error('❌ Error creating vehicle:', error);
      throw new BadRequestException('Failed to create vehicle: ' + error.message);
    }
  }

  async getAllVehicles() {
    try {
      const vehicles = await this.prisma.vehicle.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return vehicles;
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      throw new BadRequestException('Failed to fetch vehicles');
    }
  }

  async getVehicleById(id: number) {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      return vehicle;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('❌ Error fetching vehicle:', error);
      throw new BadRequestException('Failed to fetch vehicle');
    }
  }

  async updateVehicle(id: number, updateVehicleDto: UpdateVehicleDto, files?: import('multer').File[]) {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      if (updateVehicleDto.licensePlate && updateVehicleDto.licensePlate !== vehicle.licensePlate) {
        const existingVehicle = await this.prisma.vehicle.findFirst({
          where: { licensePlate: updateVehicleDto.licensePlate }
        });

        if (existingVehicle) {
          throw new ConflictException('Vehicle with this license plate already exists');
        }
        
      }

      let newImageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadResults = await this.cloudinaryService.uploadMultipleImages(files);
        newImageUrls = uploadResults.map(result => result.url);
      }

      const existingImages = typeof vehicle.images === 'string' ? JSON.parse(vehicle.images) : vehicle.images || [];
      const updatedImages = [...existingImages];
      if (newImageUrls.length > 0) updatedImages.push(...newImageUrls);

      const updateData: any = { ...updateVehicleDto };
      if (updatedImages.length > 0) updateData.images = JSON.stringify(updatedImages);

      if (updateVehicleDto.insuranceExpiry) {
        updateData.insuranceExpiry = new Date(updateVehicleDto.insuranceExpiry);
      }
      if (updateVehicleDto.registrationExpiry) {
        updateData.registrationExpiry = new Date(updateVehicleDto.registrationExpiry);
      }
      if (updateVehicleDto.liabilityInsuranceExpiry) {
      updateData.liabilityInsuranceExpiry = new Date(updateVehicleDto.liabilityInsuranceExpiry);
      }

      const updatedVehicle = await this.prisma.vehicle.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        message: 'Vehicle updated successfully',
        data: updatedVehicle
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;

      console.error('❌ Error updating vehicle:', error);
      throw new BadRequestException('Failed to update vehicle');
    }
  }

  async deleteVehicle(id: number) {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      if (vehicle.images && vehicle.images.length > 0) {
        console.log('Vehicle images would be deleted from Cloudinary:', vehicle.images);
      }

      await this.prisma.vehicle.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Vehicle deleted successfully'
      };

    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('❌ Error deleting vehicle:', error);
      throw new BadRequestException('Failed to delete vehicle');
    }
  }

  async updateVehicleStatus(id: number, status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE') {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id }
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      const updatedVehicle = await this.prisma.vehicle.update({
        where: { id },
        data: { status }
      });

      return {
        success: true,
        message: `Vehicle status updated to ${status}`,
        data: {
          id: updatedVehicle.id,
          status: updatedVehicle.status
        }
      };

    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('❌ Error updating vehicle status:', error);
      throw new BadRequestException('Failed to update vehicle status');
    }
  }

  async getVehicleStats() {
    try {
      const totalVehicles = await this.prisma.vehicle.count();
      const availableVehicles = await this.prisma.vehicle.count({ where: { status: 'AVAILABLE' } });
      const inUseVehicles = await this.prisma.vehicle.count({ where: { status: 'IN_USE' } });
      const maintenanceVehicles = await this.prisma.vehicle.count({ where: { status: 'MAINTENANCE' } });

      const vehicleTypes = await this.prisma.vehicle.groupBy({
        by: ['type'],
        _count: { id: true },
      });

      return {
        total: totalVehicles,
        available: availableVehicles,
        inUse: inUseVehicles,
        maintenance: maintenanceVehicles,
        byType: vehicleTypes.reduce((acc, curr) => {
          acc[curr.type] = curr._count.id;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('❌ Error fetching vehicle stats:', error);
      throw new BadRequestException('Failed to fetch vehicle statistics');
    }
  }
}
