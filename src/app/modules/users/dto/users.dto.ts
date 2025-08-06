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

// NOTE: BusinessInfo has been moved to its own module in src/app/modules/business-info
// User entity now references BusinessInfo via businessInfoId

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
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Cell phone number of the user',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  cellPhone?: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '123 Main St',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'City of the user',
    example: 'New York',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Type of person (natural or legal)',
    example: 'natural',
    required: false,
    default: 'natural',
  })
  @IsString()
  @IsOptional()
  typePerson?: string = 'natural';

  @ApiProperty({
    description: 'Gender of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '2020-07-10 15:00:00.000',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Country of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Status of the user',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;

  @ApiProperty({
    description: 'Role of the user',
    enum: UserRole,
    default: UserRole.customer,
    required: false,
  })
  @IsIn(Object.values(UserRole))
  @IsOptional()
  role?: UserRole = UserRole.customer;

  @ApiProperty({
    description: 'Google ID of the user',
    example: '123456789012345678901',
    required: false,
  })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiProperty({
    description: 'Is verified',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = false;

  @ApiProperty({
    description: 'Profile picture URL of the user',
    example: 'https://lh3.googleusercontent.com/a/profile-picture-url',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    description: 'Business Info ID',
    example: 'b9c0e5c0-5c9b-11eb-ae93-0242ac130002',
    required: false,
  })
  @IsString()
  @IsOptional()
  businessInfoId?: string;

  @ApiProperty({
    description: 'Additional data',
    required: false,
  })
  @IsObject()
  @IsOptional()
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
    description: 'Email of the user',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

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

  @ApiProperty({
    description: 'City of the user',
    example: 'New York',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '123 Main St',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Country of the user',
    example: 'USA',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Type of person (natural or legal)',
    example: 'natural',
    required: false,
  })
  @IsString()
  @IsOptional()
  typePerson?: string;

  @ApiProperty({
    description: 'Status of the user',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
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
  typePerson?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  googleId?: string;
  profilePicture?: string;
  businessInfoId?: string;
  epaycoCustomerId?: string;
  data?: any;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
