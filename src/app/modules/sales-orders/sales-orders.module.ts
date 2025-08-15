import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';

import { SalesOrderSchema } from '../../entities/sales-order.entity';
import { SharedAuthModule } from '../shared/shared-auth.module';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';

@Module({
  imports: [
    SharedAuthModule,
    DynamooseModule.forFeature([
      {
        name: 'SalesOrder',
        schema: SalesOrderSchema,
        options: {
          tableName: 'sales-orders',
        },
      },
    ]),
  ],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
