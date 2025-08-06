import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsIn,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MeasurementUnits,
  ProductStatus,
} from '../../../core/constants/domain.constants';
import { Product } from '../../../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Premium Gym Membership',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Image URL of the product',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string | null = null;

  @ApiProperty({
    description: 'Description of the product',
    example: 'Access to all gym facilities for the specified period',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Measure/quantity of the product',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  measure!: number;

  @ApiProperty({
    description: 'Commission percentage',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  commissions?: number;

  @ApiProperty({
    description: 'Unit of measurement',
    enum: MeasurementUnits,
    default: MeasurementUnits.und,
  })
  @IsIn(Object.values(MeasurementUnits))
  unit: MeasurementUnits = MeasurementUnits.und;

  @ApiProperty({
    description: 'SKU (Stock Keeping Unit)',
    example: 'GYM-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    default: ProductStatus.draft,
    required: false,
  })
  @IsIn(Object.values(ProductStatus))
  @IsOptional()
  status?: ProductStatus = ProductStatus.draft;

  @ApiProperty({
    description: 'Whether the product is a subscription',
    example: true,
  })
  @IsBoolean()
  isSubscription!: boolean;

  @ApiProperty({
    description: 'Number of days for subscription',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  subscriptionDays?: number;

  @ApiProperty({
    description: 'Whether the product requires stock management',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requireStock?: boolean = false;

  @ApiProperty({
    description: 'Price of the product',
    example: 99.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Offer price of the product',
    example: 79.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  offerPrice?: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stock?: number = 0;

  @ApiProperty({
    description: 'Business Info ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  businessInfoId!: string;

  @ApiProperty({
    description: 'User ID who created the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}

export class UpdateProductDto implements Partial<CreateProductDto> {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Premium Gym Membership',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Image URL of the product',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'Access to all gym facilities for the specified period',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Measure/quantity of the product',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  measure?: number;

  @ApiProperty({
    description: 'Commission percentage',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  commissions?: number;

  @ApiProperty({
    description: 'Unit of measurement',
    enum: MeasurementUnits,
    required: false,
  })
  @IsIn(Object.values(MeasurementUnits))
  @IsOptional()
  unit?: MeasurementUnits;

  @ApiProperty({
    description: 'SKU (Stock Keeping Unit)',
    example: 'GYM-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    required: false,
  })
  @IsIn(Object.values(ProductStatus))
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({
    description: 'Whether the product is a subscription',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @ApiProperty({
    description: 'Number of days for subscription',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  subscriptionDays?: number;

  @ApiProperty({
    description: 'Whether the product requires stock management',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requireStock?: boolean;


  @ApiProperty({
    description: 'Price of the product',
    example: 99.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Offer price of the product',
    example: 79.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  offerPrice?: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Business Info ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  businessInfoId?: string;

  @ApiProperty({
    description: 'User ID who modified the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  modifiedBy?: string;
}

export class FindProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id!: string;
}

export class ListProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Gym Membership',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'SKU (Stock Keeping Unit)',
    example: 'GYM-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Whether the product is a subscription',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @ApiProperty({
    description: 'Whether the product requires stock management',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requireStock?: boolean;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    required: false,
  })
  @IsIn(Object.values(ProductStatus))
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({
    description: 'User ID who created the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @ApiProperty({
    description: 'User ID who modified the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  modifiedBy?: string;

  @ApiProperty({
    description: 'Business Info ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  businessInfoId?: string;
}

export class SellProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: 'Price ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  idPrice!: number;

  @ApiProperty({
    description: 'Quantity to sell',
    example: 2,
  })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    description: 'Whether the product is a subscription',
    example: true,
  })
  @IsBoolean()
  isSubscription!: boolean;

  @ApiProperty({
    description: 'Whether the product requires stock management',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requireStock?: boolean;
}

export class ProductResponseDto implements Product {
  id: string;
  name: string;
  image?: string | null;
  description?: string;
  measure: number;
  commissions?: number;
  unit: MeasurementUnits;
  sku?: string;
  status: ProductStatus;
  isSubscription: boolean;
  subscriptionDays?: number;
  requireStock?: boolean;
  price?: number;
  offerPrice?: number;
  stock?: number;
  businessInfoId: string;
  createdBy?: string;
  modifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FindProductResponseDto extends ProductResponseDto {
  @ApiProperty({
    description: 'Quantity',
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Price ID',
    example: 1,
  })
  idPrice!: number;

  @ApiProperty({
    description: 'Price',
    example: 99.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Discount percentage',
    example: 10,
    required: false,
  })
  discount?: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
  })
  stock!: number;

  @ApiProperty({
    description: 'Whether price was updated',
    example: false,
    required: false,
  })
  priceUpdated?: boolean;
}
