import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDomainDto {
  @ApiProperty({
    description: 'Name of the domain',
    example: 'Payment Method',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Group/category of the domain',
    example: 'finance',
    required: false,
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({
    description: 'Value of the domain',
    example: 'cash',
    required: false,
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({
    description: 'Description of the domain',
    example: 'Cash payment method',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'Whether the domain is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDomainDto extends PartialType(CreateDomainDto) {}

export class ListDomainDto {
  @ApiProperty({
    description: 'Group to filter domains',
    required: false,
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

