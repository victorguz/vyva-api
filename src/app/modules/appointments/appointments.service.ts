import { Injectable } from '@nestjs/common';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { AppointmentStatus, SalesOrderStatus } from 'src/app/core/constants/domain.constants';
import { Customer, CustomerKey } from 'src/app/schemas/customer.schema';
import { Product, ProductKey } from 'src/app/schemas/product.schema';
import { SalesOrder, SalesOrderKey } from 'src/app/schemas/sales-order.schema';
import { User } from 'src/app/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Appointment, AppointmentKey } from '../../schemas/appointment.schema';
import { IntegrationType } from '../../schemas/integration.schema';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties } from '../../shared/shared.functions';
import { CustomersService } from '../customers/customers.service';
import { GoogleCalendarService } from '../integrations/google-calendar/google-calendar.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { ProductsService } from '../products/products.service';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { UsersService } from '../users/users.service';
import {
  CreateAppointmentDto,
  ListAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/appointments.dto';

@Injectable()
export class AppointmentsService extends TransactionSupport {
  constructor(
    private readonly salesOrderService: SalesOrdersService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly integrationsService: IntegrationsService,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    @InjectModel('Appointment')
    private readonly model: Model<Appointment, AppointmentKey>,
    @InjectModel('SalesOrder')
    private readonly salesOrderModel: Model<SalesOrder, SalesOrderKey>,
    @InjectModel('Customer')
    private readonly customerModel: Model<Customer, CustomerKey>,
    @InjectModel('Product')
    private readonly productModel: Model<Product, ProductKey>,
  ) {
    super();
  }

  async createPublic(
    body: CreateAppointmentDto,
  ): Promise<GenericResponse<Appointment>> {
    try {
      if (!body.businessInfoId) {
        throw new Error('MS014'); // BusinessInfoId is required
      }

      const transactions = [];

      // Create sales order manually for public appointments
      const orderNumber = this.generateOrderNumber();
      const product = await this.productModel.get({ id: body.idService });
      if (!product) {
        throw new Error('MS007');
      }
      const productData = product.toJSON() as Product;
      const totalAmount = productData.offerPrice ?? productData.price ?? 0;
      const paidAmount = body.paymentMethods.reduce(
        (sum, pm) => sum + pm.value,
        0,
      );

      const salesOrder: SalesOrder = {
        id: uuidv4(),
        orderNumber,
        idCustomer: body.idCustomer,
        products: [
          {
            id: body.idService,
            quantity: 1,
            isService: true,
            price: totalAmount,
          },
        ],
        paymentMethods: body.paymentMethods,
        paidAmount,
        totalAmount,
        status:
          paidAmount === 0
            ? SalesOrderStatus.pending
            : paidAmount === totalAmount
            ? SalesOrderStatus.paid
            : SalesOrderStatus.partiallyPaid,
        businessInfoId: body.businessInfoId,
        createdBy: undefined,
      };

      const salesTransaction =
        this.salesOrderModel.transaction.create(salesOrder);
      transactions.push(salesTransaction);

      let appointment = null;
      if (body.startDate && body.endDate) {
        this.validateAppointmentDates(body.startDate, body.endDate);

        appointment = {
          id: uuidv4(),
          startDate: new Date(body.startDate).getTime() as any,
          endDate: new Date(body.endDate).getTime() as any,
          idService: body.idService,
          idCustomer: body.idCustomer,
          idEmployee: body.idEmployee,
          idOrder: body.idOrder,
          status: AppointmentStatus.pending,
          businessInfoId: body.businessInfoId,
          createdBy: undefined,
        };

        const cleanedPayload = deleteEmptyProperties(appointment);

        const appointmentTransaction = this.model.transaction.create({
          ...cleanedPayload,
          idOrder: salesOrder.id,
        });

        transactions.push(appointmentTransaction);
      }

      await this.transaction([...transactions]);

      const appointmentResult = await this.model.get({ id: appointment.id });
      return new GenericResponse(appointmentResult);
    } catch (error) {
      throw handleError(error);
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  async create(
    body: CreateAppointmentDto,
    user: User,
  ): Promise<GenericResponse<Appointment>> {
    try {
      const transactions = [];
      const salesOrder = await this.salesOrderService.createOrderObject(
        {
          products: [
            { id: body.idService, quantity: 1, isService: true, price: 0 },
          ],
          paymentMethods: body.paymentMethods,
          idCustomer: body.idCustomer,
        },
        user,
      );
      const salesTransaction =
        this.salesOrderModel.transaction.create(salesOrder);
      transactions.push(salesTransaction);

      let appointment = null;
      if (body.startDate && body.endDate) {
        this.validateAppointmentDates(body.startDate, body.endDate);

        appointment = {
          id: uuidv4(),
          startDate: new Date(body.startDate).getTime() as any,
          endDate: new Date(body.endDate).getTime() as any,
          idService: body.idService,
          idCustomer: body.idCustomer,
          idEmployee: body.idEmployee,
          idOrder: body.idOrder,
          status: AppointmentStatus.pending,
          businessInfoId: user.businessInfoId,
          createdBy: user.id,
        };

        const cleanedPayload = deleteEmptyProperties(appointment);

        const appointmentTransaction = this.model.transaction.create({
          ...cleanedPayload,
          idOrder: salesOrder.id,
        });

        transactions.push(appointmentTransaction);
      }

      await this.transaction([...transactions]);

      const appointmentResult = await this.model.get({ id: appointment.id });

      // Create Google Calendar event if integration exists
      try {
        await this.createGoogleCalendarEvent(
          appointmentResult as Appointment,
          user,
        );
        // Refresh appointment to get updated googleCalendarEventId
        const updatedAppointment = await this.model.get({ id: appointment.id });
        return new GenericResponse(updatedAppointment);
      } catch (error) {
        // If Google Calendar creation fails, still return the appointment
        // Log error but don't fail the appointment creation
        console.error('Failed to create Google Calendar event:', error);
        return new GenericResponse(appointmentResult);
      }
    } catch (error) {
      throw handleError(error);
    }
  }

  async findAllPublic(
    businessId: string,
    filters?: ListAppointmentDto,
  ): Promise<GenericResponse<Appointment[]>> {
    try {
      // Validate businessId
      if (!businessId) {
        throw new Error('MS014');
      }

      let query = this.model.scan();

      // Apply filters
      if (filters?.idCustomer) {
        query = query.where('idCustomer').eq(filters.idCustomer);
      }

      if (filters?.idEmployee) {
        query = query.where('idEmployee').eq(filters.idEmployee);
      }

      if (filters?.idOrder) {
        query = query.where('idOrder').eq(filters.idOrder);
      }

      if (filters?.status) {
        query = query.where('status').eq(filters.status);
      }

      // Always filter by business
      query = query.where('businessInfoId').eq(businessId);

      // Apply date range filters
      if (filters?.startDate) {
        query = query.where('startDate').ge(new Date(filters.startDate) as any);
      }

      if (filters?.endDate) {
        query = query.where('endDate').le(new Date(filters.endDate) as any);
      }

      const appointments = (await query.exec()).map(
        (appointment) => appointment as Appointment,
      );
      return new GenericResponse(appointments);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findAll(
    user: User,
    filters?: ListAppointmentDto,
  ): Promise<GenericResponse<Appointment[]>> {
    try {
      // Validate user and businessInfoId
      if (!user || !user.businessInfoId) {
        throw new Error('MS014');
      }

      let query = this.model.scan();

      // Apply filters
      if (filters?.idCustomer) {
        query = query.where('idCustomer').eq(filters.idCustomer);
      }

      if (filters?.idEmployee) {
        query = query.where('idEmployee').eq(filters.idEmployee);
      }

      // if (filters?.idService) {
      //   query = query.where('idService').eq(filters.idService);
      // }

      if (filters?.idOrder) {
        query = query.where('idOrder').eq(filters.idOrder);
      }

      if (filters?.status) {
        query = query.where('status').eq(filters.status);
      }

      // Always filter by business
      query = query.where('businessInfoId').eq(user.businessInfoId);

      // Apply date range filters
      if (filters?.startDate) {
        query = query.where('startDate').ge(new Date(filters.startDate) as any);
      }

      if (filters?.endDate) {
        query = query.where('endDate').le(new Date(filters.endDate) as any);
      }

      const appointments = (await query.exec()).map(
        (appointment) => appointment as Appointment,
      );
      return new GenericResponse(appointments);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: User,
  ): Promise<GenericResponse<Appointment>> {
    try {
      // Validate id
      if (!id) {
        throw new Error('MS014');
      }

      const appointmentResult = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .exec();

      if (!appointmentResult || appointmentResult.length === 0) {
        throw new Error('MS007');
      }

      const appointment = appointmentResult[0] as Appointment;
      const transactions: any[] = [];

      // Separate paymentMethods from other fields
      const cleanedUpdateDto = deleteEmptyProperties(updateAppointmentDto);
      const { paymentMethods, ...cleanedDto } = cleanedUpdateDto as any;

      // Handle date conversions and validation
      if (cleanedDto.startDate) {
        cleanedDto.startDate = new Date(cleanedDto.startDate) as any;
      }
      if (cleanedDto.endDate) {
        cleanedDto.endDate = new Date(cleanedDto.endDate) as any;
      }

      // Validate dates if both are provided
      if (cleanedDto.startDate && cleanedDto.endDate) {
        this.validateAppointmentDates(
          cleanedDto.startDate.toString(),
          cleanedDto.endDate.toString(),
        );
      }

      // Handle payment methods update if provided
      if (paymentMethods && paymentMethods.length > 0) {
        let orderId = appointment.idOrder;

        if (!orderId) {
          // Create new order if none exists
          const newOrder = await this.salesOrderService.createOrderObject(
            {
              products: [
                {
                  id: appointment.idService,
                  quantity: 1,
                  isService: true,
                  price: 0,
                },
              ],
              paymentMethods: paymentMethods,
              idCustomer: appointment.idCustomer || '',
            },
            user,
          );

          const orderCreateTx =
            this.salesOrderModel.transaction.create(newOrder);
          transactions.push(orderCreateTx);

          // Update appointment with new order ID
          cleanedDto.idOrder = newOrder.id;
        } else {
          // Update existing order - only update payment-related fields
          const existingOrder = await this.salesOrderModel.get({
            id: orderId,
          });
          if (!existingOrder) {
            throw new Error('MS007');
          }

          const orderData = existingOrder.toJSON() as SalesOrder;

          // Calculate new values based on payment methods
          const paidAmount = this.calculatePaidAmount(paymentMethods);
          const totalAmount = orderData.totalAmount || 0;
          const orderStatus =
            paidAmount === 0
              ? 'pending'
              : paidAmount === totalAmount
              ? 'paid'
              : 'partiallyPaid';

          // Only update payment-related fields, keep existing id, orderNumber, products, etc.
          const orderUpdateTx = this.salesOrderModel.transaction.update(
            { id: orderId },
            {
              paymentMethods: paymentMethods,
              paidAmount: paidAmount,
              status: orderStatus,
              modifiedBy: user.id,
            } as any,
          );
          transactions.push(orderUpdateTx);
        }
      }

      // Update appointment fields if there are any changes
      if (Object.keys(cleanedDto).length > 0) {
        const appointmentUpdateTx = this.model.transaction.update(
          { id: appointment.id },
          { ...cleanedDto, modifiedBy: user.id },
        );
        transactions.push(appointmentUpdateTx);
      }

      // Execute transaction if there are any operations
      if (transactions.length > 0) {
        await this.transaction(transactions);
      }

      // Return updated appointment
      const updatedAppointment = await this.model.get({ id: appointment.id });

      if (!updatedAppointment) {
        throw new Error('MS007');
      }

      return new GenericResponse(updatedAppointment as Appointment);
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateAppointmentStatusDto,
  ): Promise<GenericResponse<Appointment>> {
    try {
      // Validate id and status
      if (!id) {
        throw new Error('MS014');
      }
      if (!updateStatusDto.status) {
        throw new Error('MS014');
      }

      const updateData: any = { status: updateStatusDto.status };

      if (updateStatusDto.modifiedBy) {
        updateData.modifiedBy = updateStatusDto.modifiedBy;
      }

      await this.model.update({ id }, updateData);
      const updatedAppointment = await this.model.get({ id });

      if (!updatedAppointment) {
        throw new Error('MS007');
      }

      return new GenericResponse(updatedAppointment as Appointment);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string): Promise<GenericResponse<boolean>> {
    try {
      // Validate id
      if (!id) {
        throw new Error('id is required and cannot be undefined or null');
      }

      await this.model.delete({ id });
      return new GenericResponse(true);
    } catch (error) {
      throw handleError(error);
    }
  }

  private validateAppointmentDates(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('MS042');
    }

    if (start >= end) {
      throw new Error('MS041');
    }
  }

  private calculatePaidAmount(
    paymentMethods: Array<{ value: number }>,
  ): number {
    return (paymentMethods || []).reduce(
      (acc, item) => acc + (item?.value || 0),
      0,
    );
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string | undefined): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Create Google Calendar event for an appointment
   */
  private async createGoogleCalendarEvent(
    appointment: Appointment,
    user: User,
  ): Promise<void> {
    try {
      // Check if Google Calendar integration exists for this user
      const integrationResponse = await this.integrationsService.findByType(
        IntegrationType.GOOGLE_CALENDAR,
        user,
      );

      if (!integrationResponse.data) {
        // No Google Calendar integration, skip
        return;
      }

      // Get color configuration from integration
      const integration = integrationResponse.data as any;
      const calendarData = integration.data;
      const colorConfig: { colorId?: string; colorRgbFormat?: string } = {};
      if (calendarData?.colorId) {
        colorConfig.colorId = calendarData.colorId;
      } else if (calendarData?.colorRgbFormat) {
        colorConfig.colorRgbFormat = calendarData.colorRgbFormat;
      }

      // Get customer information if available
      let customerEmail: string | undefined;
      let customerName: string | undefined;
      let customerPhone: string | undefined;
      if (appointment.idCustomer) {
        try {
          const customerResponse = await this.customersService.findOne(
            appointment.idCustomer,
            user,
          );
          const customer = customerResponse.data;
          if (customer) {
            customerEmail = customer.email;
            customerName = customer.lastName
              ? `${customer.firstName} ${customer.lastName}`.trim()
              : customer.firstName;
            customerPhone = customer.phone;
          }
        } catch (error) {
          // Customer not found or error, continue without email
          console.warn('Could not fetch customer information:', error);
        }
      }

      // Get employee information if available
      let employeeName: string | undefined;
      let employeeEmail: string | undefined;
      if (appointment.idEmployee) {
        try {
          const employeeResponse = await this.usersService.findOne(
            appointment.idEmployee,
            user,
          );
          const employee = employeeResponse.data;
          if (employee) {
            employeeName = employee.lastName
              ? `${employee.firstName} ${employee.lastName}`.trim()
              : employee.firstName;
            employeeEmail = employee.email;
          }
        } catch (error) {
          // Employee not found or error, continue without name
          console.warn('Could not fetch employee information:', error);
        }
      }

      // Get service/product information
      let serviceName = 'Appointment';
      let serviceDescription: string | undefined;
      if (appointment.idService) {
        try {
          const productResponse = await this.productsService.findOne(
            appointment.idService,
            user,
          );
          if (productResponse.data?.name) {
            serviceName = productResponse.data.name;
            serviceDescription = productResponse.data.description;
          }
        } catch (error) {
          // Service not found, use default name
          console.warn('Could not fetch service name:', error);
        }
      }

      // Get order information if available
      let orderNumber: string | undefined;
      if (appointment.idOrder) {
        try {
          const order = await this.salesOrderModel.get({
            id: appointment.idOrder,
          });
          if (order) {
            const orderData = order.toJSON() as SalesOrder;
            orderNumber = orderData.orderNumber;
          }
        } catch (error) {
          // Order not found, continue without order number
          console.warn('Could not fetch order information:', error);
        }
      }

      // Format dates for Google Calendar (ISO 8601)
      const startDate = new Date(appointment.startDate);
      const endDate = new Date(appointment.endDate);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Format date and time for description
      const formattedStartDate = startDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedStartTime = startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const formattedEndTime = endDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Build event summary (title) - include customer name and service
      const summaryParts: string[] = [];
      if (customerName) {
        summaryParts.push(customerName);
      }
      summaryParts.push(serviceName);
      const eventSummary = summaryParts.join(' - ');

      // Build detailed description in HTML format - always include basic info
      const descriptionParts: string[] = [];
      descriptionParts.push(
        `<h3 style="margin: 0 0 10px 0;">📅 Cita: ${this.escapeHtml(
          serviceName,
        )}</h3>`,
      );

      if (serviceDescription) {
        descriptionParts.push(
          `<p style="margin: 0 0 8px 0;"><strong>📝 Descripción:</strong> ${this.escapeHtml(
            serviceDescription,
          )}</p>`,
        );
      }

      descriptionParts.push(
        `<p style="margin: 0 0 8px 0;"><strong>📆 Fecha:</strong> ${this.escapeHtml(
          formattedStartDate,
        )}</p>`,
      );
      descriptionParts.push(
        `<p style="margin: 0 0 8px 0;"><strong>🕐 Hora:</strong> ${this.escapeHtml(
          formattedStartTime,
        )} - ${this.escapeHtml(formattedEndTime)}</p>`,
      );

      if (customerName) {
        descriptionParts.push(
          `<p style="margin: 0 0 8px 0;"><strong>👤 Cliente:</strong> ${this.escapeHtml(
            customerName,
          )}</p>`,
        );
        if (customerPhone) {
          descriptionParts.push(
            `<p style="margin: 0 0 8px 20px;"><strong>📞 Teléfono:</strong> ${this.escapeHtml(
              customerPhone,
            )}</p>`,
          );
        }
      }

      if (employeeName) {
        descriptionParts.push(
          `<p style="margin: 0 0 8px 0;"><strong>👨‍💼 Atendido por:</strong> ${this.escapeHtml(
            employeeName,
          )}</p>`,
        );
      }

      if (orderNumber) {
        descriptionParts.push(
          `<p style="margin: 0 0 8px 0;"><strong>📦 Orden:</strong> ${this.escapeHtml(
            orderNumber,
          )}</p>`,
        );
      }

      if (appointment.status) {
        const statusLabels: Record<string, string> = {
          pending: '⏳ Pendiente',
          confirmed: '✅ Confirmada',
          canceled: '❌ Cancelada',
          completed: '✅ Completada',
        };
        descriptionParts.push(
          `<p style="margin: 0;"><strong>📌 Estado:</strong> ${this.escapeHtml(
            statusLabels[appointment.status] || appointment.status,
          )}</p>`,
        );
      }

      // Join without newlines to reduce spacing - HTML will handle formatting
      const eventDescription = descriptionParts.join('');

      // Log for debugging
      console.log('Google Calendar Event Description:', eventDescription);
      console.log('Description length:', eventDescription.length);
      console.log(
        'Description preview (first 200 chars):',
        eventDescription.substring(0, 200),
      );

      // Build attendees list - always include customer email if available
      const attendees: Array<{ email: string }> = [];
      if (customerEmail) {
        attendees.push({ email: customerEmail });
      }

      // Ensure description is always present and not empty
      const finalDescription =
        eventDescription.trim() ||
        `<p>Cita: ${this.escapeHtml(serviceName)}</p>`;

      // Create calendar event
      const eventData = {
        summary: eventSummary,
        description: finalDescription, // Always include description
        start: {
          dateTime: startDate.toISOString(),
          timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone,
        },
        attendees: attendees.length > 0 ? attendees : undefined,
        ...colorConfig, // Add color configuration from integration
      };

      // Log for debugging
      console.log(
        'Google Calendar Event Data:',
        JSON.stringify(
          {
            ...eventData,
            description: finalDescription.substring(0, 500) + '...',
          },
          null,
          2,
        ),
      );

      const eventResponse = await this.googleCalendarService.createEvent(
        user,
        eventData,
      );

      if (eventResponse.data?.id) {
        // Update appointment with Google Calendar event ID
        await this.model.update(
          { id: appointment.id },
          { googleCalendarEventId: eventResponse.data.id },
        );
      }
    } catch (error) {
      // Log error but don't throw - appointment creation should still succeed
      console.error('Error creating Google Calendar event:', error);
      throw error; // Re-throw to be caught by caller
    }
  }
}
