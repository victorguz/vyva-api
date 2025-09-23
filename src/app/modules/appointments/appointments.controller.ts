import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Appointment } from '../../schemas/appointment.schema';
import { User } from '../../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  ListAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/appointments.dto';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'The appointment has been successfully created.',
    type: GenericResponse<Appointment>,
  })
  @UseGuards(AuthGuard)
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Appointment>> {
    return this.appointmentsService.create(createAppointmentDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Return all appointments.',
    type: GenericResponse<[Appointment]>,
  })
  @UseGuards(AuthGuard)
  async findAll(
    @Query() filters: ListAppointmentDto,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Appointment[]>> {
    return this.appointmentsService.findAll(user, filters);
  }

  @Get('order/:idOrder')
  @ApiOperation({ summary: 'Get appointments by order ID' })
  @ApiResponse({
    status: 200,
    description: 'Return appointments for the specified order.',
    type: GenericResponse<[Appointment]>,
  })
  @UseGuards(AuthGuard)
  async findByOrderId(
    @Param('idOrder') idOrder: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Appointment[]>> {
    return this.appointmentsService.findByOrderId(idOrder, user);
  }

  @Get('customer/:idCustomer')
  @ApiOperation({ summary: 'Get appointments by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Return appointments for the specified customer.',
    type: GenericResponse<[Appointment]>,
  })
  @UseGuards(AuthGuard)
  async findByCustomerId(
    @Param('idCustomer') idCustomer: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Appointment[]>> {
    return this.appointmentsService.findByCustomerId(idCustomer, user);
  }

  @Get('employee/:idEmployee')
  @ApiOperation({ summary: 'Get appointments by employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Return appointments for the specified employee.',
    type: GenericResponse<[Appointment]>,
  })
  @UseGuards(AuthGuard)
  async findByEmployeeId(
    @Param('idEmployee') idEmployee: string,
    @CurrentUser() user: User,
  ): Promise<GenericResponse<Appointment[]>> {
    return this.appointmentsService.findByEmployeeId(idEmployee, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the appointment by ID.',
    type: GenericResponse<Appointment>,
  })
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: string,
  ): Promise<GenericResponse<Appointment>> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully updated.',
    type: GenericResponse<Appointment>,
  })
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user?: User,
  ): Promise<GenericResponse<Appointment>> {
    if (user) {
      updateAppointmentDto.modifiedBy = user.id;
    }
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({
    status: 200,
    description: 'The appointment status has been successfully updated.',
    type: GenericResponse<Appointment>,
  })
  @UseGuards(AuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @CurrentUser() user?: User,
  ): Promise<GenericResponse<Appointment>> {
    if (user) {
      updateStatusDto.modifiedBy = user.id;
    }
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully deleted.',
    type: GenericResponse<boolean>,
  })
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<GenericResponse<boolean>> {
    return this.appointmentsService.remove(id);
  }
}
