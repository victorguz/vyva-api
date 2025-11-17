import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AppointmentSchema } from 'src/app/schemas/appointment.schema';
import { IntegrationSchema } from 'src/app/schemas/integration.schema';
import { ProductSchema } from 'src/app/schemas/product.schema';
import { SalesOrderSchema } from 'src/app/schemas/sales-order.schema';

import { JWT_EXPIRATION } from '../../core/config/environment.config';
import { BusinessSchema } from '../../schemas/business.schema';
import { CustomerSchema } from '../../schemas/customer.schema';
import { FileSchema } from '../../schemas/file.schema';
import { UserSchema } from '../../schemas/user.schema';
import { S3Service } from '../../shared/s3.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: JWT_EXPIRATION,
        },
      }),
      inject: [ConfigService],
    }),
    DynamooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        options: {
          tableName: 'users',
        },
        serializers: {
          frontend: {
            include: [
              'id',
              'firstName',
              'lastName',
              'email',
              'phone',
              'createdAt',
              'role',
            ],
          },
        },
      },
      {
        name: 'Customer',
        schema: CustomerSchema,
        options: {
          tableName: 'customers',
        },
        serializers: {
          frontend: {
            include: [
              'id',
              'firstName',
              'lastName',
              'email',
              'phone',
              'createdAt',
            ],
          },
        },
      },

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
      {
        name: 'Integration',
        schema: IntegrationSchema,
        options: {
          tableName: 'integrations',
        },
      },
      {
        name: 'File',
        schema: FileSchema,
        options: {
          tableName: 'files',
        },
      },
      {
        name: 'Business',
        schema: BusinessSchema,
        options: {
          tableName: 'businesses',
        },
      },
    ]),
  ],
  providers: [AuthGuard, S3Service],
  exports: [AuthGuard, JwtModule, DynamooseModule, ConfigModule, HttpModule, S3Service],
})
export class SharedModule {}
