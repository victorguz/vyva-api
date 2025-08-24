import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DynamooseModule } from 'nestjs-dynamoose';

import { JWT_EXPIRATION } from '../../core/config/environment.config';
import { UserSchema } from '../../schemas/user.schema';
import { CustomerSchema } from '../../schemas/customer.schema';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports: [
    ConfigModule,
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
      },
      {
        name: 'Customer',
        schema: CustomerSchema,
        options: {
          tableName: 'customers',
        },
        serializers: {
          frontend: {
            include: ['id', 'firstName', 'lastName', 'email', 'phone','createdAt'],
          },
        },
      },
    ]),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule, DynamooseModule],
})
export class SharedAuthModule {}
