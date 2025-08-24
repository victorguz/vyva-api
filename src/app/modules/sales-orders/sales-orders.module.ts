import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';

import { ProductSchema } from '../../schemas/product.schema';
import { SalesOrderSchema } from '../../schemas/sales-order.schema';
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
      {
        name: 'Product',
        schema: ProductSchema,
        options: {
          tableName: 'products',
        },
      },
    ]),
  ],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
