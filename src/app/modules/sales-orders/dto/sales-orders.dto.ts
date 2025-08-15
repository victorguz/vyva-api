import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { PaymentMethodType } from '../../../core/constants/domain.constants';
import { SalesOrderItem } from '../../../entities/sales-order.entity';

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
  paymentMethod: PaymentMethodType;
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
