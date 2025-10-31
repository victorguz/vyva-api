import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';

import { ProductSchema } from '../../schemas/product.schema';
import { SharedModule } from '../shared/shared.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    SharedModule,
    DynamooseModule.forFeature([
      {
        name: 'Product',
        schema: ProductSchema,
        options: {
          tableName: 'products',
        },
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
