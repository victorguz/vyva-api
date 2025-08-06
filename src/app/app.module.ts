import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { dynamooseConfig } from './core/config/dynamoose.config';
import { configModuleOptions } from './core/config/environment.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { ProfileModule } from './modules/profile/profile.module';

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
    UsersModule,
    ProductsModule,
    ProfileModule,
  ],
})
export class AppModule {}
