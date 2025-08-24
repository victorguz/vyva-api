import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/app/schemas/user.schema';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Product } from '../../schemas/product.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    type: GenericResponse<Product>,
  })
  @UseGuards(AuthGuard)
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<GenericResponse<Product>> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Return all products.',
    type: GenericResponse<[Product]>,
  })
  @UseGuards(AuthGuard)
  async findAll(
    @CurrentUser() user?: User,
  ): Promise<GenericResponse<Product[]>> {
    return this.productsService.findAll(user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the product.',
    type: GenericResponse<Product>,
  })
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string): Promise<GenericResponse<Product>> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
    type: GenericResponse<Product>,
  })
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<GenericResponse<Product>> {
    return this.productsService.update(id, updateProductDto);
  }
}
