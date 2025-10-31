import { Module } from '@nestjs/common';

import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { SharedModule } from '../shared/shared.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    SharedModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, SalesOrdersService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
