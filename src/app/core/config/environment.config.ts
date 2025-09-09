import { ConfigModuleOptions } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import * as Joi from 'joi';

export enum Environment {
  Development = 'dev',
  Production = 'prd',
  Quality = 'qas',
}
export const JWT_EXPIRATION =
  process.env.NODE_ENV == Environment.Development ? '7d' : '24h';

export const isProduction: boolean =
  process.env.NODE_ENV == Environment.Production;

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsBoolean()
  ERROR_LOGS: boolean;

  // @IsString()
  // DB_DIALECT: string;

  // @IsString()
  // DB_USER: string;

  // @IsString()
  // DB_PASSWORD: string;

  // @IsString()
  // DB_NAME: string;

  // @IsString()
  // DB_HOST: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  SECRET_KEY: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  ADMIN_PHONE: string;

  @IsString()
  ADMIN_EMAIL: string;

  @IsString()
  IAM_SMTP: string;

  @IsString()
  SMTP_HOST: string;

  @IsString()
  SMTP_USER: string;

  @IsString()
  SMTP_PASSWORD: string;

  @IsString()
  EMAIL_SENDER: string;

  @IsString()
  ACCESS_KEY_ID: string;

  @IsString()
  SECRET_ACCESS_KEY: string;

  @IsString()
  REGION: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;
}
const validationSchema = Joi.object({
  NODE_ENV: Joi.string(),
  PORT: Joi.number(),
  ERROR_LOGS: Joi.boolean(),
  // DB_DIALECT: Joi.string(),
  // DB_USER: Joi.string(),
  // DB_PASSWORD: Joi.string(),
  // DB_NAME: Joi.string(),
  // DB_HOST: Joi.string(),
  // DB_PORT: Joi.number(),
  JWT_SECRET: Joi.string(),
  SECRET_KEY: Joi.string(),
  ADMIN_PHONE: Joi.string(),
  ADMIN_EMAIL: Joi.string(),
  IAM_SMTP: Joi.string(),
  SMTP_HOST: Joi.string(),
  SMTP_USER: Joi.string(),
  SMTP_PASSWORD: Joi.string(),
  EMAIL_SENDER: Joi.string(),
  ACCESS_KEY_ID: Joi.string().required(),
  SECRET_ACCESS_KEY: Joi.string().required(),
  REGION: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
});
function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw Error(errors.toString());
  }
  return validatedConfig;
}

export const configModuleOptions: ConfigModuleOptions = {
  validationSchema,
  validate,
  validationOptions: {
    allowUnknown: false,
    abortEarly: true,
  },
};
