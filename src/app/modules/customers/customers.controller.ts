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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/dtos/auth.dto';
import { BusinessInfoService } from '../business-info/business-info.service';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly businessInfoService: BusinessInfoService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new customer relationship using current user business',
  })
  async createFromCurrentUser(
    @CurrentUser() user: AuthUser,
    @Body() createDto: Omit<CreateCustomerDto, 'businessInfoId'>,
  ) {
    // Get the business info for current user
    const businessInfoResult = await this.businessInfoService.findByUserId(
      user.sub,
    );

    if (!businessInfoResult.data || businessInfoResult.data.length === 0) {
      throw new Error('MS007'); // Business info not found
    }

    const businessInfo = businessInfoResult.data[0];

    // Create the complete DTO with businessInfoId
    const completeDto: CreateCustomerDto = {
      ...createDto,
      businessInfoId: businessInfo.id,
    } as CreateCustomerDto;

    return this.customersService.create(completeDto);
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

  @Get('my-customers')
  @ApiOperation({ summary: 'Find customers for current user business' })
  async findMyCustomers(
    @CurrentUser() user: AuthUser,
  ): Promise<GenericResponse<CustomerWithUserDto[]>> {
    // Get the business info for current user
    const businessInfoResult = await this.businessInfoService.findByUserId(
      user.sub,
    );

    if (!businessInfoResult.data || businessInfoResult.data.length === 0) {
      return new GenericResponse([]); // No business info found, return empty array
    }

    const businessInfo = businessInfoResult.data[0];

    // Find customers using business slug
    return this.customersService.findByBusinessSlug(businessInfo.slug);
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
