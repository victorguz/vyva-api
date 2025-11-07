import { ConfigService } from '@nestjs/config';
import { DynamooseModuleOptions } from 'nestjs-dynamoose';

export const dynamooseConfig = (
  configService: ConfigService,
): DynamooseModuleOptions => {
  const isLocal = configService.get('NODE_LOCAL') === 'true';

  const config: DynamooseModuleOptions = {
    aws: {
      accessKeyId: configService.get('ACCESS_KEY_ID') ,
      secretAccessKey: configService.get('SECRET_ACCESS_KEY') ,
      region: configService.get('REGION') ,
    },
    table: {
      prefix: `${configService.get('NODE_ENV')}-vyva-`,
      create: true,
      initialize: true,
      waitForActive: false,
    },
  };

  // Configure for local DynamoDB when NODE_LOCAL is true
  if (isLocal) {
    config.local = false;
    // config.local = 'http://localhost:8000';
    // config.aws = {
    //   accessKeyId: 'local',
    //   secretAccessKey: 'local',
    //   region: 'us-east-1',
    // };
  } else {
    config.local = false;
  }

  return config;
};
