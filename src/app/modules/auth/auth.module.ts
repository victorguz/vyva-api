import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DynamooseModule } from 'nestjs-dynamoose';
import { JWT_EXPIRATION } from 'src/app/core/config/environment.config';
import { UserSchema } from 'src/app/schemas/user.schema';
import { SharedModule } from 'src/app/shared/shared.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    SharedModule,
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
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
