import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, RideStatus } from '@prisma/client';
import { AdminRidesService } from './admin-rides.service';

@ApiTags('Admin Rides')
@Controller('admin/rides')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminRidesController {
  constructor(private readonly adminRidesService: AdminRidesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rides with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RideStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'include', required: false, type: String, description: 'Comma-separated relations to include (e.g., invoice,customer)' })
  @ApiResponse({ status: 200, description: 'Rides retrieved successfully' })
  async getAllRides(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: RideStatus,
    @Query('search') search?: string,
    @Query('include') include?: string, // Add include parameter
  ) {
    const pageNum = parseInt(page || '1') || 1;
    const limitNum = parseInt(limit || '10') || 10;
    
    const result = await this.adminRidesService.getAllRides(
      pageNum,
      limitNum,
      status,
      search,
      include // Pass include parameter
    );
    
    return {
      success: true,
      ...result,
    };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a ride with pricing' })
  @ApiResponse({ status: 200, description: 'Ride approved successfully' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  async approveRide(
    @Param('id', ParseIntPipe) rideId: number,
    @Body() body: { price: number; note?: string },
  ) {
    const ride = await this.adminRidesService.approveRide(rideId, body.price, body.note);
    
    return {
      success: true,
      message: 'Ride approved successfully',
      data: ride,
    };
  }

  @Post(':id/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline a ride with reason' })
  @ApiResponse({ status: 200, description: 'Ride declined successfully' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  async declineRide(
    @Param('id', ParseIntPipe) rideId: number,
    @Body() body: { reason: string },
  ) {
    const ride = await this.adminRidesService.declineRide(rideId, body.reason);
    
    return {
      success: true,
      message: 'Ride declined successfully',
      data: ride,
    };
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign driver and vehicle to a ride' })
  @ApiResponse({ status: 200, description: 'Driver assigned successfully' })
  @ApiResponse({ status: 404, description: 'Ride, driver or vehicle not found' })
  async assignDriver(
    @Param('id', ParseIntPipe) rideId: number,
    @Body() body: { driverId: number; vehicleId: number },
  ) {
    const ride = await this.adminRidesService.assignDriver(
      rideId,
      body.driverId,
      body.vehicleId
    );
    
    return {
      success: true,
      message: 'Driver assigned successfully',
      data: ride,
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a ride as completed and generate invoice' })
  @ApiResponse({ status: 200, description: 'Ride completed successfully' })
  async completeRide(@Param('id', ParseIntPipe) rideId: number) {
    const ride = await this.adminRidesService.completeRide(rideId);
    
    return {
      success: true,
      message: 'Ride marked as completed and invoice generated',
      data: ride,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ride statistics for admin' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getRideStats() {
    const stats = await this.adminRidesService.getRideStats();
    
    return {
      success: true,
      data: stats,
    };
  }
}