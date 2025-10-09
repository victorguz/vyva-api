import { Injectable } from '@nestjs/common';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { AppointmentStatus } from 'src/app/core/constants/domain.constants';
import { User } from 'src/app/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

import { GenericResponse } from '../../core/interfaces/generic-response.interface';
import { Appointment, AppointmentKey } from '../../schemas/appointment.schema';
import { handleError } from '../../shared/error.functions';
import { deleteEmptyProperties } from '../../shared/shared.functions';
import {
  CreateAppointmentDto,
  ListAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/appointments.dto';

@Injectable()
export class AppointmentsService extends TransactionSupport {
  constructor(
    @InjectModel('Appointment')
    private readonly model: Model<Appointment, AppointmentKey>,
  ) {
    super();
  }

  async create(
    body: CreateAppointmentDto,
    user: User,
  ): Promise<GenericResponse<Appointment>> {
    try {
      // Validate dates
      this.validateAppointmentDates(body.startDate, body.endDate);

      const appointment = {
        id: uuidv4(),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        idService: body.idService,
        idCustomer: body.idCustomer,
        idEmployee: body.idEmployee,
        idOrder: body.idOrder,
        status: body.status || AppointmentStatus.pending,
        businessInfoId: user.businessInfoId,
        createdBy: user.id,
      };

      const newAppointment = this.model.transaction.create({
        ...appointment,
      });

      await this.transaction([newAppointment]);

      const appointmentResult = await this.model.get({ id: appointment.id });
      return new GenericResponse(appointmentResult as Appointment);
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
        throw new Error('User and businessInfoId are required');
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

      // if (filters?.idOrder) {
      //   query = query.where('idOrder').eq(filters.idOrder);
      // }

      if (filters?.status) {
        query = query.where('status').eq(filters.status);
      }

      // Always filter by business
      query = query.where('businessInfoId').eq(user.businessInfoId);

      // Apply date range filters
      if (filters?.startDate) {
        query = query.where('startDate').ge(new Date(filters.startDate).getTime());
      }

      if (filters?.endDate) {
        query = query.where('endDate').le(new Date(filters.endDate).getTime());
      }

      const appointments = (await query.exec()).map(
        (appointment) => appointment as Appointment,
      );
      return new GenericResponse(appointments);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findOne(id: string): Promise<GenericResponse<Appointment>> {
    try {
      // Validate id
      if (!id) {
        throw new Error('id is required and cannot be undefined or null');
      }

      const appointment = await this.model.get({ id });
      if (!appointment) {
        throw new Error('MS007');
      }
      return new GenericResponse(appointment as Appointment);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findByOrderId(
    idOrder: string,
    user: User,
  ): Promise<GenericResponse<Appointment[]>> {
    try {
      // Validate idOrder
      if (!idOrder) {
        throw new Error('idOrder is required and cannot be undefined or null');
      }

      const appointments = await this.model
        .scan()
        .where('idOrder')
        .eq(idOrder)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .exec();

      return new GenericResponse(appointments as Appointment[]);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findByCustomerId(
    idCustomer: string,
    user: User,
  ): Promise<GenericResponse<Appointment[]>> {
    try {
      // Validate idCustomer
      if (!idCustomer) {
        throw new Error(
          'idCustomer is required and cannot be undefined or null',
        );
      }

      const appointments = await this.model
        .scan()
        .where('idCustomer')
        .eq(idCustomer)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .exec();

      return new GenericResponse(appointments as Appointment[]);
    } catch (error) {
      throw handleError(error);
    }
  }

  async findByEmployeeId(
    idEmployee: string,
    user: User,
  ): Promise<GenericResponse<Appointment[]>> {
    try {
      // Validate idEmployee
      if (!idEmployee) {
        throw new Error(
          'idEmployee is required and cannot be undefined or null',
        );
      }

      const appointments = await this.model
        .scan()
        .where('idEmployee')
        .eq(idEmployee)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .exec();

      return new GenericResponse(appointments as Appointment[]);
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<GenericResponse<Appointment>> {
    try {
      // Validate id
      if (!id) {
        throw new Error('id is required and cannot be undefined or null');
      }

      // Clean the DTO first to remove undefined/null values
      const cleanedDto = deleteEmptyProperties(updateAppointmentDto);

      // Validate dates if provided
      if (cleanedDto.startDate && cleanedDto.endDate) {
        this.validateAppointmentDates(cleanedDto.startDate, cleanedDto.endDate);
      }

      // Convert date strings to Date objects if provided
      if (cleanedDto.startDate) {
        cleanedDto.startDate = new Date(cleanedDto.startDate) as any;
      }
      if (cleanedDto.endDate) {
        cleanedDto.endDate = new Date(cleanedDto.endDate) as any;
      }

      await this.model.update({ id }, cleanedDto);
      const updatedAppointment = await this.model.get({ id });

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
        throw new Error('id is required and cannot be undefined or null');
      }
      if (!updateStatusDto.status) {
        throw new Error('status is required and cannot be undefined or null');
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
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format provided');
    }

    if (start >= end) {
      throw new Error('Start date must be before end date');
    }

    if (start < now) {
      throw new Error('Cannot create appointments in the past');
    }
  }
}
