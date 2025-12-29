import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsBoolean,
  IsDateString,
  Min,
  Max,
  IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Vehicle make' })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty({ description: 'Vehicle model' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Vehicle year' })
  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ description: 'Vehicle color' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ description: 'License plate number' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({ description: 'Vehicle Identification Number (optional)' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiProperty({ enum: VehicleType, description: 'Vehicle type' })
  @IsEnum(VehicleType)
  type: VehicleType; // Change from vehicleType to type to match Prisma

  @ApiProperty({ description: 'Passenger capacity' })
  @IsNumber()
  @Min(1)
  @Max(20)
  capacity: number;

  @ApiProperty({ description: 'Wheelchair accessibility' })
  @IsBoolean()
  hasWheelchairAccess: boolean;

  @ApiProperty({ description: 'Oxygen support capability' })
  @IsBoolean()
  hasOxygenSupport: boolean;

  @ApiProperty({ description: 'Insurance expiry date' })
  @IsDateString({}, { message: 'Insurance expiry must be a valid date' })
  @Transform(({ value }) => {
    if (!value) return value;
    // Convert YYYY-MM-DD to ISO string
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(value + 'T00:00:00.000Z').toISOString();
    }
    return value;
  })
  insuranceExpiry: string;
  @ApiProperty({ description: 'Registration expiry date' })
  @IsDateString()
  registrationExpiry: string;

@ApiProperty({ description: 'Liability insurance expiry date' })
@IsDateString({}, { message: 'Liability insurance expiry must be a valid date' })
@Transform(({ value }) => {
  if (!value) return value;
  // Convert YYYY-MM-DD to ISO string
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + 'T00:00:00.000Z').toISOString();
  }
  return value;
})
liabilityInsuranceExpiry: string;

  @ApiProperty({ description: 'Vehicle images (optional)', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateVehicleDto {
  @ApiProperty({ description: 'Vehicle make', required: false })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiProperty({ description: 'Vehicle model', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Vehicle year', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiProperty({ description: 'Vehicle color', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'License plate number', required: false })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiProperty({ description: 'Vehicle Identification Number', required: false })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiProperty({ enum: VehicleType, description: 'Vehicle type', required: false })
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType; // Change from vehicleType to type

  @ApiProperty({ description: 'Passenger capacity', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  capacity?: number;

  @ApiProperty({ description: 'Wheelchair accessibility', required: false })
  @IsOptional()
  @IsBoolean()
  hasWheelchairAccess?: boolean;

  @ApiProperty({ description: 'Oxygen support capability', required: false })
  @IsOptional()
  @IsBoolean()
  hasOxygenSupport?: boolean;

  @ApiProperty({ description: 'Insurance expiry date', required: false })
  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @ApiProperty({ description: 'Registration expiry date', required: false })
  @IsOptional()
  @IsDateString()
  registrationExpiry?: string;

  @ApiProperty({ description: 'Liability insurance expiry date', required: false })
  @IsOptional()
  @IsDateString()
  liabilityInsuranceExpiry?: string;

  @ApiProperty({ description: 'Vehicle status', required: false })
  @IsOptional()
  @IsString()
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

  @ApiProperty({ description: 'Vehicle images', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}