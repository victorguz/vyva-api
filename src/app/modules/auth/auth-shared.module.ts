import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSchema } from '../../entities/user.entity';
import { JWT_EXPIRATION } from '../../core/config/environment.config';
import { AuthGuard } from './guards/auth.guard';

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
    ]),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthSharedModule {}
