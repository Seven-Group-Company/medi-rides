import { 
  IsString, 
  IsEnum, 
  IsDateString, 
  IsOptional, 
  IsNumber, 
  Min, 
  IsNotEmpty 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRideDto {
  @ApiProperty({ description: 'Pickup location address' })
  @IsString()
  @IsNotEmpty()
  pickup: string;

  @ApiProperty({ description: 'Drop-off location address' })
  @IsString()
  @IsNotEmpty()
  dropoff: string;

  @ApiProperty({ description: 'Type of service' })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty({ description: 'Service category ID' })
  @IsNumber()
  serviceCategoryId: number;

  @ApiProperty({ description: 'Ride date in YYYY-MM-DD format' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Ride time in HH:MM format' })
  @IsString()
  time: string;

  @ApiProperty({ description: 'Estimated price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedPrice?: number;

  @ApiProperty({ 
  description: 'Type of service',
  enum: ['medical-transport', 'wheelchair-service', 'errands', 'airport-shuttle', 'other']
})

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Distance in kilometers', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @ApiProperty({ description: 'Estimated time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedTime?: number;

  @ApiProperty({ description: 'Payment type' })
  @IsEnum(['private', 'waiver'])
  paymentType: 'private' | 'waiver';
}