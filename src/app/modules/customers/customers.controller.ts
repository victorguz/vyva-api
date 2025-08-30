import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/app/schemas/user.schema';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Customer } from '../../schemas/customer.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, CustomersCountResponseDto, UpdateCustomerDto } from './dto/customers.dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: GenericResponse<Customer>,
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Customer>> {
    return this.customersService.create(createCustomerDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Return all customers.',
    type: GenericResponse<[Customer]>,
  })
  async findAll(
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Customer[]>> {
    return this.customersService.findAll(user);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get customers count statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return total customers and customers registered today count.',
    type: GenericResponse<CustomersCountResponseDto>,
  })
  async getCustomersCount(
    @CurrentUser() user: User,
  ): Promise<GenericResponse<CustomersCountResponseDto>> {
    return this.customersService.getCustomersCount(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the customer.',
    type: GenericResponse<Customer>,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Customer>> {
    return this.customersService.findOne(id, user);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully updated.',
    type: GenericResponse<Customer>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Customer>> {
    return this.customersService.update(id, updateCustomerDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully deleted.',
    type: GenericResponse<void>,
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<void>> {
    return this.customersService.remove(id, user);
  }
}
