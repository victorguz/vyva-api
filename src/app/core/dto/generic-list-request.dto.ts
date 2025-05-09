import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export interface GenericListRequestDto {
  filterStart?: Date;
  filterEnd?: Date;
}

export class GenericListRequestDtoI implements GenericListRequestDto {
  @IsDateString()
  @IsOptional()
  @ApiProperty()
  filterStart?: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  filterEnd?: Date;
}
