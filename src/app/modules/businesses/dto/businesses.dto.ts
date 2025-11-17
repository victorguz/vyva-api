import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { Business } from '../../../schemas/business.schema';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Name of the business',
    example: 'My Business',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Slug of the business',
    example: 'my-business',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Tax ID of the business',
    example: '123456789',
    required: false,
  })
  @ValidateIf((o) => o.taxId !== '')
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    description: 'Address of the business',
    example: '123 Main St',
    required: false,
  })
  @ValidateIf((o) => o.address !== '')
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Phone number of the business',
    example: '+1234567890',
    required: false,
  })
  @ValidateIf((o) => o.phone !== '')
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Email of the business',
    example: 'business@example.com',
    required: false,
  })
  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Website of the business',
    example: 'https://example.com',
    required: false,
  })
  @ValidateIf((o) => o.website !== '')
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Logo URL of the business',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @ValidateIf((o) => o.logo !== '')
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    description: 'Description of the business',
    example: 'A great business description',
    required: false,
  })
  @ValidateIf((o) => o.description !== '')
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Slogan of the business',
    example: 'Your success is our mission',
    required: false,
  })
  @ValidateIf((o) => o.slogan !== '')
  @IsString()
  @IsOptional()
  slogan?: string;
}

export class UpdateBusinessDto {
  @ApiProperty({
    description: 'Name of the business',
    example: 'My Business',
    required: false,
  })
  @ValidateIf((o) => o.name !== '')
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Slug of the business',
    example: 'my-business',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Tax ID of the business',
    example: '123456789',
    required: false,
  })
  @ValidateIf((o) => o.taxId !== '')
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    description: 'Address of the business',
    example: '123 Main St',
    required: false,
  })
  @ValidateIf((o) => o.address !== '')
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Phone number of the business',
    example: '+1234567890',
    required: false,
  })
  @ValidateIf((o) => o.phone !== '')
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Email of the business',
    example: 'business@example.com',
    required: false,
  })
  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Website of the business',
    example: 'https://example.com',
    required: false,
  })
  @ValidateIf((o) => o.website !== '')
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Logo URL of the business',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @ValidateIf((o) => o.logo !== '')
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    description: 'Description of the business',
    example: 'A great business description',
    required: false,
  })
  @ValidateIf((o) => o.description !== '')
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Slogan of the business',
    example: 'Your success is our mission',
    required: false,
  })
  @ValidateIf((o) => o.slogan !== '')
  @IsString()
  @IsOptional()
  slogan?: string;
}

