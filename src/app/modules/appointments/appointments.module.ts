import { Module } from '@nestjs/common';

import { CustomersModule } from '../customers/customers.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { ProductsModule } from '../products/products.module';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    SharedModule,
    IntegrationsModule,
    CustomersModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, SalesOrdersService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
