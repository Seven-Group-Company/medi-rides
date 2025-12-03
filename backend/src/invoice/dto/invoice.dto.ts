import { 
  IsString, 
  IsNumber, 
  IsDate, 
  IsEnum, 
  IsOptional,
  IsNotEmpty,
  Min,
  IsDecimal 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Ride ID' })
  @IsNumber()
  @IsNotEmpty()
  rideId: number;

  @ApiProperty({ description: 'Invoice amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Tax amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ description: 'Due date' })
  @IsDate()
  dueDate: Date;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @ApiProperty({ description: 'Invoice status', enum: InvoiceStatus, required: false })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({ description: 'PDF URL', required: false })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class InvoiceResponse {
  id: number;
  invoiceNumber: string;
  rideId: number;
  amount: number;
  tax: number;
  totalAmount: number;
  dueDate: Date;
  issuedDate: Date;
  status: InvoiceStatus;
  pdfUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  ride?: {
    id: number;
    passengerName: string;
    pickupAddress: string;
    dropoffAddress: string;
    date: Date;
    time: string;
  };
}