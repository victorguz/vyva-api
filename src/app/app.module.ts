import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';

import { dynamooseConfig } from './core/config/dynamoose.config';
import { configModuleOptions } from './core/config/environment.config';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DomainsModule } from './modules/domains/domains.module';
import { FilesModule } from './modules/files/files.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ProductsModule } from './modules/products/products.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { UsersModule } from './modules/users/users.module';

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
    CustomersModule,
    UsersModule,
    ProductsModule,
    ProfileModule,
    SalesOrdersModule,
    AppointmentsModule,
    IntegrationsModule,
    FilesModule,
    BusinessesModule,
    DomainsModule,
  ],
})
export class AppModule {}
