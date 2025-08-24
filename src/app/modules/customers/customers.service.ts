import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { deleteEmptyProperties } from 'src/app/shared/shared.functions';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Customer, CustomerKey } from '../../schemas/customer.schema';
import { handleError } from '../../shared/error.functions';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel('Customer')
    private readonly model: Model<Customer, CustomerKey>,
  ) {}

  async findAll(businessId: string): Promise<GenericResponse<Customer[]>> {
    try {
      const customers = await this.model
        .scan()
        .where('businessId')
        .eq(businessId)
        .exec();

      return new GenericResponse(
        customers.map((customer) => customer.serialize('frontend') as Customer),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(
    id: string,
    businessId: string,
  ): Promise<GenericResponse<Customer>> {
    try {
      const customer = await this.model.get({ id });
      if (!customer) {
        throw new Error('MS007');
      }

      // Verify customer belongs to the business
      const customerData = customer.toJSON() as Customer;
      if (customerData.businessId !== businessId) {
        throw new Error('MS007'); // Not found (for security)
      }

      return new GenericResponse(customerData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOneByEmail(
    email: string,
    businessId: string,
  ): Promise<GenericResponse<Customer>> {
    try {
      const customers = await this.model
        .scan()
        .where('email')
        .eq(email.toLowerCase())
        .where('businessId')
        .eq(businessId)
        .exec();

      if (!customers || customers.length === 0) {
        throw new Error('MS007');
      }

      const customerData = customers[0].toJSON() as Customer;
      return new GenericResponse(customerData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findByUserId(
    userId: string,
    businessId: string,
  ): Promise<GenericResponse<Customer[]>> {
    try {
      const customers = await this.model
        .scan()
        .where('userId')
        .eq(userId)
        .where('businessId')
        .eq(businessId)
        .exec();

      return new GenericResponse(
        customers.map((customer) => customer.toJSON() as Customer),
      );
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(
    body: CreateCustomerDto,
    businessId: string,
  ): Promise<GenericResponse<Customer>> {
    try {
      // Verificar email duplicado solo si se proporciona email (dentro del mismo business)

      const customerObj = deleteEmptyProperties({
        id: uuidv4(),
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email ? body.email.toLowerCase() : undefined,
        role: body.role || 'customer',
        status: body.status !== undefined ? body.status : true,
        documentType: body.documentType,
        documentNumber: body.documentNumber,
        phone: body.phone,
        typePerson: body.typePerson || 'natural',
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
        country: body.country,
        city: body.city,
        address: body.address,
        profilePicture: body.profilePicture,
        userId: body.userId,
        businessId: businessId, // Set businessId from current user
        data: body.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // Si no hay duplicados, crear el customer
      const newCustomer = await this.model.create(customerObj);

      const customerData = newCustomer.toJSON() as Customer;
      return new GenericResponse(customerData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    businessId: string,
  ): Promise<GenericResponse<Customer>> {
    try {
      // First verify customer belongs to this business
      const existingCustomer = await this.model.get({ id });
      if (!existingCustomer) {
        throw new Error('MS007');
      }

      const existingCustomerData = existingCustomer.toJSON() as Customer;
      if (existingCustomerData.businessId !== businessId) {
        throw new Error('MS007'); // Not found (for security)
      }

      // Update email to lowercase if provided and not empty
      if (updateCustomerDto.email && updateCustomerDto.email.trim() !== '') {
        updateCustomerDto.email = updateCustomerDto.email.toLowerCase();
      }

      // Remove businessId from update data to prevent changing it
      const { businessId: _, ...updateData } = updateCustomerDto;

      // Clean up empty strings for indexed fields to prevent DynamoDB validation errors
      const cleanedUpdateData = { ...updateData };

      // Remove empty strings for indexed fields (email has a global secondary index)
      if (
        cleanedUpdateData.email === '' ||
        cleanedUpdateData.email === null ||
        cleanedUpdateData.email === undefined
      ) {
        delete cleanedUpdateData.email;
      }

      // Use deleteEmptyProperties to clean up other empty values
      const finalUpdateData = deleteEmptyProperties(cleanedUpdateData);

      await this.model.update({ id }, finalUpdateData);
      const updatedCustomer = await this.model.get({ id });
      if (!updatedCustomer) {
        throw new Error('MS007');
      }
      const customerData = updatedCustomer.toJSON() as Customer;
      return new GenericResponse(customerData);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string, businessId: string): Promise<GenericResponse<void>> {
    try {
      const customer = await this.model.get({ id });
      if (!customer) {
        throw new Error('MS007');
      }

      // Verify customer belongs to this business
      const customerData = customer.toJSON() as Customer;
      if (customerData.businessId !== businessId) {
        throw new Error('MS007'); // Not found (for security)
      }

      await this.model.update({ id }, { status: false });
      return new GenericResponse(undefined);
    } catch (error) {
      throw handleError(error);
    }
  }
}
