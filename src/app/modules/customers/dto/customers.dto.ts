import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { maxEmailLength } from '../../../core/constants/generic.constants';
import { Customer } from '../../../schemas/customer.schema';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'First name of the customer',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the customer',
    example: 'Doe',
    required: false,
  })
  @ValidateIf((o) => o.lastName !== '')
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Email of the customer',
    example: 'john.doe@example.com',
    required: false,
  })
  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Document type of the customer',
    example: 'DNI',
  })
  @ValidateIf((o) => o.documentType !== '')
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty({
    description: 'Document number of the customer',
    example: '12345678',
  })
  @ValidateIf((o) => o.documentNumber !== '')
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiProperty({
    description: 'Phone number of the customer',
    example: '+1234567890',
    required: false,
  })
  @ValidateIf((o) => o.phone !== '')
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St',
    required: false,
  })
  @ValidateIf((o) => o.address !== '')
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'City of the customer',
    example: 'New York',
    required: false,
  })
  @ValidateIf((o) => o.city !== '')
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Type of person (natural or legal)',
    example: 'natural',
    required: false,
    default: 'natural',
  })
  @ValidateIf((o) => o.typePerson !== '')
  @IsString()
  @IsOptional()
  typePerson?: string = 'natural';

  @ApiProperty({
    description: 'Gender of the customer',
    required: false,
  })
  @ValidateIf((o) => o.gender !== '')
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '2020-07-10 15:00:00.000',
    required: false,
  })
  @ValidateIf((o) => o.dateOfBirth !== '')
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Country of the customer',
    required: false,
  })
  @ValidateIf((o) => o.country !== '')
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Status of the customer',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;

  @ApiProperty({
    description: 'Role of the customer',
    default: 'customer',
    required: false,
  })
  @ValidateIf((o) => o.role !== '')
  @IsString()
  @IsOptional()
  role?: string = 'customer';

  @ApiProperty({
    description: 'Profile picture URL of the customer',
    example: 'https://lh3.googleusercontent.com/a/profile-picture-url',
    required: false,
  })
  @ValidateIf((o) => o.profilePicture !== '')
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    description: 'User ID',
    example: 'b9c0e5c0-5c9b-11eb-ae93-0242ac130002',
    required: false,
  })
  @ValidateIf((o) => o.userId !== '')
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Business ID (automatically set to current user)',
    example: 'b9c0e5c0-5c9b-11eb-ae93-0242ac130002',
    required: false,
  })
  @ValidateIf((o) => o.businessId !== '')
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiProperty({
    description: 'Additional data',
    required: false,
  })
  @IsObject()
  @IsOptional()
  data?: any;
}

export class UpdateCustomerDto {
  @ApiProperty({
    description: 'First name of the customer',
    example: 'John',
    required: false,
  })
  @ValidateIf((o) => o.firstName !== '')
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the customer',
    example: 'Doe',
    required: false,
  })
  @ValidateIf((o) => o.lastName !== '')
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Email of the customer',
    example: 'john.doe@example.com',
    required: false,
  })
  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Document type of the customer',
    example: 'DNI',
    required: false,
  })
  @ValidateIf((o) => o.documentType !== '')
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty({
    description: 'Document number of the customer',
    example: '12345678',
    required: false,
  })
  @ValidateIf((o) => o.documentNumber !== '')
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiProperty({
    description: 'Phone number of the customer',
    example: '+1234567890',
    required: false,
  })
  @ValidateIf((o) => o.phone !== '')
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'City of the customer',
    example: 'New York',
    required: false,
  })
  @ValidateIf((o) => o.city !== '')
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St',
    required: false,
  })
  @ValidateIf((o) => o.address !== '')
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Country of the customer',
    example: 'USA',
    required: false,
  })
  @ValidateIf((o) => o.country !== '')
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Type of person (natural or legal)',
    example: 'natural',
    required: false,
  })
  @ValidateIf((o) => o.typePerson !== '')
  @IsString()
  @IsOptional()
  typePerson?: string;

  @ApiProperty({
    description: 'Status of the customer',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    description: 'Role of the customer',
    example: 'customer',
    required: false,
  })
  @ValidateIf((o) => o.role !== '')
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'Gender of the customer',
    required: false,
  })
  @ValidateIf((o) => o.gender !== '')
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '2020-07-10 15:00:00.000',
    required: false,
  })
  @ValidateIf((o) => o.dateOfBirth !== '')
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'User ID',
    example: 'b9c0e5c0-5c9b-11eb-ae93-0242ac130002',
    required: false,
  })
  @ValidateIf((o) => o.userId !== '')
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Profile picture URL of the customer',
    example: 'https://lh3.googleusercontent.com/a/profile-picture-url',
    required: false,
  })
  @ValidateIf((o) => o.profilePicture !== '')
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    description: 'Business ID (cannot be updated)',
    example: 'b9c0e5c0-5c9b-11eb-ae93-0242ac130002',
    required: false,
  })
  @ValidateIf((o) => o.businessId !== '')
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiProperty({
    description: 'Additional data',
    required: false,
  })
  @IsObject()
  @IsOptional()
  data?: any;
}

export class FindOneCustomerDto {
  @ValidateIf((o) => o.id !== '')
  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiProperty()
  id?: string;

  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @MaxLength(maxEmailLength)
  @IsOptional()
  @ApiProperty()
  email?: string;
}

export class CustomerResponseDto implements Customer {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  role?: string;
  status?: boolean;
  typePerson?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  profilePicture?: string;
  userId?: string;
  businessId: string;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class CustomersCountResponseDto {
  @ApiProperty({ description: 'Total number of registered customers' })
  totalCustomers: number;

  @ApiProperty({ description: 'Number of customers registered today' })
  customersRegisteredToday: number;
}
