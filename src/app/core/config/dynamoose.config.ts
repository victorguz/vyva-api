import { ConfigService } from '@nestjs/config';
import { DynamooseModuleOptions } from 'nestjs-dynamoose';

export const dynamooseConfig = (
  configService: ConfigService,
): DynamooseModuleOptions => {
  return {
    aws: {
      accessKeyId: configService.get('ACCESS_KEY_ID'),
      secretAccessKey: configService.get('SECRET_ACCESS_KEY'),
      region: configService.get('REGION'),
    },
    local: false,
    // logger: !isProduction,
    table: {
      prefix: `${configService.get('NODE_ENV')}-vyva-`,
      create: true,
      initialize: true,
      waitForActive: false,
    },
  };
};

export function getDatabasePrefix(configService: ConfigService): string {
  const env = configService.get('NODE_ENV');
  return `${env}-vyva`;
}
