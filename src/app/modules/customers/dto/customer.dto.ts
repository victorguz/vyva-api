import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Company user ID' })
  @IsUUID()
  @IsNotEmpty()
  companyUserId: string;

  @ApiProperty({ description: 'Customer user ID' })
  @IsUUID()
  @IsNotEmpty()
  customerUserId: string;

  @ApiProperty({ description: 'Customer full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Customer phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer document type (ID, passport, etc.)',
  })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiPropertyOptional({ description: 'Customer document number' })
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Notes about the customer' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Status of the customer (active/inactive)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    description: 'Additional notes about the customer',
    example: 'Customer updated preferences',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
    type: Object,
  })
  @IsOptional()
  metadata?: any;
}

// DTO for customer with user details
export class CustomerWithUserDto {
  @ApiProperty({ description: 'Customer ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Document type' })
  documentType?: string;

  @ApiPropertyOptional({ description: 'Document number' })
  documentNumber?: string;

  @ApiProperty({ description: 'Active status' })
  status: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Created date' })
  createdAt?: Date;
}

export class FindCustomerDto {
  @ApiPropertyOptional({ description: 'Business slug to find customers by' })
  @IsString()
  @IsOptional()
  businessSlug?: string;
}
