import { 
  IsEmail, 
  IsString, 
  MinLength, 
  IsOptional, 
  IsDateString,
  IsBoolean,
  IsNumber,
  IsArray,
  ArrayMinSize,
  Matches
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({ example: 'driver@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Driver' })
  @IsString()
  @MinLength(2)
  name: string;

  // @ApiProperty({ example: 1 })
  // @IsNumber()
  // serviceCategoryId: number;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'SecurePass@123', description: 'Temporary password for driver' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @ApiProperty({ example: 'DL123456789' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  licenseState: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  licenseExpiry: string;

  @ApiProperty({ example: 'Vehicle info details', required: false })
  @IsOptional()
  @IsString()
  vehicleInfo?: string;

  @ApiProperty({ example: 'Insurance info details', required: false })
  @IsOptional()
  @IsString()
  insuranceInfo?: string;

  @ApiProperty({ example: [1, 2], description: 'Array of vehicle IDs to assign', required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  vehicleIds?: number[];

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateDriverDto {
  @ApiProperty({ example: 'John Driver', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'DL123456789', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ example: 'CA', required: false })
  @IsOptional()
  @IsString()
  licenseState?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @ApiProperty({ example: 'Vehicle info details', required: false })
  @IsOptional()
  @IsString()
  vehicleInfo?: string;

  @ApiProperty({ example: 'Insurance info details', required: false })
  @IsOptional()
  @IsString()
  insuranceInfo?: string;

  @ApiProperty({ example: [1, 2], description: 'Array of vehicle IDs to assign', required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  vehicleIds?: number[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class AssignVehiclesDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Array of vehicle IDs to assign' })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  vehicleIds: number[];
}

export class UpdateDriverStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({ example: 'On break', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}