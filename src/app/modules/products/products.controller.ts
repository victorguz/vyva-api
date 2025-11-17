import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/app/schemas/user.schema';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Product } from '../../schemas/product.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BusinessIdGuard } from '../auth/guards/businessId.guard';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('public/business/:businessId')
  @ApiOperation({ summary: 'Get all products by business ID (public)' })
  @ApiResponse({
    status: 200,
    description: 'Return all products for a business.',
    type: GenericResponse<[Product]>,
  })
  async findAllPublic(
    @Param('businessId') businessId: string,
  ): Promise<GenericResponse<Product[]>> {
    return this.productsService.findAllPublic(businessId);
  }

  @Post()
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    type: GenericResponse<Product>,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Product>> {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Return all products.',
    type: GenericResponse<[Product]>,
  })
  async findAll(
    @CurrentUser() user?: User,
  ): Promise<GenericResponse<Product[]>> {
    return this.productsService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the product.',
    type: GenericResponse<Product>,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Product>> {
    return this.productsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, BusinessIdGuard)
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
    type: GenericResponse<Product>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Product>> {
    return this.productsService.update(id, updateProductDto, user);
  }
}
