import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

import { IntegrationType } from '../../../schemas/integration.schema';

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Integration type', enum: IntegrationType })
  @IsEnum(IntegrationType)
  @IsNotEmpty()
  type: IntegrationType;

  @ApiProperty({ description: 'Integration data (will be encrypted)', type: Object })
  @IsObject()
  @IsNotEmpty()
  data: any;
}

export class UpdateIntegrationDto {
  @ApiProperty({ description: 'Integration data (will be encrypted)', type: Object, required: false })
  @IsObject()
  @IsOptional()
  data?: any;

  @ApiProperty({ description: 'Whether the integration is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ListIntegrationDto {
  @ApiProperty({ description: 'Filter by integration type', enum: IntegrationType, required: false })
  @IsEnum(IntegrationType)
  @IsOptional()
  type?: IntegrationType;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}

