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
      let appointment: Appointment | null = null;
      if (body.startDate && body.endDate) {
        appointment = (await this.model.create({
          id: uuidv4(),
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          idService: body.idService,
          idCustomer: body.idCustomer,
          idEmployee: body.idEmployee,
          idOrder: body.idOrder,
          status: AppointmentStatus.pending,
          businessInfoId: user.businessInfoId,
          createdBy: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) as Appointment;
      }


      const appointmentResult = await this.model.get({ id: appointment.id });
      // Return the created appointment
      return new GenericResponse(appointmentResult);
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
        throw new Error('MS014');
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

      if (filters?.idOrder) {
        query = query.where('idOrder').eq(filters.idOrder);
      }

      if (filters?.status) {
        query = query.where('status').eq(filters.status);
      }

      // Always filter by business
      query = query.where('businessInfoId').eq(user.businessInfoId);

      // Apply date range filters
      if (filters?.startDate) {
        query = query
          .where('startDate')
          .ge(new Date(filters.startDate).getTime());
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

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: User,
  ): Promise<GenericResponse<Appointment>> {
    try {
      // Validate id
      if (!id) {
        throw new Error('MS014');
      }

      // Clean the DTO first to remove undefined/null values
      const cleanedDto = deleteEmptyProperties(updateAppointmentDto);

      // Validate dates if provided
      if (cleanedDto.startDate && cleanedDto.endDate) {
        this.validateAppointmentDates(cleanedDto.startDate, cleanedDto.endDate);
      }

      const appointmentResult = await this.model
        .scan()
        .where('id')
        .eq(id)
        .where('businessInfoId')
        .eq(user.businessInfoId)
        .exec();
      if (!appointmentResult || appointmentResult.length === 0) {
        throw new Error('MS007');
      }
      const appointment = appointmentResult[0];

      // Convert date strings to Date objects if provided
      if (cleanedDto.startDate) {
        cleanedDto.startDate = new Date(cleanedDto.startDate) as any;
      }
      if (cleanedDto.endDate) {
        cleanedDto.endDate = new Date(cleanedDto.endDate) as any;
      }

      await this.model.update({ id: appointment.id }, cleanedDto);
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
        throw new Error('MS014');
      }
      if (!updateStatusDto.status) {
        throw new Error('MS014');
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

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('MS042');
    }

    if (start >= end) {
      throw new Error('MS041');
    }
  }
}
