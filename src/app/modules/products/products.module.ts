import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductSchema } from '../../entities/product.entity';
import { SharedAuthModule } from '../shared/shared-auth.module';

@Module({
  imports: [
    SharedAuthModule,
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
