import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ProductSchema } from 'src/app/schemas/product.schema';
import { SalesOrderSchema } from 'src/app/schemas/sales-order.schema';

import { AppointmentSchema } from '../../schemas/appointment.schema';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
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

      {
        name: 'SalesOrder',
        schema: SalesOrderSchema,
        options: {
          tableName: 'sales-orders',
        },
      },
      {
        name: 'Product',
        schema: ProductSchema,
        options: {
          tableName: 'products',
        },
      },
    ]),

  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, SalesOrdersService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
