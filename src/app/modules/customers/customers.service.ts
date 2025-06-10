import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import {
  Customer,
  CustomerKey,
} from '../../entities/customer-relationship.entity';
import { User, UserKey } from '../../entities/user.entity';

import { handleError } from '../../shared/error.functions';
import { v4 as uuidv4 } from 'uuid';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { CreateCustomerDto, CustomerWithUserDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel('Customer')
    private readonly customerModel: Model<Customer, CustomerKey>,
    @InjectModel('User')
    private readonly userModel: Model<User, UserKey>,
  ) {}

  async findByBusinessSlug(
    businessSlug: string,
  ): Promise<GenericResponse<CustomerWithUserDto[]>> {
    try {
      // Find the company user with the given business slug
      const companyUsers = await this.userModel
        .scan()
        .filter('businessInfo.slug')
        .eq(businessSlug)
        .exec();

      if (!companyUsers || companyUsers.length === 0) {
        // No company found with that slug
        return new GenericResponse([]);
      }

      const companyUserId = companyUsers[0].id;

      // Find all customer records for this company
      const customerRecords = await this.customerModel
        .scan()
        .where('companyUserId')
        .eq(companyUserId)
        .where('status')
        .eq(true)
        .exec();

      // Transform to response format
      const customers = customerRecords.map((record) => {
        const item = record.toJSON();
        return {
          id: item.id,
          userId: item.customerUserId,
          fullName: item.fullName,
          email: item.email,
          phone: item.phone,
          documentType: item.documentType,
          documentNumber: item.documentNumber,
          status: item.status,
          notes: item.notes,
          createdAt: item.createdAt,
        } as CustomerWithUserDto;
      });

      return new GenericResponse(customers);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string): Promise<GenericResponse<Customer>> {
    try {
      const customer = await this.customerModel.get({ id });
      if (!customer) {
        throw new Error('MS007'); // Resource not found
      }
      return new GenericResponse(customer.toJSON() as Customer);
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(dto: CreateCustomerDto): Promise<GenericResponse<Customer>> {
    try {
      // Verify company user exists
      const companyUser = await this.userModel.get({ id: dto.companyUserId });
      if (!companyUser) {
        throw new Error('MS007'); // Company user not found
      }

      // Verify customer user exists
      const customerUser = await this.userModel.get({ id: dto.customerUserId });
      if (!customerUser) {
        throw new Error('MS007'); // Customer user not found
      }

      // Check if customer already exists
      const existingCustomer = await this.customerModel
        .scan()
        .where('companyUserId')
        .eq(dto.companyUserId)
        .where('customerUserId')
        .eq(dto.customerUserId)
        .exec();

      if (existingCustomer && existingCustomer.length > 0) {
        throw new Error('MS005'); // Customer already exists
      }

      // Create the customer record with contact info
      const newCustomer = await this.customerModel.create({
        id: uuidv4(),
        companyUserId: dto.companyUserId,
        customerUserId: dto.customerUserId,
        // Contact information
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        // Other fields
        notes: dto.notes,
        metadata: dto.metadata,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return new GenericResponse(newCustomer.toJSON() as Customer);
    } catch (error) {
      throw handleError(error);
    }
  }

  async remove(id: string): Promise<GenericResponse<void>> {
    try {
      const customer = await this.customerModel.get({ id });
      if (!customer) {
        throw new Error('MS007'); // Customer not found
      }

      // Soft delete by setting status to false
      await this.customerModel.update({ id }, { status: false });
      return new GenericResponse(undefined);
    } catch (error) {
      throw handleError(error);
    }
  }
}
