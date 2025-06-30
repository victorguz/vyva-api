import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { dynamooseConfig } from './core/config/dynamoose.config';
import { configModuleOptions } from './core/config/environment.config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        dynamooseConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
