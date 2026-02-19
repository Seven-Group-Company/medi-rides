import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from './dto/create-service-category.dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class ServiceCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto) {
    try {
      // Check if name or value already exists
      const existingCategory = await this.prisma.serviceCategory.findFirst({
        where: {
          OR: [
            { name: createServiceCategoryDto.name },
            { value: createServiceCategoryDto.value },
          ],
        },
      });

      if (existingCategory) {
        throw new ConflictException('Service category with this name or value already exists');
      }

      return await this.prisma.serviceCategory.create({
        data: {
          name: createServiceCategoryDto.name,
          value: createServiceCategoryDto.value,
          description: createServiceCategoryDto.description,
          icon: createServiceCategoryDto.icon,
          isActive: createServiceCategoryDto.isActive ?? true,
          basePrice: createServiceCategoryDto.basePrice ?? 15.00,
          pricePerMile: createServiceCategoryDto.pricePerMile ?? 1.50,
          serviceType: createServiceCategoryDto.serviceType ?? ServiceType.GENERAL,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create service category');
    }
  }

  async findAll() {
    return await this.prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    return category;
  }

  async update(id: number, updateServiceCategoryDto: UpdateServiceCategoryDto) {
    try {
      const category = await this.prisma.serviceCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Service category not found');
      }

      // Check if name is being changed and if it conflicts
      if (updateServiceCategoryDto.name && updateServiceCategoryDto.name !== category.name) {
        const existingCategory = await this.prisma.serviceCategory.findFirst({
          where: {
            name: updateServiceCategoryDto.name,
            id: { not: id },
          },
        });

        if (existingCategory) {
          throw new ConflictException('Service category with this name already exists');
        }
      }

      return await this.prisma.serviceCategory.update({
        where: { id },
        data: updateServiceCategoryDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update service category');
    }
  }

  async remove(id: number) {
    try {
      const category = await this.prisma.serviceCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Service category not found');
      }

      await this.prisma.serviceCategory.delete({
        where: { id },
      });

      return { message: 'Service category deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete service category');
    }
  }

  async getActiveCategories() {
    return await this.prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async toggleStatus(id: number) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    return await this.prisma.serviceCategory.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
  }
}