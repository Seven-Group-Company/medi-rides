import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsHexColor,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category color (hex)', default: '#3B82F6' })
  @IsString()
  @IsOptional()
  @IsHexColor()
  color: string = '#3B82F6';

  @ApiProperty({ description: 'Category icon', default: 'Tag' })
  @IsString()
  @IsOptional()
  icon: string = 'Tag';

  @ApiProperty({ description: 'Whether documents in this category require renewal', default: true })
  @IsBoolean()
  @IsOptional()
  requiresRenewal: boolean = true;

  @ApiProperty({ description: 'Renewal period in days', default: 365 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(3650)
  renewalPeriodDays: number = 365;
}

export class UpdateCategoryDto extends CreateCategoryDto {}