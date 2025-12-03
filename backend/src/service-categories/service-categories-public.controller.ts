import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServiceCategoriesService } from './service-categories.service';

@ApiTags('Service Categories (Public)')
@Controller('service-categories')
export class ServiceCategoriesPublicController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

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
}