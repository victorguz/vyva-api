import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User } from 'src/app/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { SalesOrder, SalesOrderKey } from '../../entities/sales-order.entity';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties } from '../../shared/shared.functions';
import { CreateSalesOrderDto, ListSalesOrderDto, UpdateSalesOrderDto } from './dto/sales-orders.dto';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectModel('SalesOrder')
    private readonly model: Model<SalesOrder, SalesOrderKey>,
  ) {}

  async create(
    body: CreateSalesOrderDto,
    user: User,
  ): Promise<GenericResponse<SalesOrder>> {
    try {
      // Generate unique order number
      const orderNumber = this.generateOrderNumber();

      // Calculate total amount
      const totalAmount = this.calculateTotalAmount(body.products);

      const newSalesOrder = await this.model.create({
        id: uuidv4(),
        orderNumber,
        idCustomer: body.idCustomer,
        products: body.products,
        paymentMethods: body.paymentMethods,
        totalAmount,
        status: 'pending',
        businessInfoId: user.id,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return new GenericResponse(newSalesOrder as SalesOrder);
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

      // Add updatedAt timestamp
      cleanedDto.updatedAt = new Date();

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
      const updateData: any = { status, updatedAt: new Date() };

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
      const price = product.offerPrice > 0 ? product.offerPrice : product.price;
      return total + price * product.quantity;
    }, 0);
  }
}
