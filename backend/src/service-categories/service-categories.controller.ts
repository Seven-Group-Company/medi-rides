import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceCategoriesService } from './service-categories.service';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from './dto/create-service-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Service Categories')
@Controller('admin/service-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service category' })
  @ApiResponse({ status: 201, description: 'Service category created successfully' })
  @ApiResponse({ status: 409, description: 'Service category already exists' })
  async create(@Body(ValidationPipe) createServiceCategoryDto: CreateServiceCategoryDto) {
    const category = await this.serviceCategoriesService.create(createServiceCategoryDto);
    return {
      success: true,
      message: 'Service category created successfully',
      data: category,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({ status: 200, description: 'Service categories retrieved successfully' })
  async findAll() {
    const categories = await this.serviceCategoriesService.findAll();
    return {
      success: true,
      data: categories,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active service categories' })
  @ApiResponse({ status: 200, description: 'Active service categories retrieved successfully' })
  async getActiveCategories() {
    const categories = await this.serviceCategoriesService.getActiveCategories();
    return {
      success: true,
      data: categories,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service category by ID' })
  @ApiResponse({ status: 200, description: 'Service category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const category = await this.serviceCategoriesService.findOne(id);
    return {
      success: true,
      data: category,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service category' })
  @ApiResponse({ status: 200, description: 'Service category updated successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateServiceCategoryDto: UpdateServiceCategoryDto,
  ) {
    const category = await this.serviceCategoriesService.update(id, updateServiceCategoryDto);
    return {
      success: true,
      message: 'Service category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service category' })
  @ApiResponse({ status: 200, description: 'Service category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete category with associated rides' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.serviceCategoriesService.remove(id);
    return {
      success: true,
      ...result,
    };
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle service category status' })
  @ApiResponse({ status: 200, description: 'Service category status updated successfully' })
  @ApiResponse({ status: 404, description: 'Service category not found' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const category = await this.serviceCategoriesService.toggleStatus(id);
    return {
      success: true,
      message: `Service category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category,
    };
  }
}