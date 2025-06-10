import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  CustomerWithUserDto,
  FindCustomerDto,
} from './dto/customer.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Customer } from '../../entities/customer-relationship.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer relationship' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Post('find')
  @ApiOperation({ summary: 'Find customers by business slug' })
  findByBusinessSlug(
    @Body() findCustomerDto: FindCustomerDto,
  ): Promise<GenericResponse<CustomerWithUserDto[]>> {
    return this.customersService.findByBusinessSlug(
      findCustomerDto.businessSlug,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a customer by ID' })
  findOne(@Param('id') id: string): Promise<GenericResponse<Customer>> {
    return this.customersService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
