import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductDto,
  SellProductDto,
} from './dto/products.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Product } from '../../entities/product.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';

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

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiResponse({
    status: 200,
    description: 'The product stock has been successfully updated.',
    type: GenericResponse<Product>,
  })
  @UseGuards(AuthGuard)
  async updateStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ): Promise<GenericResponse<Product>> {
    return this.productsService.updateStock(id, body.quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deleted.',
    type: GenericResponse<void>,
  })
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<GenericResponse<void>> {
    return this.productsService.remove(id);
  }

  @Post('sell')
  @ApiOperation({ summary: 'Sell a product' })
  @ApiResponse({
    status: 200,
    description: 'Product sold successfully.',
    type: GenericResponse<Product>,
  })
  @UseGuards(AuthGuard)
  async sellProduct(
    @Body() sellProductDto: SellProductDto,
  ): Promise<GenericResponse<Product>> {
    // This would typically involve more complex logic for selling products
    // For now, we'll just update the stock
    const quantity = -sellProductDto.quantity; // Negative to reduce stock
    return this.productsService.updateStock(sellProductDto.id, quantity);
  }
}
