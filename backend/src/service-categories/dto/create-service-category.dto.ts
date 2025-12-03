import { IsString, IsOptional, IsBoolean, IsNumber, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';

export class CreateServiceCategoryDto {
  @ApiProperty({ example: 'Medical Appointment' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'medical-appointment' })
  @IsString()
  value: string;

  @ApiProperty({ example: 'Doctor visits, hospital appointments', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Stethoscope', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 25.00, default: 15.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ example: 2.50, default: 1.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerMile?: number;

  @ApiProperty({ enum: ServiceType, default: ServiceType.GENERAL })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;
}

export class UpdateServiceCategoryDto {
  @ApiProperty({ example: 'Medical Appointment', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Doctor visits, hospital appointments', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Stethoscope', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 25.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ example: 2.50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerMile?: number;

  @ApiProperty({ enum: ServiceType, required: false })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;
}