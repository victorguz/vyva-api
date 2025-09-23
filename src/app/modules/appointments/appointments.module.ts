import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';

import { AppointmentSchema } from '../../schemas/appointment.schema';
import { SharedAuthModule } from '../shared/shared-auth.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    SharedAuthModule,
    DynamooseModule.forFeature([
      {
        name: 'Appointment',
        schema: AppointmentSchema,
        options: {
          tableName: 'appointments',
        },
      },
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
