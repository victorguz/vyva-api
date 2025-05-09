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
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  maxEmailLength,
  maxGenericCharacters,
  maxNameLength,
} from '../../../core/constants/generic.constants';
import { UserDocumentType } from 'src/app/core/constants/domain.constants';

export class CreateAgencyDto {
  @ApiProperty({
    description: 'Name of the agency',
    example: 'Main Branch',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(maxNameLength)
  name: string;

  @ApiProperty({
    description: 'Document type of the agency',
    example: 'RUC',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(UserDocumentType))
  documentType: string;

  @ApiProperty({
    description: 'Document number of the agency',
    example: '20123456789',
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(maxGenericCharacters)
  documentNumber: string;

  @IsEmail()
  @MaxLength(maxEmailLength)
  @ApiProperty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the agency',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(maxGenericCharacters)
  @IsPhoneNumber('CO')
  phone?: string;

  @ApiProperty({
    description: 'Address of the agency',
    example: '123 Main St',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ApiProperty()
  address?: string;

  @ApiProperty({
    description: 'City of the agency',
    example: 'Lima',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ApiProperty()
  city?: string;

  @ApiProperty({
    description: 'Country of the agency',
    example: 'Peru',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ApiProperty()
  country?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  status: boolean = true;

  @IsInt()
  @IsPositive()
  @ApiProperty()
  idCompany: number;
}

export class UpdateAgencyDto extends PartialType(CreateAgencyDto) {}

export class FindOneAgencyDto {
  @IsInt()
  @IsPositive()
  @ApiProperty()
  id: number;
}
