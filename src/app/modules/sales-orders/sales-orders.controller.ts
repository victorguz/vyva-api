import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { SalesOrder } from '../../schemas/sales-order.schema';
import { User } from '../../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  CreateSalesOrderDto,
  DailyPaymentMethodsResponseDto,
  DateRangeReportDto,
  ListSalesOrderDto,
  SalesReportResponseDto,
  UpdateSalesOrderDto,
} from './dto/sales-orders.dto';
import { SalesOrdersService } from './sales-orders.service';

@ApiTags('Sales Orders')
@Controller('sales-orders')
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sales order' })
  @ApiResponse({
    status: 200,
    description: 'The sales order has been successfully updated.',
    type: GenericResponse<SalesOrder>,
  })
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateSalesOrderDto: UpdateSalesOrderDto,
    @CurrentUser() user?: User,
  ): Promise<GenericResponse<SalesOrder>> {
    if (user) {
      updateSalesOrderDto.modifiedBy = user.id;
    }
    return this.salesOrdersService.update(id, updateSalesOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update sales order status' })
  @ApiResponse({
    status: 200,
    description: 'The sales order status has been successfully updated.',
    type: GenericResponse<SalesOrder>,
  })
  @UseGuards(AuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser() user?: User,
  ): Promise<GenericResponse<SalesOrder>> {
    return this.salesOrdersService.updateStatus(id, body.status, user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sales order' })
  @ApiResponse({
    status: 200,
    description: 'The sales order has been successfully deleted.',
    type: GenericResponse<boolean>,
  })
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<GenericResponse<boolean>> {
    return this.salesOrdersService.remove(id);
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
    const businessInfoId = user.businessInfoId || user.id;
    return this.salesOrdersService.getDailySalesCards(
      dateRangeDto,
      businessInfoId,
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
    const businessInfoId = user.businessInfoId || user.id;
    return this.salesOrdersService.getDailyPaymentMethodsSummary(
      businessInfoId,
    );
  }
}
