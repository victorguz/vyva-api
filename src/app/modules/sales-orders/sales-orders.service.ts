import { Injectable } from '@nestjs/common';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { SalesOrderStatus } from 'src/app/core/constants/domain.constants';
import { User } from 'src/app/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Product, ProductKey } from '../../schemas/product.schema';
import { SalesOrder, SalesOrderKey } from '../../schemas/sales-order.schema';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties } from '../../shared/shared.functions';
import { CreateSalesOrderDto, ListSalesOrderDto, UpdateSalesOrderDto } from './dto/sales-orders.dto';

@Injectable()
export class SalesOrdersService extends TransactionSupport {
  constructor(
    @InjectModel('SalesOrder')
    private readonly model: Model<SalesOrder, SalesOrderKey>,
    @InjectModel('Product')
    private readonly productModel: Model<Product, ProductKey>,
  ) {
    super();
  }

  async create(
    body: CreateSalesOrderDto,
    user: User,
  ): Promise<GenericResponse<SalesOrder>> {
    try {
      // Generate unique order number
      const orderNumber = this.generateOrderNumber();

      // Fetch products from database to get accurate prices and stock info
      const productDetails = await this.fetchProductDetails(
        body.products,
        user.businessInfoId || user.id,
      );

      // Calculate total amount from database product prices
      const totalAmount = this.calculateTotalAmountFromProducts(
        body.products,
        productDetails,
      );

      // Validate stock availability for products that require stock
      this.validateStockAvailability(body.products, productDetails);
      const salesOrder = {
        id: uuidv4(),
        orderNumber,
        idCustomer: body.idCustomer,
        products: body.products,
        paymentMethods: body.paymentMethods,
        totalAmount,
        status: SalesOrderStatus.pending,
        businessInfoId: user.businessInfoId || user.id,
        createdBy: user.id,
        createdAt: new Date(),
      };
      // Create sales order using Dynamoose
      const newSalesOrder = this.model.transaction.create({
        ...salesOrder,
      });

      // Update product stock for products that require stock management
      const stockUpdates = [];
      for (const orderProduct of body.products) {
        const product = productDetails.get(orderProduct.id);
        if (product && product.requireStock) {
          const newStock = Math.max(
            0,
            (product.stock ?? 0) - orderProduct.quantity,
          );
          stockUpdates.push(
            this.productModel.transaction.update(
              { id: orderProduct.id },
              {
                stock: newStock,
              },
            ),
          );
        }
      }

      await this.transaction([newSalesOrder, ...stockUpdates]);

      const salesOrderResult = await this.model.get({ id: salesOrder.id });
      // Return the created sales order
      return new GenericResponse(salesOrderResult);
    } catch (error) {
      console.log(error);
      throw handleError(error);
    }
  }

  async findAll(
    filters?: ListSalesOrderDto,
  ): Promise<GenericResponse<SalesOrder[]>> {
    try {
      let query = this.model.scan();

      if (filters?.orderNumber) {
        query = query.where('orderNumber').eq(filters.orderNumber);
      }

      if (filters?.idCustomer) {
        query = query.where('idCustomer').eq(filters.idCustomer);
      }

      if (filters?.businessInfoId) {
        query = query.where('businessInfoId').eq(filters.businessInfoId);
      }

      const salesOrders = await query.exec();
      return new GenericResponse(
        salesOrders.map((order) => order as SalesOrder),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string): Promise<GenericResponse<SalesOrder>> {
    try {
      const salesOrder = await this.model.get({ id });
      if (!salesOrder) {
        throw new Error('MS007');
      }
      return new GenericResponse(salesOrder as SalesOrder);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findByOrderNumber(
    orderNumber: string,
  ): Promise<GenericResponse<SalesOrder>> {
    try {
      const salesOrders = await this.model
        .scan()
        .where('orderNumber')
        .eq(orderNumber)
        .exec();

      if (!salesOrders || salesOrders.length === 0) {
        throw new Error('MS007');
      }

      return new GenericResponse(salesOrders[0] as SalesOrder);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateSalesOrderDto: UpdateSalesOrderDto,
  ): Promise<GenericResponse<SalesOrder>> {
    try {
      // Clean the DTO first to remove undefined/null values
      const cleanedDto = deleteEmptyProperties(updateSalesOrderDto);

      await this.model.update({ id }, cleanedDto);
      const updatedSalesOrder = await this.model.get({ id });

      if (!updatedSalesOrder) {
        throw new Error('MS007');
      }

      return new GenericResponse(updatedSalesOrder as SalesOrder);
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateStatus(
    id: string,
    status: string,
    modifiedBy?: string,
  ): Promise<GenericResponse<SalesOrder>> {
    try {
      const updateData: any = { status };

      if (modifiedBy) {
        updateData.modifiedBy = modifiedBy;
      }

      await this.model.update({ id }, updateData);
      const updatedSalesOrder = await this.model.get({ id });

      if (!updatedSalesOrder) {
        throw new Error('MS007');
      }

      return new GenericResponse(updatedSalesOrder as SalesOrder);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string): Promise<GenericResponse<boolean>> {
    try {
      await this.model.delete({ id });
      return new GenericResponse(true);
    } catch (error) {
      throw handleError(error);
    }
  }

  private async fetchProductDetails(
    products: any[],
    businessInfoId: string,
  ): Promise<Map<string, Product>> {
    const productMap = new Map<string, Product>();

    for (const product of products) {
      try {
        const productDetail = await this.productModel.get({ id: product.id });
        if (!productDetail) {
          throw new Error(`Product with ID ${product.id} not found`);
        }

        const productData = productDetail.toJSON() as Product;

        // Verify product belongs to the same business
        if (productData.businessInfoId !== businessInfoId) {
          throw new Error(
            `Product ${product.id} does not belong to your business`,
          );
        }

        productMap.set(product.id, productData);
      } catch (error) {
        throw new Error(
          `Failed to fetch product ${product.id}: ${error.message}`,
        );
      }
    }

    return productMap;
  }

  private calculateTotalAmountFromProducts(
    orderProducts: any[],
    productDetails: Map<string, Product>,
  ): number {
    return orderProducts.reduce((total, orderProduct) => {
      const product = productDetails.get(orderProduct.id);
      if (!product) {
        throw new Error(
          `Product ${orderProduct.id} not found in product details`,
        );
      }

      const price = product.offerPrice ?? product.price ?? 0;
      return total + price * orderProduct.quantity;
    }, 0);
  }

  private validateStockAvailability(
    orderProducts: any[],
    productDetails: Map<string, Product>,
  ): void {
    for (const orderProduct of orderProducts) {
      const product = productDetails.get(orderProduct.id);
      if (!product) {
        throw new Error(`Product ${orderProduct.id} not found`);
      }

      if (product.requireStock) {
        const currentStock = product.stock ?? 0;
        if (currentStock < orderProduct.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${currentStock}, Required: ${orderProduct.quantity}`,
          );
        }
      }
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SO${timestamp.toString().slice(-6)}${shortId}${random
      .toString()
      .padStart(4, '0')}`;
  }

  private calculateTotalAmount(products: any[]): number {
    return products.reduce((total, product) => {
      const price = product.offerPrice ?? product.price;
      return total + price * product.quantity;
    }, 0);
  }
}
