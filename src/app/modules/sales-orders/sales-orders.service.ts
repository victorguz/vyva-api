import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { AppointmentStatus, PaymentMethodType, SalesOrderStatus } from 'src/app/core/constants/domain.constants';
import { Appointment, AppointmentKey } from 'src/app/schemas/appointment.schema';
import { User } from 'src/app/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Product, ProductKey } from '../../schemas/product.schema';
import { SalesOrder, SalesOrderKey } from '../../schemas/sales-order.schema';
import { handleError } from '../../shared/error.functions';
import {
  CreateSalesOrderDto,
  DailyPaymentMethodsResponseDto,
  DateRangeReportDto,
  ListSalesOrderDto,
  PaymentMethodSummaryDto,
  SalesOrderPaymentMethodDto,
  SalesReportResponseDto,
  UpdateSalesOrderDto,
} from './dto/sales-orders.dto';

@Injectable()
export class SalesOrdersService extends TransactionSupport {
  constructor(
    @InjectModel('SalesOrder')
    private readonly model: Model<SalesOrder, SalesOrderKey>,
    @InjectModel('Product')
    private readonly productModel: Model<Product, ProductKey>,
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment, AppointmentKey>,
  ) {
    super();
  }

  async create(
    body: CreateSalesOrderDto,
    user: User,
  ): Promise<GenericResponse<SalesOrder>> {
    try {
      const transactions = [];
      // Generate unique order number
      const orderNumber = this.generateOrderNumber();

      // Fetch products from database to get accurate prices and stock info
      const productDetails = await this.fetchProductDetails(
        body.products,
        user.businessInfoId,
      );

      // Calculate total amount from database product prices
      const totalAmount = this.calculateTotalAmountFromProducts(
        body.products,
        productDetails,
      );
      const paidAmount = this.calculatePaidAmount(body.paymentMethods);
      // Validate stock availability for products that require stock
      this.validateStockAvailability(body.products, productDetails);
      const salesOrder = {
        id: uuidv4(),
        orderNumber,
        idCustomer: body.idCustomer,
        products: body.products,
        paymentMethods: body.paymentMethods,
        paidAmount,
        totalAmount,
        status:
          paidAmount === 0
            ? SalesOrderStatus.pending
            : paidAmount === totalAmount
            ? SalesOrderStatus.paid
            : SalesOrderStatus.partiallyPaid,
        businessInfoId: user.businessInfoId,
        createdBy: user.id,
      };
      // Create sales order using Dynamoose
      const newSalesOrder = this.model.transaction.create({
        ...salesOrder,
      });
      transactions.push(newSalesOrder);
      let appointment = null;
      if (body.startDate && body.endDate && body.products[0].isService) {
        appointment = this.appointmentModel.transaction.create({
          id: uuidv4(),
          idOrder: salesOrder.id,
          idCustomer: body.idCustomer,
          idEmployee: body.idCustomer,
          idService: body.products[0].id,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          status: AppointmentStatus.pending,
          businessInfoId: user.businessInfoId,
          createdBy: user.id,
        });
        transactions.push(appointment);
      }

      await this.transaction([...transactions]);

      const salesOrderResult = await this.model.get({ id: salesOrder.id });
      // Return the created sales order
      return new GenericResponse(salesOrderResult);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    body: UpdateSalesOrderDto,
    user: User,
  ): Promise<GenericResponse<SalesOrder>> {
    try {
      const salesOrderResult = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .exec();

      if (!salesOrderResult || salesOrderResult.length === 0) {
        throw new Error('MS007');
      }

      const salesOrder = salesOrderResult[0];

      const updatedSalesOrder = await this.model.update(
        { id: salesOrder.id },
        { ...body, modifiedBy: user.id },
      );
      return new GenericResponse(updatedSalesOrder);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findAll(
    user: User,
    filters?: ListSalesOrderDto,
  ): Promise<GenericResponse<SalesOrder[]>> {
    try {
      // Validate user and businessInfoId
      if (!user || !user.businessInfoId) {
        throw new Error('MS014');
      }

      let query = this.model.scan();

      if (filters?.orderNumber) {
        query = query.where('orderNumber').eq(filters.orderNumber);
      }

      if (filters?.idCustomer) {
        query = query.where('idCustomer').eq(filters.idCustomer);
      }

      query = query.where('businessInfoId').eq(user.businessInfoId);
      const salesOrders = (await query.exec()).map(
        (order) => order as SalesOrder,
      );
      return new GenericResponse(salesOrders);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string): Promise<GenericResponse<SalesOrder>> {
    try {
      // Validate id
      if (!id) {
        throw new Error('MS014');
      }

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
      // Validate orderNumber
      if (!orderNumber) {
        throw new Error('MS014');
      }

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

  async remove(id: string): Promise<GenericResponse<SalesOrder>> {
    try {
      // Validate id
      if (!id) {
        throw new Error('MS014');
      }

      await this.model.update({ id }, { status: SalesOrderStatus.canceled });
      const updatedSalesOrder = await this.model.get({ id });
      return new GenericResponse(updatedSalesOrder);
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
          throw new Error('MS007');
        }

        const productData = productDetail.toJSON() as Product;

        // Verify product belongs to the same business
        if (productData.businessInfoId !== businessInfoId) {
          throw new Error('MS014');
        }

        productMap.set(product.id, productData);
      } catch (error) {
        throw handleError(error);
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
        throw new Error('MS007');
      }

      const price = product.offerPrice ?? product.price ?? 0;
      return total + price * orderProduct.quantity;
    }, 0);
  }

  private calculatePaidAmount(
    paymentMethods: SalesOrderPaymentMethodDto[],
  ): number {
    return paymentMethods.reduce((acc, item) => {
      return acc + item.value;
    }, 0);
  }

  private validateStockAvailability(
    orderProducts: any[],
    productDetails: Map<string, Product>,
  ): void {
    for (const orderProduct of orderProducts) {
      const product = productDetails.get(orderProduct.id);
      if (!product) {
        throw new Error('MS007');
      }

      if (product.requireStock) {
        const currentStock = product.stock ?? 0;
        if (currentStock < orderProduct.quantity) {
          throw new Error('MS010');
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

  async getDailySalesCards(
    dateRange: DateRangeReportDto,
    businessInfoId: string,
  ): Promise<GenericResponse<SalesReportResponseDto>> {
    try {
      // Validate businessInfoId
      if (!businessInfoId) {
        throw new Error('MS014');
      }

      const startDate = moment(dateRange.startDate).startOf('day');
      const endDate = moment(dateRange.endDate).endOf('day');
      // Calcular el período anterior con la misma duración
      const periodDuration = moment.duration(endDate.diff(startDate));
      const previousEndDate = moment(startDate);
      const previousStartDate =
        moment(previousEndDate).subtract(periodDuration);

      // Obtener ventas del período actual
      const currentPeriodSales = await this.getSalesInDateRange(
        startDate.toDate(),
        endDate.toDate(),
        businessInfoId,
      );
      // Obtener ventas del período anterior
      const previousPeriodSales = await this.getSalesInDateRange(
        previousStartDate.toDate(),
        previousEndDate.toDate(),
        businessInfoId,
      );
      // Calcular totales
      const currentValue = this.calculateTotalFromSales(currentPeriodSales);
      const lastValue = this.calculateTotalFromSales(previousPeriodSales);

      // Determinar la frecuencia basada en la duración del período
      const frequency = this.determineFrequencyWithMoment(startDate, endDate);

      const report: SalesReportResponseDto = {
        title: frequency,
        description: `Último ${frequency.toLowerCase()}`,
        currentValue,
        lastValue,
        isCurrency: true,
        frequency: frequency.toLowerCase(),
      };

      return new GenericResponse(report);
    } catch (error) {
      throw handleError(error);
    }
  }

  private async getSalesInDateRange(
    startDate: Date,
    endDate: Date,
    businessInfoId: string,
  ): Promise<SalesOrder[]> {
    try {
      // Validate businessInfoId is not undefined or null
      if (!businessInfoId) {
        throw new Error('MS014');
      }

      // Primero obtener todas las ventas del negocio y filtrar en memoria
      // Esto evita problemas con tipos de datos en DynamoDB
      const allSalesOrders = await this.model
        .scan()
        .where('businessInfoId')
        .eq(businessInfoId)
        .exec();

      // Filtrar por fecha en memoria
      const filteredOrders = allSalesOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });

      return filteredOrders.map((order) => order as SalesOrder);
    } catch (error) {
      throw handleError(error);
    }
  }

  private calculateTotalFromSales(salesOrders: SalesOrder[]): number {
    return salesOrders.reduce((total, order) => {
      return total + (order.totalAmount || 0);
    }, 0);
  }

  private determineFrequencyWithMoment(
    startDate: moment.Moment,
    endDate: moment.Moment,
  ): string {
    const durationDays = endDate.diff(startDate, 'days') + 1; // +1 para incluir ambos días

    if (durationDays === 1) {
      return 'Día';
    } else if (durationDays <= 7) {
      return 'Semana';
    } else if (durationDays <= 31) {
      return 'Mes';
    } else if (durationDays <= 365) {
      return 'Año';
    } else {
      return 'Período';
    }
  }

  async getDailyPaymentMethodsSummary(
    businessInfoId: string,
  ): Promise<GenericResponse<DailyPaymentMethodsResponseDto>> {
    try {
      // Validate businessInfoId
      if (!businessInfoId) {
        throw new Error('MS014');
      }

      // Obtener todas las órdenes del día actual para el negocio
      const today = moment().startOf('day');
      const endOfDay = moment().endOf('day');

      const todayOrders = await this.getSalesInDateRange(
        today.toDate(),
        endOfDay.toDate(),
        businessInfoId,
      );

      // Calcular el total de ventas del día
      const totalDailySales = this.calculateTotalFromSales(todayOrders);

      // Procesar métodos de pago
      const paymentMethodsMap = new Map<
        string,
        { total: number; count: number }
      >();

      // Iterar por cada orden y sus métodos de pago
      todayOrders.forEach((order) => {
        order.paymentMethods.forEach((payment) => {
          const methodType = payment.type;
          const currentData = paymentMethodsMap.get(methodType) || {
            total: 0,
            count: 0,
          };

          paymentMethodsMap.set(methodType, {
            total: currentData.total + payment.value,
            count: currentData.count + 1,
          });
        });
      });

      // Convertir el mapa a array de DTOs, incluyendo todos los métodos de pago
      const paymentMethods: PaymentMethodSummaryDto[] = [];

      // Iterar por todos los métodos de pago disponibles
      Object.values(PaymentMethodType).forEach((methodType) => {
        const data = paymentMethodsMap.get(methodType) || {
          total: 0,
          count: 0,
        };
        const percentage =
          totalDailySales > 0 ? (data.total / totalDailySales) * 100 : 0;

        paymentMethods.push({
          paymentMethod: methodType,
          totalAmount: data.total,
          transactionCount: data.count,
          percentage: Math.round(percentage * 100) / 100, // Redondear a 2 decimales
        });
      });

      // Ordenar por mayor monto
      paymentMethods.sort((a, b) => b.totalAmount - a.totalAmount);

      const response: DailyPaymentMethodsResponseDto = {
        date: today.format('YYYY-MM-DD'),
        totalDailySales,
        paymentMethods,
        totalOrders: todayOrders.length,
      };

      return new GenericResponse(response);
    } catch (error) {
      throw handleError(error);
    }
  }
}
