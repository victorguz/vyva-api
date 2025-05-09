import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
  IsIn,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  maxEmailLength,
  maxGenericCharacters,
  maxNameLength,
} from '../../../core/constants/generic.constants';
import { UserRole } from 'src/app/core/constants/domain.constants';
import { User } from '../../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password?: string;

  @ApiProperty({
    description: 'Document type of the user',
    example: 'DNI',
  })
  @IsString()
  @IsNotEmpty()
  documentType?: string;

  @ApiProperty({
    description: 'Document number of the user',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  documentNumber?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  phone?: string;

  @IsString()
  @ApiProperty()
  gender?: string;

  @IsDateString()
  @ApiProperty({ description: '2020-07-10 15:00:00.000' })
  dateOfBirth?: string;

  @IsString()
  @ApiProperty()
  country?: string;

  @IsString()
  @ApiProperty()
  city?: string;

  @IsString()
  @ApiProperty()
  address?: string;

  @IsString()
  @ApiProperty()
  personType?: string;

  @IsBoolean()
  @ApiProperty()
  status?: boolean = true;

  @IsIn(Object.values(UserRole))
  @ApiProperty({ enum: UserRole })
  role?: UserRole = UserRole.customer;

  @IsObject()
  @ApiProperty()
  data?: any;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Document type of the user',
    example: 'DNI',
    required: false,
  })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty({
    description: 'Document number of the user',
    example: '12345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsIn(Object.values(UserRole))
  @IsOptional()
  @ApiProperty({ enum: UserRole })
  role?: UserRole;
}

export class FindOneUserDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiProperty()
  id?: string;

  @IsEmail()
  @MaxLength(maxEmailLength)
  @IsOptional()
  @ApiProperty()
  email?: string;
}

export class UpdateUserAccountDto {
  @IsString()
  @MaxLength(maxNameLength)
  @ApiProperty()
  firstName: string;

  @IsString()
  @MaxLength(maxNameLength)
  @ApiProperty()
  lastName: string;

  @MaxLength(maxGenericCharacters)
  @IsPhoneNumber('CO')
  @IsOptional()
  @IsString()
  @ApiProperty()
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  gender?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ description: '2020-07-10 15:00:00.000' })
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  country?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  address?: string;
}

export class GetUsersForAuthenticateDto {
  @IsString()
  @MaxLength(maxNameLength)
  @IsOptional()
  @ApiProperty()
  name: string | null;

  @IsString()
  @ApiProperty()
  documentType: string;

  @IsNumberString()
  @MaxLength(maxGenericCharacters)
  @IsOptional()
  @ApiProperty()
  documentNumber: string | null;
}

export class UserResponseDto implements User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: string;
  documentNumber: string;
  phone?: string;
  role: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateProfileDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
