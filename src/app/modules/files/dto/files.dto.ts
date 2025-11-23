import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'File name',
    example: 'profile-picture.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({
    description: 'File URL (S3 URL)',
    example: 'https://bucket.s3.amazonaws.com/businessId/public/file.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({
    description: 'S3 route/key',
    example: 'businessId/public/file.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  route?: string;

  @ApiProperty({
    description: 'Folder type: public or private',
    example: 'public',
    enum: ['public', 'private'],
    required: false,
  })
  @IsEnum(['public', 'private'])
  @IsOptional()
  folder?: 'public' | 'private';

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
    required: false,
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024,
    required: false,
  })
  @IsOptional()
  size?: number;
}

export class UpdateFileDto {
  @ApiProperty({
    description: 'File name',
    example: 'profile-picture.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({
    description: 'File URL (S3 URL)',
    example: 'https://bucket.s3.amazonaws.com/businessId/profile-pictures/file.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
    required: false,
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024,
    required: false,
  })
  @IsOptional()
  size?: number;
}

export class FindFileDto {
  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id!: string;
}

export class ListFileDto {
  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'File name',
    example: 'profile-picture.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({
    description: 'Folder type: public or private',
    example: 'public',
    required: false,
  })
  @IsString()
  @IsOptional()
  folder?: 'public' | 'private';
}

export class UploadFileDto {
  @ApiProperty({
    description: 'Folder type: public or private',
    example: 'public',
    enum: ['public', 'private'],
  })
  @IsEnum(['public', 'private'])
  @IsNotEmpty()
  folder!: 'public' | 'private';

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file!: any;
}

