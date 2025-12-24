import { Controller, Get, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RidesService } from '../rides/rides.service';
import { CreateGuestRideDto } from '../rides/dto/create-guest-ride.dto';
import { SkipAuth } from '../common/decorators/skip-auth.decorator';

@ApiTags('public')
@Controller('public')
@SkipAuth()
export class PublicController {
  constructor(private readonly ridesService: RidesService) {}

  @Post('rides/guest')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new ride booking as guest' })
  @ApiResponse({ 
    status: 201, 
    description: 'Guest ride booking created successfully' 
  })
  async createGuestRide(@Body() createGuestRideDto: CreateGuestRideDto) {
    const ride = await this.ridesService.createGuestRide(createGuestRideDto);
    
    return {
      success: true,
      message: 'Ride booking created successfully',
      data: ride
    };
  }

@Get('rides/check-availability')
@ApiOperation({ summary: 'Check if a date/time is available for booking' })
@ApiResponse({ 
  status: 200, 
  description: 'Availability check completed' 
})
async checkAvailability(
  @Query('phone') phone: string,
  @Query('date') date: string,
  @Query('time') time: string
) {
  const availability = await this.ridesService.checkDateAvailability(phone, date, time);
  
  return {
    success: true,
    data: availability
  };
}

@Get('rides/existing-bookings')
@ApiOperation({ summary: 'Get existing bookings for a phone number and service category' })
@ApiResponse({ 
  status: 200, 
  description: 'Existing bookings retrieved successfully' 
})
async getExistingBookings(
  @Query('phone') phone: string,
  @Query('serviceCategoryId') serviceCategoryId: number
) {
  const bookings = await this.ridesService.getExistingBookings(phone, serviceCategoryId);
  
  return {
    success: true,
    data: bookings
  };
}

  @Get('service-categories')
  @ApiOperation({ summary: 'Get all active service categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service categories retrieved successfully' 
  })
  async getServiceCategories() {
    const categories = await this.ridesService.getServiceCategories();
    
    return {
      success: true,
      data: categories
    };
  }
}