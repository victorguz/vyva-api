import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { SalesOrder } from '../../schemas/sales-order.schema';
import { User } from '../../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BusinessIdGuard } from '../auth/guards/businessId.guard';
import {
  CreateSalesOrderDto,
  DailyPaymentMethodsResponseDto,
  DateRangeReportDto,
  DeleteSalesOrderDto,
  ListSalesOrderDto,
  SalesReportResponseDto,
  UpdateSalesOrderDto,
} from './dto/sales-orders.dto';
import { SalesOrdersService } from './sales-orders.service';

@ApiTags('Sales Orders')
@Controller('sales-orders')
@UseGuards(AuthGuard, BusinessIdGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({
    status: 201,
    description: 'The sales order has been successfully created.',
    type: GenericResponse<SalesOrder>,
  })
  @UseGuards(AuthGuard)
  async create(
    @Body() createSalesOrderDto: CreateSalesOrderDto,
    @CurrentUser() user?: User,
  ): Promise<GenericResponse<SalesOrder>> {
    return this.salesOrdersService.create(createSalesOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales orders with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Return all sales orders.',
    type: GenericResponse<[SalesOrder]>,
  })
  @UseGuards(AuthGuard)
  async findAll(
    @Query() filters: ListSalesOrderDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<SalesOrder[]>> {
    return this.salesOrdersService.findAll(user, filters);
  }

  @Get('order-number/:orderNumber')
  @ApiOperation({ summary: 'Get a sales order by order number' })
  @ApiResponse({
    status: 200,
    description: 'Return the sales order by order number.',
    type: GenericResponse<SalesOrder>,
  })
  @UseGuards(AuthGuard)
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
  ): Promise<GenericResponse<SalesOrder>> {
    return this.salesOrdersService.findByOrderNumber(orderNumber);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sales order' })
  @ApiResponse({
    status: 200,
    description: 'The sales order has been successfully deleted.',
    type: GenericResponse<SalesOrder>,
  })
  @UseGuards(AuthGuard)
  async remove(
    @Param() params: DeleteSalesOrderDto,
  ): Promise<GenericResponse<SalesOrder>> {
    return this.salesOrdersService.remove(params.id);
  }

  @Post('daily-sales-cards')
  @ApiOperation({ summary: 'Get sales report for a date range' })
  @ApiResponse({
    status: 200,
    description: 'Return sales report for the specified date range.',
    type: GenericResponse<SalesReportResponseDto>,
  })
  @UseGuards(AuthGuard)
  async getDailySalesCards(
    @Body() dateRangeDto: DateRangeReportDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<SalesReportResponseDto>> {
    return this.salesOrdersService.getDailySalesCards(
      dateRangeDto,
      user,
    );
  }

  @Get('daily-payment-methods')
  @ApiOperation({
    summary: 'Get daily sales value breakdown by payment methods',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return daily sales breakdown by payment methods for the current business.',
    type: GenericResponse<DailyPaymentMethodsResponseDto>,
  })
  @UseGuards(AuthGuard)
  async getDailyPaymentMethodsSummary(
    @CurrentUser() user: User,
  ): Promise<GenericResponse<DailyPaymentMethodsResponseDto>> {
    return this.salesOrdersService.getDailyPaymentMethodsSummary(
      user
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sales order' })
  @ApiResponse({
    status: 200,
    description: 'The sales order has been successfully updated.',
    type: GenericResponse<SalesOrder>,
  })
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSalesOrderDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<SalesOrder>> {
    return this.salesOrdersService.update(id, body, user);
  }
}
