import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/app/schemas/user.schema';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Customer } from '../../schemas/customer.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers.dto';

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
    return this.customersService.create(createCustomerDto, user.id);
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
    return this.customersService.findAll(user.id);
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
    return this.customersService.findOne(id, user.id);
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Get a customer by email' })
  @ApiResponse({
    status: 200,
    description: 'Return the customer.',
    type: GenericResponse<Customer>,
  })
  async findOneByEmail(
    @Param('email') email: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Customer>> {
    return this.customersService.findOneByEmail(email, user.id);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get customers by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Return customers associated with the user.',
    type: GenericResponse<[Customer]>,
  })
  async findByUserId(
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Customer[]>> {
    return this.customersService.findByUserId(userId, user.id);
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
    return this.customersService.update(id, updateCustomerDto, user.id);
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
    return this.customersService.remove(id, user.id);
  }
}
