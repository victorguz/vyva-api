import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { deleteEmptyProperties } from 'src/app/shared/shared.functions';
import { v4 as uuidv4 } from 'uuid';

import { ProductStatus } from '../../core/constants/domain.constants';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Product, ProductKey } from '../../schemas/product.schema';
import { handleError } from '../../shared/error.functions';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product')
    private readonly model: Model<Product, ProductKey>,
  ) {}

  async findOne(id: string): Promise<GenericResponse<Product>> {
    try {
      const product = await this.model.get({ id });
      if (!product) {
        throw new Error('MS007');
      }
      return new GenericResponse(product.toJSON() as Product);
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(body: CreateProductDto): Promise<GenericResponse<Product>> {
    try {
      // Check for duplicate SKU if provided
      if (body.sku && body.sku.trim() !== '') {
        const existingSku = await this.model
          .scan()
          .where('sku')
          .eq(body.sku)
          .exec();

        if (existingSku && existingSku.length > 0) {
          throw new Error('MS041');
        }
      }

      const newProduct = await this.model.create({
        id: uuidv4(),
        name: body.name,
        image: body.image || undefined,
        description: body.description ?? '',
        measure: body.measure,
        commissions: body.commissions || undefined,
        unit: body.unit,
        sku: body.sku || undefined,
        status: body.status,
        isSubscription: body.isSubscription,
        subscriptionDays: body.subscriptionDays || undefined,
        requireStock: body.requireStock,
        price: body.price || undefined,
        offerPrice: body.offerPrice || undefined,
        stock: body.stock || undefined,
        businessInfoId: body.businessInfoId,
        createdBy: body.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return new GenericResponse(newProduct.toJSON() as Product);
    } catch (error) {
      console.log(error);
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<GenericResponse<Product>> {
    try {
      // Clean the DTO first to remove undefined/null values
      const cleanedDto = deleteEmptyProperties(updateProductDto);

      // Check for duplicate SKU if being updated
      if (cleanedDto.sku && cleanedDto.sku.trim() !== '') {
        const existingSku = await this.model
          .scan()
          .where('sku')
          .eq(cleanedDto.sku)
          .exec();

        if (existingSku && existingSku.length > 0) {
          const existingProduct = existingSku[0];
          if (existingProduct.id !== id) {
            throw new Error('MS041');
          }
        }
      }

      await this.model.update({ id }, cleanedDto);
      const updatedProduct = await this.model.get({ id });
      if (!updatedProduct) {
        throw new Error('MS007');
      }
      return new GenericResponse(updatedProduct.toJSON() as Product);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string): Promise<GenericResponse<void>> {
    try {
      const product = await this.model.get({ id });
      if (!product) {
        throw new Error('MS007');
      }
      await this.model.update({ id }, { status: ProductStatus.deleted });
      return new GenericResponse(undefined);
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateStock(
    id: string,
    quantity: number,
  ): Promise<GenericResponse<Product>> {
    try {
      const product = await this.model.get({ id });
      if (!product) {
        throw new Error('MS007');
      }

      const currentStock = product.stock || 0;
      const newStock = Math.max(0, currentStock + quantity);

      const updatedProduct = await this.model.update(
        { id },
        { stock: newStock },
      );

      return new GenericResponse(updatedProduct.toJSON() as Product);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findAll(businessInfoId: string): Promise<GenericResponse<Product[]>> {
    try {
      const products = await this.model
        .scan()
        .where('businessInfoId')
        .eq(businessInfoId)
        .exec();

      return new GenericResponse(
        products.map((product) => product.toJSON() as Product),
      );
    } catch (error) {
      throw handleError(error);
    }
  }
}
