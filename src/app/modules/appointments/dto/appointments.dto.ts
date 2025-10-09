import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AppointmentStatus } from '../../../core/constants/domain.constants';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Appointment start date and time' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Appointment end date and time' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ description: 'Service ID' })
  @IsString()
  @IsNotEmpty()
  idService: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  idCustomer: string;

  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  @IsNotEmpty()
  idEmployee: string;

  @ApiProperty({ description: 'Order ID' })
  @IsString()
  @IsNotEmpty()
  idOrder: string;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    default: AppointmentStatus.pending,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
}

export class UpdateAppointmentDto {
  @ApiProperty({ description: 'Appointment start date and time' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Appointment end date and time' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Service ID' })
  @IsString()
  @IsOptional()
  idService?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsOptional()
  idCustomer?: string;

  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  @IsOptional()
  idEmployee?: string;

  @ApiProperty({ description: 'Order ID' })
  @IsString()
  @IsOptional()
  idOrder?: string;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({ description: 'Modified by user ID' })
  @IsString()
  @IsOptional()
  modifiedBy?: string;
}

export class ListAppointmentDto {
  @ApiProperty({ description: 'Customer ID filter' })
  @IsString()
  @IsOptional()
  idCustomer?: string;

  @ApiProperty({ description: 'Employee ID filter' })
  @IsString()
  @IsOptional()
  idEmployee?: string;

  @ApiProperty({ description: 'Service ID filter' })
  @IsString()
  @IsOptional()
  idService?: string;

  @ApiProperty({ description: 'Order ID filter' })
  @IsString()
  @IsOptional()
  idOrder?: string;

  @ApiProperty({
    description: 'Status filter',
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({ description: 'Start date filter (ISO 8601 format)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date filter (ISO 8601 format)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'New appointment status',
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;

  @ApiProperty({ description: 'Modified by user ID' })
  @IsString()
  @IsOptional()
  modifiedBy?: string;
}
