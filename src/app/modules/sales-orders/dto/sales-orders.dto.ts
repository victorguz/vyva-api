import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PaymentMethodType } from '../../../core/constants/domain.constants';
import { SalesOrderItem } from '../../../entities/sales-order.entity';
import { DashboardSingleCardItem } from '../../../interfaces/dashboard.interface';

export class SalesOrderItemDto implements SalesOrderItem {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty({ description: 'Product quantity' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Product is subscription' })
  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Product offer price' })
  @IsNumber()
  @IsOptional()
  offerPrice?: number;
}

export class SalesOrderPaymentMethodDto {
  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({ description: 'Payment method type', enum: PaymentMethodType })
  @IsString()
  @IsNotEmpty()
  type: PaymentMethodType;
}

export class CreateSalesOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsOptional()
  idCustomer?: string;

  @ApiProperty({ description: 'Products to sell', type: [SalesOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  @IsNotEmpty()
  products: SalesOrderItemDto[];

  @ApiProperty({
    description: 'Payment methods',
    type: [SalesOrderPaymentMethodDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderPaymentMethodDto)
  @IsNotEmpty()
  paymentMethods: SalesOrderPaymentMethodDto[];
}

export class UpdateSalesOrderDto {
  @ApiProperty({ description: 'Order status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Modified by user ID' })
  @IsString()
  @IsOptional()
  modifiedBy?: string;
}

export class ListSalesOrderDto {
  @ApiProperty({ description: 'Order number' })
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsOptional()
  idCustomer?: string;

  @ApiProperty({ description: 'Business info ID' })
  @IsString()
  @IsOptional()
  businessInfoId?: string;
}

export class DateRangeReportDto {
  @ApiProperty({
    description: 'Start date for the report (ISO 8601 format)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date for the report (ISO 8601 format)',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class SalesReportResponseDto implements DashboardSingleCardItem {
  @ApiProperty({ description: 'Report title' })
  title: string;

  @ApiProperty({ description: 'Report description' })
  description: string;

  @ApiProperty({ description: 'Current period value' })
  currentValue: number;

  @ApiProperty({ description: 'Previous period value' })
  lastValue: number;

  @ApiProperty({ description: 'Whether the value represents currency' })
  isCurrency: boolean;

  @ApiProperty({ description: 'Report frequency' })
  frequency: string;
}

export class PaymentMethodSummaryDto {
  @ApiProperty({ description: 'Payment method type' })
  paymentMethod: string;

  @ApiProperty({ description: 'Total amount for this payment method' })
  totalAmount: number;

  @ApiProperty({ description: 'Number of transactions' })
  transactionCount: number;

  @ApiProperty({ description: 'Percentage of total sales' })
  percentage: number;
}

export class DailyPaymentMethodsResponseDto {
  @ApiProperty({ description: 'Date of the report' })
  date: string;

  @ApiProperty({ description: 'Total daily sales amount' })
  totalDailySales: number;

  @ApiProperty({
    description: 'Payment methods breakdown',
    type: [PaymentMethodSummaryDto],
  })
  paymentMethods: PaymentMethodSummaryDto[];

  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;
}
