import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { BusinessInfoService } from './business-info.service';
import { BusinessInfoController } from './business-info.controller';
import { BusinessInfoSchema } from '../../entities/business-info.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_EXPIRATION } from '../../core/config/environment.config';

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
        name: 'BusinessInfo',
        schema: BusinessInfoSchema,
        options: {
          tableName: 'business_info',
        },
      },
    ]),
  ],
  controllers: [BusinessInfoController],
  providers: [BusinessInfoService],
  exports: [BusinessInfoService],
})
export class BusinessInfoModule {}
