import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DriverRidesService } from './driver-rides.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, RideStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AcceptRideDto, UpdateRideStatusDto } from './dto/driver-ride.dto';

@ApiTags('Driver Rides')
@Controller('driver/rides')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@ApiBearerAuth()
export class DriverRidesController {
  constructor(private readonly driverRidesService: DriverRidesService) {}

  @Get('assigned')
  @ApiOperation({ summary: 'Get assigned rides for current driver' })
  @ApiResponse({ status: 200, description: 'Assigned rides retrieved successfully' })
  async getAssignedRides(@CurrentUser('sub') driverId: number) {
    const rides = await this.driverRidesService.getAssignedRides(driverId);
    return {
      success: true,
      data: rides,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active rides for current driver' })
  @ApiResponse({ status: 200, description: 'Active rides retrieved successfully' })
  async getActiveRides(@CurrentUser('sub') driverId: number) {
    const rides = await this.driverRidesService.getActiveRides(driverId);
    return {
      success: true,
      data: rides,
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get ride history for current driver' })
  @ApiResponse({ status: 200, description: 'Ride history retrieved successfully' })
  async getRideHistory(@CurrentUser('sub') driverId: number) {
    const rides = await this.driverRidesService.getRideHistory(driverId);
    return {
      success: true,
      data: rides,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ride details' })
  @ApiResponse({ status: 200, description: 'Ride details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  async getRideDetails(
    @Param('id', ParseIntPipe) rideId: number,
    @CurrentUser('sub') driverId: number,
  ) {
    const ride = await this.driverRidesService.getRideDetails(rideId, driverId);
    return {
      success: true,
      data: ride,
    };
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an assigned ride' })
  @ApiResponse({ status: 200, description: 'Ride accepted successfully' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  @ApiResponse({ status: 400, description: 'Ride cannot be accepted' })
  async acceptRide(
    @Param('id', ParseIntPipe) rideId: number,
    @Body() acceptRideDto: AcceptRideDto,
    @CurrentUser('sub') driverId: number,
  ) {
    const ride = await this.driverRidesService.acceptRide(
      rideId,
      driverId,
      acceptRideDto,
    );
    return {
      success: true,
      message: 'Ride accepted successfully',
      data: ride,
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update ride status' })
  @ApiResponse({ status: 200, description: 'Ride status updated successfully' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateRideStatus(
    @Param('id', ParseIntPipe) rideId: number,
    @Body() updateRideStatusDto: UpdateRideStatusDto,
    @CurrentUser('sub') driverId: number,
  ) {
    const ride = await this.driverRidesService.updateRideStatus(
      rideId,
      driverId,
      updateRideStatusDto,
    );
    return {
      success: true,
      message: 'Ride status updated successfully',
      data: ride,
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a ride' })
  @ApiResponse({ status: 200, description: 'Ride completed successfully' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  @ApiResponse({ status: 400, description: 'Ride cannot be completed' })
  async completeRide(
    @Param('id', ParseIntPipe) rideId: number,
    @CurrentUser('sub') driverId: number,
    @Body() body: { actualDistance?: number; actualDuration?: number },
  ) {
    const ride = await this.driverRidesService.completeRide(
      rideId,
      driverId,
      body.actualDistance,
      body.actualDuration,
    );
    return {
      success: true,
      message: 'Ride completed successfully',
      data: ride,
    };
  }
}