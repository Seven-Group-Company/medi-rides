import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { plainToInstance } from 'class-transformer';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { validate } from 'class-validator';

@ApiTags('Admin Vehicles')
@Controller('admin/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

@Post()
@UseInterceptors(FilesInterceptor('images', 5))
@ApiConsumes('multipart/form-data')
@HttpCode(HttpStatus.CREATED)
async createVehicle(
  @Body() body: any, // Change to any to handle FormData
  @UploadedFiles() files: import('multer').File[]
) {
  let createVehicleDto: CreateVehicleDto;
  
  try {
    // Parse the JSON string from FormData
    if (body.vehicleData) {
      const vehicleData = JSON.parse(body.vehicleData);
      createVehicleDto = plainToInstance(CreateVehicleDto, vehicleData);
    } else {
      // Fallback: try to use the raw body (for non-FormData requests)
      createVehicleDto = plainToInstance(CreateVehicleDto, body);
    }
  } catch (error) {
    throw new BadRequestException('Invalid vehicle data format');
  }

  // Validate the DTO
  const errors = await validate(createVehicleDto);
  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }

  return this.vehiclesService.createVehicle(createVehicleDto, files);
}

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiResponse({ status: 200, description: 'Vehicles retrieved successfully' })
  async getAllVehicles() {
    const vehicles = await this.vehiclesService.getAllVehicles();
    return {
      success: true,
      data: vehicles,
      count: vehicles.length
    };
  }

  @Post('test')
@UseInterceptors(FilesInterceptor('images', 5))
async testEndpoint(
  @Body() body: any,
  @UploadedFiles() files: import('multer').File[]
) {
  console.log('=== TEST ENDPOINT ===');
  console.log('Body keys:', Object.keys(body));
  console.log('Has vehicleData?', !!body.vehicleData);
  
  if (body.vehicleData) {
    try {
      const parsed = JSON.parse(body.vehicleData);
      console.log('Parsed vehicleData:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('Parse error:', e);
    }
  }
  
  return { success: true, message: 'Test received' };
}

  @Get('stats')
  @ApiOperation({ summary: 'Get vehicle statistics' })
  @ApiResponse({ status: 200, description: 'Vehicle stats retrieved successfully' })
  async getVehicleStats() {
    const stats = await this.vehiclesService.getVehicleStats();
    return {
      success: true,
      data: stats
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async getVehicleById(@Param('id', ParseIntPipe) id: number) {
    const vehicle = await this.vehiclesService.getVehicleById(id);
    return {
      success: true,
      data: vehicle
    };
  }

// vehicles.controller.ts - updateVehicle method
@Put(':id')
@UseInterceptors(FilesInterceptor('images', 5))
@ApiConsumes('multipart/form-data')
@HttpCode(HttpStatus.OK)
async updateVehicle(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: any,
  @UploadedFiles() files: import('multer').File[]
) {
  let updateVehicleDto: UpdateVehicleDto;
  
  try {
    // Try to parse from 'data' field (frontend default) or 'vehicleData' field
    if (body.data) {
      const vehicleData = JSON.parse(body.data);
      updateVehicleDto = plainToInstance(UpdateVehicleDto, vehicleData);
    } else if (body.vehicleData) {
      const vehicleData = JSON.parse(body.vehicleData);
      updateVehicleDto = plainToInstance(UpdateVehicleDto, vehicleData);
    } else {
      // Fallback: try to use the raw body
      updateVehicleDto = plainToInstance(UpdateVehicleDto, body);
    }
  } catch (error) {
    console.error('Error parsing vehicle data:', error);
    throw new BadRequestException('Invalid vehicle data format');
  }

  // Validate the DTO
  const errors = await validate(updateVehicleDto);
  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }

  return this.vehiclesService.updateVehicle(id, updateVehicleDto, files);
}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async deleteVehicle(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.deleteVehicle(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update vehicle status' })
  @ApiResponse({ status: 200, description: 'Vehicle status updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async updateVehicleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'
  ) {
    return this.vehiclesService.updateVehicleStatus(id, status);
  }
}