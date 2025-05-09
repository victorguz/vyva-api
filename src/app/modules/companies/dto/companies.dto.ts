import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  maxEmailLength,
  maxGenericCharacters,
  maxNameLength,
} from '../../../core/constants/generic.constants';
import { UserDocumentType } from 'src/app/core/constants/domain.constants';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(maxNameLength)
  @ApiProperty()
  name: string;

  @IsString()
  @IsIn(Object.values(UserDocumentType))
  @ApiProperty({ enum: UserDocumentType })
  documentType: string;

  @IsNumberString()
  @MaxLength(maxGenericCharacters)
  @ApiProperty()
  documentNumber: string;

  @IsEmail()
  @MaxLength(maxEmailLength)
  @ApiProperty()
  email: string;

  @MaxLength(maxGenericCharacters)
  @IsPhoneNumber('CO')
  @IsOptional()
  @IsString()
  @ApiProperty()
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  country?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  status: boolean = true;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class FindOneCompanyDto {
  @IsInt()
  @IsPositive()
  @ApiProperty()
  id: number;
}
